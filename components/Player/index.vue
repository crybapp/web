<template>
    <div v-if="room" class="player-wrapper">
        <div v-if="!showViewer" class="player stream-loading">
            <video
                class="stream is-placeholder"
                src="/static-placeholder.mp4"
                autoplay
                muted
                loop
            />
            <p v-if="showPlayerDevtools" class="player-dev">
                Portal ID: {{ portal.id || 'N/A' }}
                <br>
                Portal Status: {{ portalStatus }}
            </p>
            <!-- Portal is not open and there is only one person in the room
                 ToDo: change this in case there's a different minimum requirement -->
            <div v-if="(portalStatus === 'waiting' || portalStatus === 'closed') && room.members.length === 1" class="player-message">
                <h1 class="title">
                    And so it begins...
                </h1>
                <p class="body">
                    Add a friend or two to get the party started! Once someone else joins this room, we'll queue up your room for a virtual browser
                </p>
            </div>
            <!-- Portal is not open but there is more than one member in the room -->
            <div v-else-if="(portalStatus === 'waiting' || portalStatus === 'closed') && room.members.length > 1" class="player-message">
                <h1 class="title">
                    Hold your rabbits...
                </h1>
                <p class="body">
                    We're waiting for the right gears to align, so we can get your browser ready - hold tight!
                    <br>
                    If this is taking a little long, restart the room
                </p>
            </div>
            <!-- A portal has been placed into the queue -->
            <div v-else-if="portalStatus === 'in-queue'" class="player-message">
                <h1 class="title">
                    You're in the queue!
                </h1>
                <p class="body">
                    There are a couple rooms in front of you waiting for a virtual browser, please grab your popcorn!
                </p>
            </div>
            <!-- The portal is either being created or starting -->
            <div v-else-if="portalStatus === 'creating' || portalStatus === 'starting'" class="player-message">
                <h1 class="title">
                    We're {{ portalStatus }} your browser now
                </h1>
                <p class="body">
                    Normally this takes a couple seconds, hang tight!
                    <br>
                    If you have any issues either refresh the page or ask the room owner to restart the browser
                </p>
            </div>
            <!-- The portal has been created and the stream between the client and the aperture is being established -->
            <div v-else-if="portalStatus === 'open'" class="player-message">
                <h1 class="title">
                    Strap in...
                </h1>
                <p class="body">
                    Everything is ready - we're just getting the stream between the browser and you started
                </p>
            </div>
            <!-- Something wrong happened while starting the portal -->
            <div v-else-if="portalStatus === 'error'" class="player-message">
                <h1 class="title">
                    Oh, no!
                </h1>
                <p class="body">
                    Something bad happened that isn't letting this instance from starting a virtual browser.
                    <br>
                    We'll try to recover, but if this is stuck for too long, restart the room
                </p>
            </div>
            <div class="loading-wrapper">
                <div class="loading" />
            </div>
        </div>
        <Viewer v-else :loaded-scripts="this.loadedScripts"/>
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
            ...mapGetters(['user', 'room', 'portal', 'stream', 'janusId', 'janusIp', 'apertureWs', 'apertureToken']),

            showViewer() {
                if(process.env.ENABLE_JANUS)
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
        }
    }
</script>
