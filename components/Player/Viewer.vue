<template>
    <div class="player" ref="viewport" :class="{ 'capture-events': hasControl }">
        <p v-if="showPlayerDevtools" class="player-dev">
            Portal ID: {{ portal.id || 'N/A' }}
            <br>
            Portal Status: {{ portal.status }}
        </p>

        <canvas
            id="canvasStream"
            ref="canvasStream"
            class="player-stream"
            :style="playerStyle"
        />
        <video
            id="remoteStream"
            ref="stream"
            class="player-stream"
            tabindex="1"
            playsinline
            loop
            :style="playerStyle"
            @keydown="didKeyDown"
            @keyup="didKeyUp"
            @mousemove="didMouseMove"
            @mousedown="didMouseDown"
            @mouseup="didMouseUp"
            @wheel="didMouseWheel"
            @contextmenu="handleRightClick"
            @paste="didPaste"
            @playing="cleanErrors"
            @pause="resumeStream"
            @error="playerError"
            @stalled="loading = true"
            @waiting="loading = true"
            @suspend="loading = true"
            @ended="loading = true"
            @canplay="resumeStream"
            @enterpictureinpicture="enterPiP"
            @leavepictureinpicture="leavePiP"
        />

        <div v-if="showPopup" class="player-message-cover">
            <div v-if="loading" class="logo-big logo-mask is-loading" />
            <div v-else class="player-message">
                <h1 v-if="!showMutedPopup" class="title">
                    {{ brand.name }} has a little issue...
                </h1>

                <p v-if="showUnsupportedPopup" class="body">
                    Your browser seems to be running into trouble trying to play your stream.
                </p>
                <p v-else-if="!showMutedPopup" class="body">
                    An error has occurred, and it's not letting us play your stream.
                </p>
                <p v-if="playError" class="error">
                    {{ playError }}
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

    import brand from '~/brand/config'

    import Button from '~/components/Button'

    export default {
        components: {
            Button
        },
        props: {
            volume: Number,
            loadedScripts: Array
        },
        data() {
            return {
                brand,
                activeKeyEvent: null,
                showMutedPopup: false,
                showUnsupportedPopup: false,
                playError: null,
                scriptReadyCallbacks: [],
                maxWidth: 1280,
                maxHeight: 720,
                loading: true,
                updateCanvas: false,
                iceServers: []
            }
        },
        computed: {
            ...mapGetters(['ws', 'userId', 'controlLocked', 'controllerId', 'portal', 'janusId', 'janusIp', 'apertureWs',
                 'apertureToken', 'viewerMuted', 'viewerVolume', 'fullscreen', 'pip']),

            hasControl() {
                return this.controllerId === this.userId
            },
            showPopup() {
                return this.loading || this.showMutedPopup || this.showUnsupportedPopup || this.playError
            },
            streamWidth() {
                if (this.$refs.stream)
                    return this.$refs.stream.videoWidth
                else
                    return this.maxWidth
            },
            streamHeight() {
                if (this.$refs.stream)
                    return this.$refs.stream.videoHeight
                else
                    return this.maxHeight
            },

            showPlayerDevtools() {
                return process.env.SHOW_PLAYER_DEVTOOLS && this.portal
            },
            isJanusEnabled() {
                return process.env.ENABLE_JANUS
            },
            canControlPlayer() {
                return this.$refs.stream && this.$refs.stream.nodeName === 'VIDEO'
            },
            canPiP() {
                if (process.server)
                    return false

                return ('pictureInPictureEnabled' in document && document.pictureInPictureEnabled)
            },

            playerStyle() {
                if (!this.$refs.viewport)
                    return 'width: auto; height: 100%'

                const currentRect = this.$refs.viewport.getBoundingClientRect()
                if (currentRect.height / this.streamHeight < currentRect.width / this.streamWidth)
                    return 'width: auto; height: 100%'
                else
                    return 'width: 100%; height: auto'
            }
        },
        watch: {
            loadedScripts: {
                immediate: true,
                handler(newVal, oldVal) {
                    if (this.scriptReadyCallbacks.length > 0)
                        this.scriptReadyCallbacks.forEach(callback => callback(newVal))
                }
            }
        },
        mounted() {
            document.addEventListener('visibilitychange', this.handleVisibilityChange)

            if (this.viewerMuted) {
                this.$refs.stream.muted = true
                this.$refs.stream.volume = 0.0
            } else {
                this.$refs.stream.muted = false
                this.$refs.stream.volume = this.viewerVolume
            }

            // ToDo: refactor the entirety of this
            if (process.env.ENABLE_TURN) {
                const servers = process.env.TURN_URL.toString().split(',')
                const users = process.env.TURN_USERNAME.toString().split(',')
                const passwords = process.env.TURN_PASSWORD.toString().split(',')

                this.iceServers = servers.map((serv, i) => ({
                    url: serv,
                    username: users[i],
                    credential: passwords[i]
                }))
            }

            this.context = this.$refs.canvasStream.getContext('2d')

            if (this.janusId || (this.apertureWs && this.apertureToken))
                this.playStream()

            this.unsubscribe = this.$store.subscribe(({ type }, { stream }) => {
                switch(type) {
                    case 'updateJanus':
                    case 'updateAperture':
                        this.$nextTick(this.playStream)
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
        },
        beforeDestroy() {
            this.leavePiP()
            document.removeEventListener('visibilitychange', this.handleVisibilityChange)

            this.cleanPlayers()
            this.unsubscribe()
        },
        methods: {
            async resumeStream() {
                if (!this.isJanusEnabled || !this.$refs.stream)
                    return

                this.loading = true

                try {
                    await this.$refs.stream.play()
                } catch (error) {
                    this.playerError(error)
                }
            },
            playerError(error) {
                this.loading = false

                if (process.env.NODE_ENV !== 'production')
                    console.error(error)

                let message = error.message || error.name

                // workaround (thanks Firefox?)
                if (!message && error.target && error.target.error)
                    message = error.target.error.message

                switch (error.name) {
                    case 'NotAllowedError':
                        this.showMutedPopup = true
                        break
                    case 'NotSupportedError':
                        this.showUnsupportedPopup = true
                        this.playError = message
                        break
                    case 'AbortError':
                        this.loading = true
                        break
                    default:
                        this.playError = message
                        break
                }
            },
            cleanErrors() {
                this.loading = false
                this.showMutedPopup = false
                this.showUnsupportedPopup = false
                this.playError = null
            },

            unmute() {
                this.showMutedPopup = false
                if (this.isJanusEnabled && this.$refs.stream) {
                    this.$refs.stream.volume = this.viewerVolume
                    this.resumeStream()
                }
            },
            volumeChange() {
                // ToDo: change how this works to prevent recursions
                // and resource wasting, but keeping the player controls updated.
                this.viewerMuted = this.$refs.stream.muted
                this.viewerVolume = this.$refs.stream.volume
            },


            togglePiP() {
                if (!this.canPiP || !this.canControlPlayer || !this.$refs.stream || !this.$refs.canvasStream)
                    return

                if (this.pip)
                    this.$refs.stream.requestPictureInPicture()
                else if (document.pictureInPictureElement === this.$refs.stream)
                    document.exitPictureInPicture()
            },

            enterPiP() {
                this.$store.commit('setPiPStatus', true)
                this.updateCanvas = true
                this.$refs.canvasStream.width = this.streamWidth
                this.$refs.canvasStream.height = this.streamHeight
                this.updateFakeStream()
            },

            leavePiP() {
                this.$store.commit('setPiPStatus', false)
                setTimeout(() => {
                    this.context.clearRect(0, 0, this.streamWidth, this.streamHeight)
                    if (!this.pip)
                        this.updateCanvas = false
                }, 300)
            },

            updateFakeStream() {
                if (!this.updateCanvas || !this.$refs.stream || !this.$refs.canvasStream)
                    return

                window.requestAnimationFrame(() => {
                    this.context.drawImage(this.$refs.stream, 0, 0, this.streamWidth, this.streamHeight)
                    setTimeout(this.updateFakeStream, 33)
                })
            },

            areScriptsReady(...values) {
                return values.every(x => this.loadedScripts.includes(x))
            },

            playStream() {
                this.isJanusEnabled ? this.playJanusStream() : this.playJsmpegStream()
            },

            playJsmpegStream() {
                if (this.areScriptsReady('jsmpeg'))
                    this.initJsmpeg()
                else
                    this.scriptReadyCallbacks.push(() => {
                        if(this.areScriptsReady('jsmpeg'))
                            this.initJsmpeg()
                    })
            },
            playJanusStream() {
                if (this.areScriptsReady('janus'))
                    this.initJanus()
                else
                    this.scriptReadyCallbacks.push(() => {
                        if(this.areScriptsReady('janus'))
                            this.initJanus()
                    })
            },

            initJsmpeg() {
                this.cleanPlayers()

                if (!this.$refs.stream || !this.$refs.canvasStream)
                    return console.warn('Stream cannot be found, refusing to start player!')

                this.context.clearRect(0, 0, this.streamWidth, this.streamHeight)

                this.player = new JSMpeg.Player(`${this.apertureWs}/?t=${this.apertureToken}`, {
                    canvas: this.$refs.canvasStream,
                    pauseWhenHidden: false,
                    // ToDo: check if this is /really/ needed
                    videoBufferSize: parseInt(process.env.VIDEO_BITRATE || 1200) * 1024,
                    audioBufferSize: parseInt(process.env.AUDIO_BITRATE || 128) * 1024,
                    // workarounds so jsmpeg breaks less
                    disableWebAssembly: true,
                    disableGl: true
                })

                this.$refs.stream.srcObject = this.$refs.canvasStream.captureStream()

                if (this.player.audioOut && !this.player.audioOut.unlocked)
                    this.showMutedPopup = true
            },

            initJanus() {
                this.cleanPlayers()

                if (!this.$refs.stream)
                    return console.warn('Stream cannot be found, refusing to start player!')

                if (process.env.NODE_ENV !== 'production')
                    console.debug('Initalizing Janus library.')

                Janus.init({
                    debug: (process.env.NODE_ENV !== 'production'),
                    dependencies: Janus.useDefaultDependencies(),
                    callback: this.configureJanus
                })
            },

            /*
            * We should, ideally, have the API/Portals server handle gathering TURN/STUN information and receive the values here.
            * this will allow us to enable TURN REST API in order to obtain short-lived session and keep TURN server access limited to Cryb.
            * this needs to be accompanied by the ability to request an ICE restart in order to switch the TURN sessions.
            */

            // ToDo: Rewrite credential check for more complexity in checking if one more more sets are needed.
            configureJanus() {
                if (process.env.NODE_ENV !== 'production')
                    console.debug('Configuring Janus object')

                const janusConfig = {
                    server: `${process.env.JANUS_URL}/janus`,
                    iceServers: this.iceServers,
                    success: this.janusSessionConnected,
                    error: this.janusError,
                    destroy: this.janusDestroyed
                }

                this.player = new Janus(janusConfig)
            },

            janusSessionConnected() {
                this.player.attach({
                    plugin: 'janus.plugin.streaming',
                    success: this.janusHandleCreated,
                    error: this.janusError,
                    onmessage: this.janusHandleMessages,
                    onremotestream: this.janusHandleIncomingStream,
                    oncleanup: this.janusHandleCleanup
                })
            },

            janusHandleCreated(handle) {
                this.janusHandle = handle
                this.janusHandle.send({message: {
                    request: 'watch',
                    id: this.janusId
                }})
            },

            janusHandleMessages(msg, jsep) {
                if (jsep)
                    this.janusHandle.createAnswer({
                        jsep,
                        media: {
                            audioRecv: true,
                            audioSend: false,
                            videoRecv: true,
                            videoSend: false
                        },
                        success: this.janusHandleAnswerSuccess,
                        error: this.janusError
                    })
            },

            janusHandleAnswerSuccess(jsep) {
                this.janusHandle.send({
                    message: {
                        request: 'start'
                    },
                    jsep
                })
            },

            janusHandleIncomingStream(stream) {
                if (!this.$refs.stream) {
                    console.warn('Stream cannot be found, destroying player!')
                    return this.cleanPlayers()
                }

                try {
                    this.$refs.stream.srcObject = stream

                    if (stream.getVideoTracks().length > 0) {
                        const streamSettings = stream.getVideoTracks()[0].getSettings()

                        if (streamSettings.width) {
                            this.maxWidth = streamSettings.width
                            this.maxHeight = streamSettings.height
                        }
                    }

                    setTimeout(() => {
                        this.janusHandleCreated(this.janusHandle)
                    }, 1800000)
                } catch(error) {
                    console.error(error)
                }
            },

            janusHandleCleanup() {
                if (process.env.NODE_ENV !== 'production')
                    console.debug('::: Janus cleanup received :::')
            },

            janusError(reason) {
                if (reason === 'Library not initialized')
                    return this.$nextTick(this.initJanus)
                console.error(reason)
            },

            janusDestroyed() {
                delete this.player // ToDo: can we do this without disaster incoming?
            },

            handleVisibilityChange() {
                if (document.hidden && this.activeKeyEvent)
                    this.didKeyUp(this.activeKeyEvent)
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
                    this.$refs.stream.muted = true
                else {
                    this.$refs.stream.muted = false
                    this.$refs.stream.volume = this.viewerVolume
                }
            },

            setStreamVolume() {
                if (!this.canControlPlayer)
                    return

                if (!this.viewerMuted) {
                    this.$refs.stream.muted = false
                    this.$refs.stream.volume = this.viewerVolume
                }
            },

            cleanPlayers() {
                if (this.player && this.player.destroy) {
                    this.player.destroy({ cleanupHandles: true })
                    delete this.player
                }
            }
        }
    }
</script>
