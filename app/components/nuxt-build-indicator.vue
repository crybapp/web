<template>
    <transition appear>
        <div v-if="building" class="build-background">
            <div class="build-indicator">
                <div class="logo-big logo-mask is-loading" id="loading-logo"></div>
                <h1>{{ animatedProgress }}%</h1>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        name: 'NuxtBuildIndicator',
        data() {
            return {
                building: false,
                progress: 0,
                animatedProgress: 0
            }
        },
        watch: {
            progress (val, oldVal) {
                clearInterval(this._progressAnimation)

                if (val < 10 || val > 90) {
                    this.animatedProgress = val
                    return
                }

                this._progressAnimation = setInterval(() => {
                    const diff = this.progress - this.animatedProgress
                    if (diff > 0)
                        this.animatedProgress++
                    else
                        clearInterval(this._progressAnimation)
                }, 50)
            }
        },
        mounted () {
            if (EventSource)
                this.sseConnect()
        },
        beforeDestroy () {
            this.sseClose()
            clearInterval(this._progressAnimation)
        },
        methods: {
            sseConnect() {
                if (this._connecting)
                    return

                this._connecting = true
                this.sse = new EventSource('/_loading/sse')
                this.sse.addEventListener('message', event => this.onSseMessage(event))
            },
            onSseMessage(message) {
                const data = JSON.parse(message.data)
                if (!data.states)
                    return

                this.progress = Math.round(data.states.reduce((p, s) => p + s.progress, 0) / data.states.length)

                if (data.allDone)
                    this.$nextTick(() => {
                        this.building = false
                        this.animatedProgress = 0
                        this.progress = 0
                        clearInterval(this._progressAnimation)
                    })
                else if (!this.building)
                    this.building = true
            },
            sseClose() {
                if (this.sse) {
                    this.sse.close()
                    delete this.sse
                }
            }
        }
    }
</script>

<style scoped>
    div.build-background {
        position: fixed;
        z-index: 2147483647;
        top: 0;
        left: 0;
        bottom: 0;
        width: 100%;
        background-color: rgba(0, 0, 0, .85);
        display: -webkit-box;
        display: flex;
        -webkit-box-align: center;
        align-items: center;
        -webkit-box-pack: center;
        justify-content: center;
        text-align: center
    }
    div.build-indicator {
        display: block;
        color: white
    }
    .v-enter-active, .v-leave-active {
        transition-delay: 0.2s;
        transition-property: all;
        transition-duration: 0.3s
    }
    .v-leave-to {
        opacity: 0;
        transform: translateY(20px)
    }
</style>
