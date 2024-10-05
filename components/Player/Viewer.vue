<template>
    <div
        class="player"
        ref="viewport"
        @keydown="didKeyDown"
        @keyup="didKeyUp"
        @mouseup="didMouseUp"
    >
        <p v-if="showPlayerDevtools" class="player-dev">
            Portal ID: {{ portal.id || 'N/A' }}
            <br>
            Portal Status: {{ portal.status }}
        </p>

        <video
            id="remoteStream"
            ref="videoStream"
            class="player-stream"
            tabindex="1"
            disablepictureinpicture
            loop
            muted
            playsinline
            :style="playerStyle"

            @mousemove="didMouseMove"
            @mousedown="didMouseDown"
            @wheel="didMouseWheel"
            @contextmenu="handleRightClick"
            @paste="didPaste"
            @playing="cleanVideoErrors"
            @pause="resumeStream"
            @error="videoPlayerError"
            @stalled="videoLoading = true"
            @waiting="videoLoading = true"
            @suspend="videoLoading = true"
            @ended="videoLoading = true"
            @canplay="resumeStream"
        />
        <audio
            id="remoteAudio"
            ref="audioStream"
            @playing="cleanAudioErrors"
            @pause="resumeStream"
            @error="audioPlayerError"
            @stalled="audioLoading = true"
            @waiting="audioLoading = true"
            @suspend="audioLoading = true"
            @ended="audioLoading = true"
            @canplay="resumeStream"
        />

        <div v-if="showPopup" class="player-message-cover">
            <div v-if="loading" class="logo-big logo-mask is-loading" />
            <div v-else class="player-message">
                <h1 v-if="!showMutedPopup" class="title">
                    {{ brand.name }} has a little issue...
                </h1>

                <p v-if="showUnsupportedPopup" class="body">
                    Your browser seems to be having trouble trying to play your stream.
                </p>
                <p v-else-if="!showMutedPopup" class="body">
                    An error has occurred, and it's not letting us play your stream.
                </p>
                <p v-if="videoPlayError" class="error">
                    video: {{ videoPlayError }}
                </p>
                <p v-if="audioPlayError" class="error">
                    audio: {{ audioPlayError }}
                </p>

                <Button v-if="showMutedPopup" @click.native="unmute()">
                    Play
                </Button>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import Janus from 'janus-gateway'

    import brand from '~/brand/config'

    import Button from '~/components/Button'

    export default {
        components: {
            Button
        },
        props: {
            volume: Number
        },
        data() {
            return {
                brand,
                activeKeyEvent: null,
                showMutedPopup: false,
                isVideoUnsupported: false,
                isAudioUnsupported: false,
                videoPlayError: null,
                audioPlayError: null,
                maxWidth: 1366,
                maxHeight: 768,
                videoSize: [this.maxWidth, this.maxHeight],
                videoLoading: true,
                audioLoading: true,
                janusEndpoint: process.env.JANUS_URL.split(','),
                iceServers: [],
                viewerClientRect: null
            }
        },
        computed: {
            ...mapGetters(['ws', 'userId', 'controlLocked', 'controllerId', 'portal', 'janusId', 'janusIp',
                 'viewerMuted', 'viewerVolume', 'fullscreen', 'pip']),

            hasControl() {
                return this.controllerId === this.userId
            },
            showUnsupportedPopup() {
                return this.showVideoUnsupportedPopup || this.showAudioUnsupportedPopup
            },
            showPopup() {
                return this.loading || this.showMutedPopup || this.showUnsupportedPopup || this.videoPlayError || this.audioPlayError
            },
            streamWidth() {
                if (this.videoSize)
                    return this.videoSize[0]
                else
                    return this.maxWidth
            },
            streamHeight() {
                if (this.videoSize)
                    return this.videoSize[1]
                else
                    return this.maxHeight
            },

            showPlayerDevtools() {
                return process.env.SHOW_PLAYER_DEVTOOLS && this.portal
            },
            canControlPlayer() {
                return this.$refs.videoStream && this.$refs.videoStream.nodeName === 'VIDEO'
            },
            canPiP() {
                if (process.server)
                    return false

                return ('pictureInPictureEnabled' in document && document.pictureInPictureEnabled)
            },
            loading() {
                return this.videoLoading || this.audioLoading
            },

            playerStyle() {
                if (!this.viewerClientRect)
                    return 'width: auto; height: 100%;'

                if (this.viewerClientRect.height / this.streamHeight < this.viewerClientRect.width / this.streamWidth)
                    return 'width: auto; height: 100%;'
                else
                    return 'width: 100%; height: auto;'
            }
        },
        mounted() {
            document.addEventListener('visibilitychange', this.handleVisibilityChange)
            window.addEventListener('resize', this.handleResize)

            if (this.viewerMuted) {
                this.$refs.audioStream.muted = true
                this.$refs.audioStream.volume = 0.0
            } else {
                this.$refs.audioStream.muted = false
                this.$refs.audioStream.volume = this.viewerVolume
            }

            // ToDo: refactor the entirety of this
            if (process.env.ENABLE_TURN) {
                const servers = process.env.TURN_URL.toString().split(',')
                const users = process.env.TURN_USERNAME.toString().split(',')
                const passwords = process.env.TURN_PASSWORD.toString().split(',')

                this.iceServers = servers.map((serv, i) => {
                    const server = { urls: serv }
                    if (users[i] && passwords[i]) {
                        server.username = users[i]
                        server.credential = passwords[i]
                    }
                    return server
                })
            }
            if (this.iceServers.length === 0)
                this.iceServers = [{ urls: 'stun:stun.cloudflare.com:3478' }]

            this.unsubscribe = this.$store.subscribe(({ type }, { stream }) => {
                switch(type) {
                    case 'updateJanus':
                        this.$nextTick(this.initJanus)
                        break
                    case 'setMutedStatus':
                        this.setStreamMutedStatus()
                        break
                    case 'setViewerVolume':
                        this.setStreamVolume()
                        break
                    case 'setPiPStatus':
                        this.togglePiP()
                        break
                    case 'disconnectWebSocket':
                        this.cleanPlayers()
                        break
                }
            })

            if (this.canPiP) {
                this.pipStream = document.createElement('video')
                this.pipStream.muted = true
                this.pipStream.addEventListener('enterpictureinpicture', this.enterPiP)
                this.pipStream.addEventListener('leavepictureinpicture', this.leavePiP)
            }
        },
        beforeDestroy() {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange)
            window.removeEventListener('resize', this.handleResize)
            if (this.pipStream) {
                this.leavePiP()
                this.pipStream.removeEventListener('enterpictureinpicture', this.enterPiP)
                this.pipStream.removeEventListener('leavepictureinpicture', this.leavePiP)
            }

            this.cleanPlayers()
            this.unsubscribe()
        },
        methods: {
            async resumeStream() {
                if (!this.$refs.videoStream || !this.$refs.audioStream)
                    return console.warn('asked to resume stream when stream is not present')

                try {
                    if (this.$refs.audioStream.readyState >= 3)
                        await this.$refs.audioStream.play()
                    else
                        console.debug('audio not ready yet')
                } catch (error) {
                    this.audioPlayerError(error)
                }
                try {
                    if (this.$refs.videoStream.readyState >= 3)
                        await this.$refs.videoStream.play()
                    else
                        console.debug('video not ready yet')
                } catch (error) {
                    this.videoPlayerError(error)
                }
            },
            videoPlayerError(error) {
                console.error('video player error', error)
                this.videoLoading = false

                let message = error.message || error.name || error.target?.error?.message

                switch (error.name) {
                    case 'NotAllowedError':
                        this.showMutedPopup = true
                        break
                    case 'NotSupportedError':
                        this.isVideoUnsupported = true
                        this.videoPlayError = message
                        break
                    case 'AbortError':
                        console.debug('video AbortError')
                        this.videoLoading = true
                        break
                    default:
                        this.videoPlayError = message
                        break
                }
            },
            audioPlayerError(error) {
                console.error('audio player error', error)
                this.audioLoading = false

                let message = error.message || error.name || error.target?.error?.message

                switch (error.name) {
                    case 'NotAllowedError':
                        this.showMutedPopup = true
                        break
                    case 'NotSupportedError':
                        this.isAudioUnsupported = true
                        this.audioPlayError = message
                        break
                    case 'AbortError':
                        console.debug('audio AbortError')
                        this.audioLoading = true
                        break
                    default:
                        this.audioPlayError = message
                        break
                }
            },
            cleanVideoErrors() {
                this.videoLoading = false
                this.isVideoUnsupported = false
                this.videoPlayError = null
                if (this.$refs.videoStream.videoWidth && this.$refs.videoStream.videoHeight) {
                    this.videoSize = [this.$refs.videoStream.videoWidth, this.$refs.videoStream.videoHeight]
                    this.handleResize()
                }
            },
            cleanAudioErrors() {
                this.audioLoading = false
                this.showMutedPopup = false
                this.isAudioUnsupported = false
                this.audioPlayError = null
            },

            unmute() {
                if (this.$refs.audioStream) {
                    this.$refs.audioStream.volume = this.viewerVolume
                    this.resumeStream()
                }
                this.showMutedPopup = false
            },
            volumeChange() {
                // ToDo: change how this works to prevent recursions
                // and resource wasting, but keeping the player controls updated.
                this.viewerMuted = this.$refs.audioStream.muted
                this.viewerVolume = this.$refs.audioStream.volume
            },

            togglePiP() {
                if (!this.canPiP || !this.canControlPlayer || !this.$refs.videoStream || !this.pipStream)
                    return console.warn('tried to toggle picture-in-picture while not available')

                if (this.pip) {
                    this.pipStream.srcObject = this.$refs.videoStream.srcObject
                    const ready = () => {
                      this.pipStream.removeEventListener('playing', ready)
                      this.pipStream.requestPictureInPicture()
                    }
                    this.pipStream.addEventListener('playing', ready)
                    this.pipStream.play()
                } else if (document.pictureInPictureElement === this.pipStream)
                    document.exitPictureInPicture()
            },

            enterPiP() {
                this.$store.commit('setPiPStatus', true)
            },

            leavePiP() {
                this.$store.commit('setPiPStatus', false)
                this.pipStream.srcObject = undefined
                this.pipStream.pause()
            },

            initJanus() {
                this.cleanPlayers()

                if (!this.$refs.videoStream || !this.$refs.audioStream)
                    return console.warn('Stream cannot be found, refusing to start player!')

                console.log('Janus init!!')

                Janus.init({
                    debug: true,
                    dependencies: Janus.useDefaultDependencies(),
                    callback: this.configureJanus
                })
            },

            /*
            * We should, ideally, have the API/Portals server handle gathering TURN/STUN information and receive the values here.
            * this will allow us to enable TURN REST API in order to obtain short-lived session and keep TURN server access limited to Cryb.
            * this needs to be accompanied by the ability to request an ICE restart in order to switch the TURN sessions.
            */

            configureJanus() {
                this.player = new Janus({
                    server: this.janusEndpoint,
                    iceServers: this.iceServers,
                    max_poll_events: 2,
                    destroyOnUnload: false,
                    success: this.janusSessionConnected,
                    error: this.janusError
                })
            },

            janusSessionConnected() {
                this.player.attach({
                    plugin: 'janus.plugin.streaming',
                    success: this.janusHandleCreated,
                    error: this.janusError,
                    onmessage: this.janusHandleMessages,
                    onremotetrack: this.janusHandleIncomingStream
                })
            },

            janusHandleCreated(handle) {
                this.janusHandle = handle
                this.janusHandle.send({
                    message: {
                        request: 'watch',
                        id: this.janusId
                    }
                })
            },

            janusHandleMessages(msg, jsep) {
                if (!jsep) return
                console.log('Janus streaming negotiated. Connecting peer.')

                this.janusHandle.createAnswer({
                    jsep,
                    tracks: [],
                    customizeSdp: jsep => {
                        // make sure we enable stereo in case it is missing.
                        // improves audio quality on Chromium-based browsers
                        if (jsep.sdp.indexOf('stereo=1') == -1)
                            jsep.sdp = jsep.sdp.replace('useinbandfec=1', 'useinbandfec=1;stereo=1')
                    },
                    success: this.janusHandleConfigure,
                    error: this.janusError
                })
            },

            janusHandleIncomingStream(track, mid, on, metadata) {
                if (!this.$refs.videoStream || !this.$refs.audioStream) {
                    if (on) {
                        console.warn('Stream cannot be found, destroying player!')
                        this.cleanPlayers()
                    }
                    return // can also run in off, but during player destroy
                }
                if (!on) return

                const stream = new MediaStream([track])

                try {
                    this.$refs[`${track.kind}Stream`].srcObject = stream
                } catch(error) {
                    this[`${track.kind}PlayerError`](error)
                }
            },

            janusHandleConfigure(jsep) {
                console.log('Configuring the Janus stream - let it in!')

                this.janusHandle.send({
                    message: {
                        request: 'configure',
                        streams: [
                            // video
                            {
                                mid: '100',
                                send: true,
                                min_delay: 0,
                                max_delay: 0
                            },
                            // audio
                            {
                                mid: '101',
                                send: true,
                                min_delay: 0,
                                max_delay: 0
                            }
                        ]
                    },
                    jsep
                })
            },

            janusError(reason) {
                console.error('Janus error:', reason)
                if (reason === 'Library not initialized')
                    this.$nextTick(this.initJanus)
            },

            handleVisibilityChange() {
                if (document.hidden && this.activeKeyEvent)
                    this.didKeyUp(this.activeKeyEvent)
            },
            handleResize() {
                if (!this.$refs.viewport) return
                this.viewerClientRect = this.$refs.viewport.getBoundingClientRect()
            },

            handleRightClick(event) {
                event.preventDefault()
            },
            didPaste(event) {
                if (!this.hasControl || this.controlLocked)
                    return

                const { clipboardData } = event,
                        text = clipboardData.getData('text/plain')

                this.emitEvent({ text }, 'PASTE_TEXT')
            },
            didKeyDown(event) {
                event.preventDefault()
                if (!this.hasControl || this.controlLocked)
                    return

                const { key, ctrlKey, shiftKey } = event
                this.activeKeyEvent = event

                if (window.isSecureContext) {
                    if (ctrlKey && key === 'v') {
                        if (navigator.clipboard && navigator.clipboard.readText)
                            return navigator.clipboard.readText().then(text => this.emitEvent({ text }, 'PASTE_TEXT'))
                        else
                            return alert('Cryb can\'t access your clipboard as your browser is unsupported.')
                    }
                } else
                    return alert('Cryb can\'t access your clipboard since you\'re not using HTTPS on this instance, which is required by your browser.')

                this.emitEvent({ key, ctrlKey, shiftKey }, 'KEY_DOWN')
            },
            didKeyUp(event) {
                event.preventDefault()
                if (!this.hasControl || this.controlLocked)
                    return

                const { key, ctrlKey, shiftKey } = event

                if (ctrlKey && key === 'v')
                    return // never sent to portal anyway

                this.emitEvent({ key, ctrlKey, shiftKey }, 'KEY_UP')
            },
            didMouseMove(event) {
                if (!this.hasControl || this.controlLocked)
                    return

                const { x, y } = this.calculatePos(event)

                this.emitEvent({ x, y }, 'MOUSE_MOVE')
            },
            didMouseDown(event) {
                if (!this.hasControl || this.controlLocked)
                    return

                const { button } = event,
                    { x, y } = this.calculatePos(event)

                this.emitEvent({ x, y, button: button + 1 }, 'MOUSE_DOWN')
            },
            didMouseUp(event) {
                if (!this.hasControl || this.controlLocked)
                    return

                const { button } = event,
                      { x, y } = this.calculatePos(event)

                this.emitEvent({ x, y, button: button + 1 }, 'MOUSE_UP')
            },
            didMouseWheel(event) {
                event.preventDefault()
                if (!this.hasControl || this.controlLocked)
                    return

                const { deltaY } = event

                this.emitEvent({ scrollUp: deltaY > 0 }, 'MOUSE_SCROLL')
            },

            emitEvent(d, t) {
                if (!this.ws || this.ws.readyState !== this.ws.OPEN)
                    return

                this.ws.send(JSON.stringify({ op: 0, d, t }))
            },

            calculatePos(event) {
                const x = this.calculateXPos(event),
                        y = this.calculateYPos(event)

                return { x, y }
            },
            calculateXPos(event) {
                const { clientX, target } = event,
                    rect = target.getBoundingClientRect(),
                    xPos = clientX - rect.left

                return Math.round(this.streamWidth * (xPos / target.clientWidth))
            },
            calculateYPos(event) {
                const { clientY, target } = event,
                    rect = target.getBoundingClientRect(),
                    yPos = clientY - rect.top

                return Math.round(this.streamHeight * (yPos / target.clientHeight))
            },

            // ToDo: re-work how this works
            setStreamMutedStatus() {
                if (!this.canControlPlayer)
                    return

                if (this.viewerMuted)
                    this.$refs.audioStream.muted = true
                else {
                    this.$refs.audioStream.muted = false
                    this.$refs.audioStream.volume = this.viewerVolume
                }
            },

            setStreamVolume() {
                if (!this.canControlPlayer)
                    return

                if (!this.viewerMuted) {
                    this.$refs.audioStream.muted = false
                    this.$refs.audioStream.volume = this.viewerVolume
                }
            },

            cleanPlayers() {
                if (this.$refs.videoStream)
                    this.$refs.videoStream.srcObject = undefined
                if (this.$refs.audioStream)
                    this.$refs.audioStream.srcObject = undefined

                if (this.player) {
                    if (this.janusHandle) {
                        this.janusHandle.send({
                            message: {
                                request: 'stop'
                            }
                        })
                        this.janusHandle.detach()
                    }

                    this.player.destroy()
                }
            }
        }
    }
</script>
