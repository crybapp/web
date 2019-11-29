<template>
    <div
        class="player"
        :class="{ 'capture-events': hasControl }"
    >
        <p v-if="showPlayerDevtools" class="player-dev">
            Portal ID: {{ portal.id }}
            <br>
            Portal Status: {{ portal.status }}
        </p>
        <video
            ref="stream"
            id="remoteStream"
            class="player-stream"
            tabindex="1"
            controls 
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

        <div v-if="showMutedPopup" class="player-tooltips">
            <div class="player-tooltip" :class="{ visible: showMutedPopup }">
                <div class="player-tooltip-info">
                    <p class="player-tooltip-title">
                        {{ brand.name }} is muted
                    </p>
                    <p class="player-tooltip-body">
                        Your browser requires user interaction in order to let us play video with audio!
                    </p>
                </div>
                <Button @click.native="unmute()">
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
        data() {
            return {
                brand,
                activeKeyEvent: null,
                showMutedPopup: false,
                remoteStream: undefined
            }
        },
        computed: {
            ...mapGetters(['ws', 'userId', 'controllerId', 'portal', 'janusId']),

            hasControl() {
                return this.controllerId === this.userId
            },

            streamWidth() {
                if(!this.player) return 1280

                return this.player.video.destination.width
            },
            streamHeight() {
                if(!this.player) return 720

                return this.player.video.destination.height
            },

            showPlayerDevtools() {
                return process.env.SHOW_PLAYER_DEVTOOLS && this.portal
            }
        },
        mounted() {
            var fs = document.getElementById("remoteStream");
            let hidden,
                visibilityChange

            Janus.init({
                debug: true,
                dependencies: Janus.useDefaultDependencies()
            })

            if(typeof document.hidden !== 'undefined') {
                hidden = 'hidden'
                visibilityChange = 'visibilitychange'
            } else if(typeof document.msHidden !== 'undefined') {
                hidden = 'msHidden'
                visibilityChange = 'msvisibilitychange'
            } else if(typeof document.webkitHidden !== 'undefined') {
                hidden = 'webkitHidden'
                visibilityChange = 'webkitvisibilitychange'
            }

            if(typeof document.addEventListener !== 'undefined' && hidden !== undefined)
                document.addEventListener(visibilityChange, () => this.handleVisibilityChange(hidden), false)

            if(this.janusId)
                this.playStream()
                fs.volume = 0.3;

            this.$store.subscribe(({ type }, { stream }) => {
                switch(type) {
                    case 'updateJanus':
                        this.$nextTick(this.playStream)

                        break
                }
            })
            
            //Short term fix: It auto plays if paused (when trying to control vm)
            fs.addEventListener("click", function() {
            if (fs.paused == true){
                fs.play();
            } else {
                fs.pause();
            }
        });

            if(this.$refs.stream)
                this.$refs.stream.onpaste = this.didPaste
        },
        methods: {
            unmute() {
                this.showMutedPopup = false
            },

            playStream() {
                if(typeof window === 'undefined') return
                this.janus = new Janus({
                    server: "https://janus.noot.vip/janus/",
                    success: this.janusSessionConnected,
                    error: this.janusError,
                    destroy: this.janusDestroyed
                })

                /*if(this.player) this.player.destroy()

                this.player = new JSMpeg.Player(`${this.apertureWs}/?t=${this.apertureToken}`, {
                    canvas: this.$refs.stream,
                    pauseWhenHidden: false,
                    videoBufferSize: parseInt(process.env.VIDEO_BITRATE || 1200) * 1024,
                    audioBufferSize: parseInt(process.env.AUDIO_BITRATE || 128) * 1024
                })

                if (this.player.audioOut && !this.player.audioOut.unlocked) {
                    this.showMutedPopup = true
                }*/
            },

            janusSessionConnected() {
                this.janus.attach({
                    plugin: "janus.plugin.streaming",
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
                if(jsep !== undefined && jsep !== null) {
                    this.janusHandle.createAnswer({
                        jsep: jsep,
                        media: {
                            audioSend: false,
                            videoSend: false
                        },
                        success: this.janusHandleAnswerSuccess,
                        error: this.janusError
                    })
                }
            },

            janusHandleAnswerSuccess(localJsep) {
                this.janusHandle.send({
                    message: {
                        request: "start"
                    },
                    jsep: localJsep
                })
            },

            janusHandleIncomingStream(stream) {
                console.debug("::::::: RECEIVED JANUS STREAM :::::::")
                this.remoteStream = stream
                var videoTracks = stream.getVideoTracks()
                console.debug("Video Tracks: " + videoTracks.length)
                var audioTracks = stream.getAudioTracks()
                console.debug("Audio Tracks: "+ audioTracks.length)
                if(videoTracks.length > 0) {
                    console.debug("Janus video track found.")
                    console.debug(stream.getVideoTracks())
                    document.getElementById('remoteStream').srcObject = stream
                }
                                
                console.log("::::::: JANUS STREAM FINISHED PROCESSING :::::::")
            },

            janusHandleCleanup() {
                console.log("::: Janus cleanup received :::")
            },

            janusError(reason) {
                console.log(reason)
            },

            janusDestroyed() {
                return
            },

            handleVisibilityChange(hidden) {
                if(document[hidden] && this.activeKeyEvent)
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
                const { keyCode, ctrlKey, shiftKey } = event
                this.activeKeyEvent = event

                this.emitEvent({ keyCode, ctrlKey, shiftKey }, 'KEY_DOWN')
            },

            didKeyUp(event) {
                event.preventDefault()
                const { keyCode, ctrlKey, shiftKey } = event

                this.emitEvent({ keyCode, ctrlKey, shiftKey }, 'KEY_UP')
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
                const { ws, hasControl } = this

                if(!ws) return
                if(!hasControl) return
                if(ws.readyState !== ws.OPEN) return

                ws.send(JSON.stringify({ op: 0, d, t }))
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
            }
        }
    }
</script>
