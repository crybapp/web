<template>
    <div class='player' :class="{ 'capture-events': hasControl }">
        <p class='player-dev' v-if=showPlayerDevtools>
            Portal ID: {{ portal.id }}<br>
            Portal Status: {{ portal.status }}
        </p>
        <canvas class="player-stream" ref="stream" tabindex="1" @keydown=didKeyDown @keyup=didKeyUp @mousemove=didMouseMove @mousedown=didMouseDown @mouseup=didMouseUp @mousewheel=didMouseWheel @contextmenu=handleRightClick></canvas>
        <div class="player-tooltips" v-if=showMutedPopup>
            <div class="player-tooltip" :class="{ visible: showMutedPopup }">
                <div class="player-tooltip-info">
                    <p class="player-tooltip-title">{{ brand.name }} is muted</p>
                    <p class="player-tooltip-body">Your browser requires user interaction in order to let us play video with audio</p>
                </div>
                <Button @click.native=unmute()>Unmute</Button>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    
    import brand from '~/brand/config'

    import Button from '~/components/Button'

    export default {
        computed: {
            ...mapGetters(['ws', 'userId', 'controllerId', 'portal', 'apertureWs', 'apertureToken']),

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
        data() {
            return {
                brand,
                activeKeyEvent: null,
                showMutedPopup: false
            }
        },
        methods: {
            unmute() {
                this.showMutedPopup = false
            },

            playStream() {
                if(typeof window === 'undefined') return
                if(!JSMpeg) return // TODO: Add a popup that allows the user to retry playing the stream once the jsmpeg script has loaded

                if(this.player) this.player.destroy()

                this.player = new JSMpeg.Player(`${this.apertureWs}/?t=${this.apertureToken}`, {
                    canvas: this.$refs.stream,
                    pauseWhenHidden: false,
                    videoBufferSize: parseInt(process.env.VIDEO_BITRATE || 1200) * 1024,
                    audioBufferSize: parseInt(process.env.AUDIO_BITRATE || 128) * 1024 
                })
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
        },
        mounted() {
            let hidden,
                visibilityChange

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
            

            if(this.apertureWs && this.apertureToken)
                this.playStream()

            this.$store.subscribe(({ type }, { stream }) => {
                switch(type) {
                    case 'updateAperture':
                        this.$nextTick(this.playStream)

                        break
                }
            })

            if(this.$refs.stream)
                this.$refs.stream.onpaste = this.didPaste
        },
        components: {
            Button
        }
    }
</script>
