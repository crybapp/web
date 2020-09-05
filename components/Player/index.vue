<template>
    <div v-if="room" class="player-wrapper">
        <div v-if="!showViewer" class="player">
            <p v-if="showPlayerDevtools" class="player-dev">
                Portal ID: {{ portal.id || 'N/A' }}
                <br>
                Portal Status: {{ portalStatus }}
            </p>

            <video
                class="is-placeholder"
                src="~/assets/static.mp4"
                autoplay
                muted
                loop
                preload
                disablePictureInPicture
            />

            <!-- Portal is not open and is not yet created -->
            <div v-if="portalStatus === 'closed' && !portal.id" class="player-message">
                <h1 class="title">
                    And so it begins...
                </h1>
                <p class="body">
                    Invite a couple of friends, then we'll queue up your room for a portal to get the party started!
                </p>
            </div>
            <!-- Portal is not open, but it's being created -->
            <div v-else-if="portalStatus === 'waiting' || portalStatus === 'closed' && portal.id" class="player-message">
                <h1 class="title">
                    Hold your rabbits...
                </h1>
                <p class="body">
                    We're waiting for the right gears to align, so we can get your portal ready - hold tight!
                    <br>
                    If this is taking a little long, restart the room.
                </p>
            </div>
            <!-- A portal has been placed into the queue -->
            <div v-else-if="portalStatus === 'in-queue'" class="player-message">
                <h1 class="title">
                    You're in the queue!
                </h1>
                <p v-if="queueStatus" class="body">
                    You are currently #{{ queueStatus.currentPositionInQueue }} out of {{ queueStatus.currentQueueLength }}, please grab your popcorn!
                </p>
                <p v-else class="body">
                    There are a couple rooms in front of you waiting for a portal, please grab your popcorn!
                </p>
            </div>
            <!-- The portal has been created and the stream between the client and the server is being established -->
            <div v-else-if="portalStatus === 'open'" class="player-message">
                <h1 class="title">
                    Strap in...
                </h1>
                <p class="body">
                    Everything is ready - we're just getting the stream between the portal and you started.
                </p>
            </div>
            <!-- Something wrong happened while starting the portal -->
            <div v-else-if="portalStatus === 'error'" class="player-message">
                <h1 class="title">
                    Oh, no!
                </h1>
                <p class="body">
                    Something bad happened that isn't letting us to start a portal for you.
                    <br>
                    We'll try to recover, but if this is stuck for too long, restart the room.
                </p>
            </div>
            <!-- The portal is either being created or is starting. Or something else. -->
            <div v-else-if="portalStatus" class="player-message">
                <h1 class="title">
                    We're {{ portalStatus }} your portal now
                </h1>
                <p class="body">
                    Normally this takes a couple of seconds, hang tight!
                    <br>
                    If you have any issues either refresh the page or ask the room owner to restart the portal.
                </p>
            </div>
            <div class="loading-wrapper">
                <div class="loading" />
            </div>
        </div>
        <Viewer v-show="showViewer" ref="viewer" :loaded-scripts="loadedScripts" />
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Viewer from '~/components/Player/Viewer'

    export default {
        components: {
            Viewer
        },
        props: {
            loadedScripts: Array
        },
        computed: {
            ...mapGetters(['user', 'room', 'portal', 'stream', 'janusId', 'janusIp', 'apertureWs', 'apertureToken', 'fullscreen', 'pip', 'queueStatus']),

            showViewer() {
                if (process.env.ENABLE_JANUS)
                    return this.portalStatus === 'open' && this.janusId
                else
                    return this.portalStatus === 'open' && this.apertureWs && this.apertureToken
            },
            showPlayerDevtools() {
                return process.env.SHOW_PLAYER_DEVTOOLS
            },

            portalStatus() {
                if (!this.portal)
                    return 'closed'

                return this.portal.status
            },

            isSelfRoomOwner() {
                if (!this.room)
                    return false

                return this.room.owner.id === this.user.id
            }
        },
        mounted() {
            this.unsubscribe = this.$store.subscribe(({ type }, { stream }) => {
                if (type === 'setFullscreenStatus')
                    this.toggleFullscreen()
            })
        },
        beforeDestroy() {
            this.$store.commit('setFullscreenStatus', false)
            this.$store.commit('setPiPStatus', false)
            this.unsubscribe()
        },
        methods: {
            toggleFullscreen() {
                if (this.fullscreen)
                    this.$el.requestFullscreen()
                else if (document.fullscreenElement === this.$el)
                    document.exitFullscreen()
            }
        }
    }
</script>
