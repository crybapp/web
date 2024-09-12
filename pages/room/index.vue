<template>
    <div v-if="room" class="room-wrapper">
        <div class="room">
            <Player />
            <PlayerFooter />
            <Chat />
        </div>
        <Loading v-if="!wsHeartbeat" />
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Chat from '~/components/Chat'
    import Player from '~/components/Player'
    import PlayerFooter from '~/components/Player/Footer'
    import Loading from '~/components/Loading'

    export default {
        components: {
            Chat,
            Player,
            PlayerFooter,
            Loading
        },
        middleware: 'authenticated',
        async asyncData(context) {
            await context.store.dispatch('fetchRoom')
        },
        head() {
            return {
                title: this.room ? this.room.name : 'Room Not Found'
            }
        },
        computed: {
            ...mapGetters(['room', 'wsHeartbeat'])
        },
        mounted() {
            if (!this.room) {
                this.$router.push('/home')
                return
            }

            this.$store.commit('setupWebSocket')

            this.unsubscribe = this.$store.subscribe(({ type }, { stream }) => {
                if (type === 'setupWebSocket')
                    this.$store.dispatch('fetchRoom')
                else if (type === 'handleRoom')
                    if (!this.room)
                        this.$router.push('/home')
            })
        },
        beforeDestroy() {
            if (typeof this.unsubscribe === 'function')
                this.unsubscribe()
            this.$store.commit('disconnectWebSocket')
        }
    }
</script>
