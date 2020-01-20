<template>
    <div class="player-footer">
        <div class="control-bar">
            <div class="mute-button" @click="toggleStreamMute">
                <svg v-if="!this.isStreamMuted" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
            </div>
            <input 
                v-model="volumeValue"
                class="volume-slider" 
                type="range" 
                min="0" 
                max="100" 
                value=100 
                step="1"
                @input="volumeChanged"
            />
            <div class="fullscreen-button" @click="toggleFullscreen">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
            </div>
        </div>
        <div class="user-icons">
            <UserIcon
                v-for="member in members"
                :key="member.id"
                :member="member"
            />
            <RoomInviteHint v-if="memberIds.length === 1" />
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import UserIcon from '~/components/Player/UserIcon'
    import RoomInviteHint from '~/components/Invite/Room/Hint'

    export default {
        components: {
            UserIcon,
            RoomInviteHint
        },
        data() {
            return {
                isStreamMuted: this.viewerMuted,
                volumeValue: 30
            }
        },
        computed: {
            ...mapGetters(['room', 'users', 'userId', 'onlineUsers', 'viewerMuted']),

            members() {
                const users = this.memberIds.map(id => this.users[id]).filter(user => user !== null),
                        online = users.filter(user =>
                            this.onlineUsers // Get the array of online users
                                .map(({ id }) => id) // Filter the array down to the ID property
                                .indexOf(user.id) > -1 || // Check if the current user being filter checked is in the array
                            user.id === this.userId
                        ),
                        offline = users.filter(user =>
                            this.onlineUsers // Get the array of online users
                                .map(({ id }) => id) // Filter the array down to the ID property
                                .indexOf(user.id) === -1 && // Check if the current user being filter checked is not in the array
                            user.id !== this.userId
                        )

                return [...online, ...offline]
            },
            memberIds() {
                if (!this.room || !this.room.members) return []

                return [...new Set(this.room.members.map(({ id }) => id))]
            }
        },
        methods: {
            toggleStreamMute() {
                this.isStreamMuted = !this.isStreamMuted
                this.$store.commit('setMutedStatus', this.isStreamMuted)
            },
            volumeChanged() {
                this.$store.commit('setViewerVolume', this.volumeValue)
            },
            toggleFullscreen() {
                this.$root.$emit('toggle-fullscreen')
            }
        }
    }
</script>
