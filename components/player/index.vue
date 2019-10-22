<template>
    <div class="player-wrapper" v-if=room>
        <div class="player stream-loading" v-if=!showViewer>
            <video class="static-placeholder" src="https://cryb.nyc3.cdn.digitaloceanspaces.com/static-assets/static-placeholder.mp4" autoplay muted loop></video>
            <p class="player-dev" v-if=showPlayerDevtools>
                Portal ID: {{ portal.id || 'N/A' }}<br>
                Portal Status: {{ portalStatus }}
            </p>
            <!-- Portal is not open and there is only one person in the room -->
            <div class="player-msg" v-if="(portalStatus === 'waiting' || portalStatus === 'closed') && room.members.length === 1"> 
                <h1 class="title" v-html="$t('room.player.new.title')"></h1>
                <p class="body" v-html="$t('room.player.new.body')"></p>
            </div>
            <!-- Portal is not open but there are more than one members in the room -->
            <div class="player-msg" v-else-if="(portalStatus === 'waiting' || portalStatus === 'closed') && room.members.length > 1">
                <h1 class="title" v-html="$t('room.player.waiting.title')"></h1>
                <p class="body" v-html="$t('room.player.waiting.body')"></p>    
            </div>
            <!-- A portal has been placed into the queue -->
            <div class="player-msg" v-else-if="portalStatus === 'in-queue'">
                <h1 class="title" v-html="$t('room.player.queued.title')"></h1>
                <p class="body" v-html="$t('room.player.queued.body')"></p>
            </div>
            <!-- The portal is being created -->
            <div class="player-msg" v-else-if="portalStatus === 'creating'">
                <h1 class="title" v-html="$t('room.player.creating.title')"></h1>
                <p class="body" v-html="$t('room.player.creating.body')"></p>
            </div>
            <!-- The portal is starting -->
            <div class="player-msg" v-else-if="portalStatus === 'starting'">
                <h1 class="title" v-html="$t('room.player.starting.title')"></h1>
                <p class="body" v-html="$t('room.player.starting.body')"></p>    
            </div>
            <!-- The portal is created and the stream between the client and the aperture is being established -->
            <div class="player-msg" v-else-if="portalStatus === 'open'">
                <h1 class="title" v-html="$t('room.player.connecting.title')"></h1>
                <p class="body" v-html="$t('room.player.connecting.body')"></p>
            </div>
            <div class="loading-wrapper">
                <div class="loading"></div>
            </div>
        </div>
        <Viewer v-else />
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Button from '~/components/button'
    import Viewer from '~/components/player/viewer'

    export default {
        computed: {
            ...mapGetters(['user', 'room', 'portal', 'stream', 'apertureWs', 'apertureToken']),

            showViewer() {
                return this.portalStatus === 'open' && this.apertureWs && this.apertureToken
            },
            showPlayerDevtools() {
                return process.env.SHOW_PLAYER_DEVTOOLS
            },

            portalStatus() {
                return this.portal.status
            },

            isSelfRoomOwner() {
                return this.room.owner.id === this.user.id
            }
        },
        components: {
            Button,
            Viewer
        }
    }
</script>
<style src="~/static/css/room/player.css">
/* Manage scoping properly */
</style>
