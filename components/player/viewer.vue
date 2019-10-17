<template>
    <div class='player' :class="{ 'capture-events': hasControl }">
        <p class='player-dev' v-if=showPlayerDevtools>
            Portal ID: {{ portal.id }}<br>
            Portal Status: {{ portal.status }}
        </p>
        <canvas class="player-stream" ref="stream"></canvas>
        <textarea class='keyboard-capture' ref='keyboard' @keydown=didKeyDown @keyup=didKeyUp  @mousemove=didMouseMove @mousedown=didMouseDown @mouseup=didMouseUp @mousewheel=didMouseWheel @contextmenu=handleRightClick></textarea>
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

    import Button from '~/components/button'

    export default {
        computed: {
            ...mapGetters(['ws', 'userId', 'controllerId', 'portal', 'apertureWs', 'apertureToken']),

            hasControl() {
                return this.controllerId === this.userId
            },

            streamWidth() {
                return 1280
            },
            streamHeight() {
                return 720
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

                const player = new JSMpeg.Player(`${this.apertureWs}/?t=${this.apertureToken}`, { canvas: this.$refs.stream })
                console.log(player)
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
                const { keyCode, ctrlKey, shiftKey } = event
                this.activeKeyEvent = event

                this.emitEvent({ keyCode, ctrlKey, shiftKey }, 'KEY_DOWN')
            },
            didKeyUp(event) {
                const { keyCode, ctrlKey, shiftKey } = event

                // needs persistance
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
                    { width: clientWidth } = this.$refs.stream.getBoundingClientRect(),
                    { width: parentWidth } = elem.parentElement.getBoundingClientRect(),
                    xPos = clientX - ((parentWidth - clientWidth) / 2)

                return Math.round(this.streamWidth * (xPos / clientWidth))
            },
            calculateYPos(event) {
                const { clientY, srcElement: elem } = event,
                    rect = elem.getBoundingClientRect(),
                    yPos = clientY - rect.top /* + (elem.clientHeight / 2) */

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
                        this.$nextTick(this.playStream) // Play the video with the attached stream

                        break
                }
            })

            if(this.$refs.keyboard)
                this.$refs.keyboard.onpaste = this.didPaste
        },
        components: {
            Button
        }
    }
</script>