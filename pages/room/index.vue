<template>
    <div class="watch-wrapper">
        <div v-if="error" class="center error">
            <h1 class="title">
                Room Not Found
            </h1>
            <p class="subtitle" style="margin-bottom: 0">
                We couldn't find this room. Check the invite again, or <nuxt-link to="/home">go home</nuxt-link>.
            </p>
        </div>
        <div v-else-if="room" class="watch">
            <Player />
            <PlayerFooter />
            <Chat />
        </div>
    </div>
</template>
<script>
    import Chat from '~/components/Chat'
    import Player from '~/components/Player'
    import PlayerFooter from '~/components/Player/Footer'

    export default {
        head() {

            return {
                title: this.error ? 'Room Not Found' : (this.room ? this.room.name : ''),
                script: process.env.ENABLE_JANUS ? [
                    { src: '/js/adapter.js' },
                    { src: '/js/janus.js'}
                ] : [
                    { src: '/js/jsmpeg.min.js'}
                ]
            }
        },
        middleware: 'authenticated',
        components: {
            Chat,
            Player,
            PlayerFooter
        },
        async asyncData(context) {
            try {
                const room = await context.$axios.$get('room')
                context.store.commit('handleRoom', room)

                return { room, error: null }
            } catch(error) {
                return { room: null, error: true }
            }
        },
        mounted() {
            this.$store.commit('setupWebSocket')
        },
        beforeDestroy() {
            this.$store.commit('disconnectWebSocket')
        },
    }
</script>
