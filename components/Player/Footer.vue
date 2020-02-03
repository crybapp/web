<template>
    <div class="player-footer">
        <div class="control-bar">
            <div class="volume-controls">
                <img v-if="!this.isStreamMuted" src="/icons/speaker-unmuted.svg" alt="" class="icon" @click="toggleStreamMute"/>
                <img v-else src="/icons/speaker-muted.svg" alt="" class="icon" @click="toggleStreamMute"/>
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
            </div>
            <img src="/icons/fullscreen.svg" alt="" class="fullscreen-toggle icon" @click="toggleFullscreen"/>
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
