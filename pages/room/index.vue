<template>
    <div class="watch-wrapper">
        <div class="center error" v-if=error>
            <h1 class="title">Room Not Found</h1>
            <p class="subtitle" style="margin-bottom: 0">We couldn't find this room. Check the invite again, or <nuxt-link to="/home">go home</nuxt-link>.</p>
        </div>
        <div class="watch" v-else-if=room>
            <Player />
            <PlayerFooter />
            <Chat />
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Chat from '~/components/Chat'

    import Player from '~/components/Player'
    import PlayerFooter from '~/components/Player/Footer'

    export default {
        async asyncData(context) {
            try {
                const room = await context.$axios.$get('room')
                context.store.commit('handleRoom', room)

                return { room, error: null }
            } catch(error) {
                return { room: null, error: true }
            }
        },
        head() {
            return {
                title: this.error ? 'Room Not Found' : (this.room ? this.room.name : ''),
                script: [
                    { src: '/js/jsmpeg.min.js' }
                ]
            }
        },
        middleware: 'authenticated',
        mounted() {
            this.$store.commit('setupWebSocket')
        },
        beforeDestroy() {
            this.$store.commit('disconnectWebSocket')
        },
        components: {
            Chat,
            Player,
            PlayerFooter
        }
    }
</script>
