<template>
    <div class="player" :class="{ 'capture-events': hasControl }">
        <p v-if=showPlayerDevtools class="player-dev">
            Portal ID: {{ portal.id }}
            <br>
            Portal Status: {{ portal.status }}
        </p>
        <video
            v-if="isJanusEnabled"
            ref="stream"
            id="remoteStream"
            class="player-stream"
            tabindex="1"
            :style="maxWidthHeightStyle"
            autoplay
            playsinline
            @keydown="didKeyDown"
            @keyup="didKeyUp"
            @mousemove="didMouseMove"
            @mousedown="didMouseDown"
            @mouseup="didMouseUp"
            @mousewheel="didMouseWheel"
            @contextmenu="handleRightClick"
        />
        <canvas
            v-else
            ref="stream"
            id="remoteStream"
            class="player-stream"
            tabindex="1"
            @keydown=didKeyDown
            @keyup=didKeyUp
            @mousemove=didMouseMove
            @mousedown=didMouseDown
            @mouseup=didMouseUp
            @mousewheel=didMouseWheel
            @contextmenu=handleRightClick
        />
        <div v-if=showMutedPopup class="player-tooltips">
            <div class="player-tooltip" :class="{ visible: showMutedPopup }">
                <div class="player-tooltip-info">
                    <p class="player-tooltip-title">
                        {{ brand.name }} is muted
                    </p>
                    <p class="player-tooltip-body">
                        Your browser requires user interaction in order to let us play video with audio!
                    </p>
                </div>
                <Button @click.native=unmute()>
                    Unmute
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
                activeKeyEvent: undefined,
                showMutedPopup: false,
                remoteStream: undefined,
                scriptReadyCallbacks: [],
                maxWidth: 1280,
                maxHeight: 720
            }
        },
        computed: {
            ...mapGetters(['ws', 'userId', 'controllerId', 'portal', 'janusId', 'janusIp', 'apertureWs', 'apertureToken', 'viewerMuted', 'viewerVolume']),

            hasControl() {
                return this.controllerId === this.userId
            },

            streamWidth() {
                if (this.player)
                    return this.player.video.destination.width
                else if (this.remoteStream)
                    return this.maxWidth
                else
                    return 1280
            },
            streamHeight() {
                if (this.player) 
                    return this.player.video.destination.height
                else if (this.remoteStream)
                    return this.maxHeight
                else 
                    return 720
            },

            showPlayerDevtools() {
                return process.env.SHOW_PLAYER_DEVTOOLS && this.portal
            },
            isJanusEnabled() {
                return process.env.ENABLE_JANUS
            },
            maxWidthHeightStyle() {
                return `max-width: ${this.streamWidth}px; max-height: ${this.streamHeight}px;`
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
            let hidden,
                visibilityChange

            if (typeof document.hidden !== 'undefined') {
                hidden = 'hidden'
                visibilityChange = 'visibilitychange'
            } else if (typeof document.msHidden !== 'undefined') {
                hidden = 'msHidden'
                visibilityChange = 'msvisibilitychange'
            } else if (typeof document.webkitHidden !== 'undefined') {
                hidden = 'webkitHidden'
                visibilityChange = 'webkitvisibilitychange'
            }

            if (typeof document.addEventListener !== 'undefined' && hidden !== undefined)
                document.addEventListener(visibilityChange, () => this.handleVisibilityChange(hidden), false)

            if (this.janusId || (this.apertureWs && this.apertureToken))
                this.playStream()

            this.$store.subscribe(({ type }, { stream }) => {
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
                }
            })

            this.$refs.stream.onpaste = this.didPaste

            if (this.isJanusEnabled) {
                if (this.viewerMuted)
                    this.$refs.stream.volume = 0.0
                else
                    this.$refs.stream.volume = this.viewerVolume

                this.$root.$on('toggle-fullscreen', () => {
                    if (this.$refs.stream.nodeName === 'VIDEO')
                        this.$refs.stream.requestFullscreen()
                })
            }
        },
        beforeDestroy() {
            if (this.player)
                this.player.destroy()
        },
        methods: {
            unmute() {
                this.showMutedPopup = false
                if (this.isJanusEnabled)
                    this.$refs.stream.volume = this.viewerVolume
            },

            //O(values.length * loadedScripts.length)
            //Anyone got something better?
            areScriptsReady(...values) {
                return values.every(x => this.loadedScripts.includes(x))
            },

            playStream() {
                if (typeof window === 'undefined')
                    return

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
                if (this.areScriptsReady('janus', 'adapter'))
                    this.initJanus()
                else
                    this.scriptReadyCallbacks.push(() => {
                        if(this.areScriptsReady('janus', 'adapter'))
                            this.initJanus()
                    })
            },

            initJsmpeg() {
                if (this.player)
                    this.player.destroy()

                this.player = new JSMpeg.Player(`${this.apertureWs}/?t=${this.apertureToken}`, {
                    canvas: this.$refs.stream,
                    pauseWhenHidden: false,
                    // ToDo: check if this is /really/ needed
                    videoBufferSize: parseInt(process.env.VIDEO_BITRATE || 1200) * 1024,
                    audioBufferSize: parseInt(process.env.AUDIO_BITRATE || 128) * 1024,
                    // workarounds so jsmpeg breaks less
                    disableWebAssembly: true,
                    disableGl: true
                })

                if (this.player.audioOut && !this.player.audioOut.unlocked)
                    this.showMutedPopup = true
            },

            initJanus() {
                if (process.env.NODE_ENV === 'development')
                    console.debug('Initalizing Janus library.')

                Janus.init({
                    debug: (process.env.NODE_ENV === 'development'),
                    dependencies: Janus.useDefaultDependencies(),
                    callback: this.configureJanus()
                })
            },

            // TODO: Create iceServer configuration. Request from API?
            /*
            * We should, ideally, have the API/Portals server handle gathering TURN/STUN information and receive the values here.
            * this will allow us to enable TURN REST API in order to obtain short-lived session and keep TURN server access limited to Cryb.
            * this needs to be accompanied by the ability to request an ICE restart in order to switch the TURN sessions.
            */
            configureJanus() {
                if (process.env.NODE_ENV === 'development')
                    console.debug('Configuring Janus object')

                const janusConfig = {
                    server: `${process.env.JANUS_URL}:${process.env.JANUS_PORT}/janus`,
                    success: this.janusSessionConnected,
                    error: this.janusError,
                    destroy: this.janusDestroyed
                }

                this.janus = new Janus(janusConfig)
            },

            janusSessionConnected() {
                this.janus.attach({
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
                        jsep: jsep,
                        media: {
                            audioSend: false,
                            videoSend: false
                        },
                        success: this.janusHandleAnswerSuccess,
                        error: this.janusError
                    })
            },

            janusHandleAnswerSuccess(localJsep) {
                this.janusHandle.send({
                    message: {
                        request: 'start'
                    },
                    jsep: localJsep
                })
            },

            janusHandleIncomingStream(stream) {
                try {
                    this.remoteStream = stream
                    if (stream.getVideoTracks().length > 0) {
                        this.$refs.stream.srcObject = stream
                        const streamSettings = stream.getVideoTracks()[0].getSettings()

                        if (streamSettings.width) {
                            this.maxWidth = streamSettings.width
                            this.maxHeight = streamSettings.height
                        }

                        setTimeout(() => {
                            this.janusHandleCreated(this.janusHandle)
                        }, 1800000)
                    }
                } catch(error) {
                    console.error(error)
                }
            },

            janusHandleCleanup() {
                if (process.env.NODE_ENV === 'development')
                    console.debug('::: Janus cleanup received :::')
            },

            janusError(reason) {
                if (reason === 'Library not initialized') {
                    return setTimeout(() => this.$nextTick(this.playJanusStream()), 2000)
                }
                console.error(reason)
            },

            janusDestroyed() {},

            handleVisibilityChange(hidden) {
                if (document[hidden] && this.activeKeyEvent)
                    this.didKeyUp(this.activeKeyEvent)
            },

            handleRightClick(event) {
                event.preventDefault()
            },
            didPaste(event) {
                const { clipboardData } = event,
                        text = clipboardData.getData('text/plain')

                this.emitEvent({ text }, 'PASTE_TEXT')
            },
            didKeyDown(event) {
                event.preventDefault()
                const { key, ctrlKey, shiftKey } = event
                this.activeKeyEvent = event

                if (key === "c" && ctrlKey === true) {
                    return navigator.clipboard.readText().then(text => {
                        this.emitEvent({text}, 'PASTE_TEXT')
                    })
                }

                this.emitEvent({ key, ctrlKey, shiftKey }, 'KEY_DOWN')
            },
            didKeyUp(event) {
                event.preventDefault()
                const { key, ctrlKey, shiftKey } = event

                this.emitEvent({ key, ctrlKey, shiftKey }, 'KEY_UP')
            },
            didMouseMove(event) {
                const { x, y } = this.calculatePos(event)

                this.emitEvent({ x, y }, 'MOUSE_MOVE')
            },
            didMouseDown(event) {
                const { button } = event,
                    { x, y } = this.calculatePos(event)

                this.emitEvent({ x, y, button: button + 1 }, 'MOUSE_DOWN')
            },
            didMouseUp(event) {
                const { button } = event,
                      { x, y } = this.calculatePos(event)

                this.emitEvent({ x, y, button: button + 1 }, 'MOUSE_UP')
            },
            didMouseWheel(event) {
                event.preventDefault()
                const { deltaX, deltaY } = event

                this.emitEvent({ scrollUp: deltaY > 0 }, 'MOUSE_SCROLL')
            },

            emitEvent(d, t) {
                if (!this.ws || !this.hasControl || this.ws.readyState !== this.ws.OPEN)
                    return

                this.ws.send(JSON.stringify({ op: 0, d, t }))
            },

            calculatePos(event) {
                const x = this.calculateXPos(event),
                        y = this.calculateYPos(event)

                return { x, y }
            },
            calculateXPos(event) {
                const { clientX, srcElement: elem } = event,
                    rect = elem.getBoundingClientRect(),
                    xPos = clientX - rect.left

                return Math.round(this.streamWidth * (xPos / elem.clientWidth))
            },
            calculateYPos(event) {
                const { clientY, srcElement: elem } = event,
                    rect = elem.getBoundingClientRect(),
                    yPos = clientY - rect.top

                return Math.round(this.streamHeight * (yPos / elem.clientHeight))
            },
            
            setStreamMutedStatus() {
                if (!this.isJanusEnabled || this.$refs.stream.nodeName !== 'VIDEO')
                    return

                if (this.viewerMuted)
                    this.$refs.stream.volume = 0.0
                else
                    this.$refs.stream.volume = this.viewerVolume
            },
            setStreamVolume() {
                if (!this.isJanusEnabled)
                    return

                if (!this.viewerMuted && this.$refs.stream.nodeName === 'VIDEO')
                    this.$refs.stream.volume = this.viewerVolume
            }
        }
    }
</script>
