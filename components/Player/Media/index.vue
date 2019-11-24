<template>
    <div class="media-wrapper">
        <p v-if="showPlayerDevtools && media" class="player-dev">
            Media ID: {{ media.id }}<br>
            Media Provider: {{ media.provider }}<br>
            Media Epoch: {{ media.startedAt }}<br>
            Media Time: {{ mediaTime }}
        </p>
        <!-- Legacy Media Picker Modal -->
        <!-- <div class="media-picker-wrapper" v-if="hasControl && isPickingMedia">
            <div class="box disabled disable-hover media-picker">
                <h1 class="title">Let's switch it up</h1>
                <p class="subtitle">Tired of what you're watching? Paste a YouTube, Soundcloud or Vimeo link below and click 'Play'</p>

            </div>
        </div> -->
        <div class="media-content-wrapper" :class="{ 'has-control': hasControl }" v-if=media>
            <!-- Future support for YouTube Embed API -->
            <!-- <div class="media-content yt-player" :class="{ 'youtube': media.provider === 'youtube' }" v-if="media.provider === 'youtube'"></div> -->

            <iframe class="media-content" :class="{ 'youtube': media.provider === 'youtube' }" v-if="media.provider === 'youtube'" :src="`https://www.youtube.com/embed/${media.id}?start=${mediaTime}&autoplay=1`" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <iframe class="media-content" :class="{ 'vimeo': media.provider === 'vimeo' }" v-else-if="media.provider === 'vimeo'" :src="`https://player.vimeo.com/video/${media.id}?autoplay=1#t=${mediaTime}`" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
            <iframe class="media-content" :class="{ 'soundcloud': media.provider === 'soundcloud' }" v-else-if="media.provider === 'soundcloud'" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/688639309&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true#t=5s" width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay"></iframe>
            <iframe class="media-content" :class="{ 'twitch': media.provider === 'twitch' }" v-else-if="media.provider === 'twitch'"  :src="`https://player.twitch.tv/?channel=${media.id}`" frameborder="0" scrolling="no" autoplay="true" allowfullscreen="false"></iframe>
        </div>
        <div class="media-controls-toolbar-wrapper" v-if=hasControl>
            <div class="box disabled media-controls-toolbar">
                <Form>
                    <Input class="is-expanded" type="text" v-model=url :disabled=isUpdating placeholder="Media URL"></Input>
                    <Button @click.native=updateMedia :disabled=isUpdating :loading=isUpdating>{{ isUpdating ? 'Playing...' : 'Play' }}</Button>
                </Form>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Form from '~/components/Form'
    import Input from '~/components/Input'
    import Button from '~/components/Button'

    export default {
        computed: {
            ...mapGetters(['room', 'userId', 'controllerId']),

            media() {
                if(!this.room) return null

                return this.room.media
            },
            mediaTime() {
                if(!this.media) return

                const mediaEpoch = new Date(this.media.startedAt),
                        currentTime = new Date()

                return Math.round((currentTime - mediaEpoch) / 1000)
            },

            hasControl() {
                return this.controllerId === this.userId
            },

            showPlayerDevtools() {
                return process.env.SHOW_PLAYER_DEVTOOLS
            }
        },
        data() {
            return {
                url: null,

                isUpdating: false
            }
        },
        methods: {
            async updateMedia() {
                this.isUpdating = true

                try {
                    const { media } = await this.$axios.$patch('room/media', {
                        url: this.url
                    })

                    this.$store.commit('updateMedia', media)
                } catch(error) {
                    alert(error)
                }

                this.url = null
                this.isUpdating = false
            }
        },
        // Future support for YouTube Embed API
        // mounted() {
        //     const player = new YT.Player('yt-player', {
        //         videoId: '0Krgt0tv3BA',
        //         width: '640',
        //         height: '390',
        //         events: {
        //             onReady: () => console.log('onReady'),
        //             onStateChange: console.log,
        //             onPlaybackQualityChange: () => console.log('onPlaybackQualityChange'),
        //             onPlaybackRateChange: () => console.log('onPlaybackRateChange'),
        //             onError: console.error,
        //             onApiChange: () => console.log('onApiChange')
        //         }
        //     })

        //     console.log(player)
        // },
        components: {
            Form,
            Input,
            Button
        }
    }
</script>
<style scoped>
    iframe.media-content {
        position: absolute;

        width: 100%;
        height: 100%
    }

    iframe.media-content.soundcloud {
        height: auto
    }

    div.media-content-wrapper {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        vertical-align: middle;
        align-items: center
    }

    /* div.media-content-wrapper.has-control {
        pointer-events: all
    } */

    div.media-picker-wrapper {
        position: absolute;
        display: flex;

        align-items: center;
        justify-content: center;
        
        background-color: rgba(0, 0, 0, 0.75);

        width: 100%;
        height: 100%;
        z-index: 1
    }

    div.media-picker-wrapper div.media-picker {
        padding: 1.5em;
        width: 50%
    }

    div.media-controls-toolbar-wrapper {
        position: absolute;
        display: flex;

        align-items: center;
        justify-content: center;

        width: 100%;
        /* bottom: 0px; */
        z-index: 1
    }

    div.media-controls-toolbar-wrapper div.media-controls-toolbar {
        padding: 1em;
        margin-top: 0em;

        opacity: 0;
        transition: all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)
    }

    div.media-controls-toolbar-wrapper:hover div.media-controls-toolbar {
        margin-top: 1em;

        opacity: 1
    }
</style>
