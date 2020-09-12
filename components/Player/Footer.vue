<template>
    <div class="player-footer">
        <div class="control-bar">
            <div class="volume-controls">
                <img v-if="!this.isStreamMuted && this.volumeValue > 0" src="~/assets/icons/volume-full.svg" alt="" class="icon" @click="toggleStreamMute"/>
                <img v-else src="~/assets/icons/volume-mute.svg" alt="" :title="isStreamMuted ? 'Unmute' : 'Mute'" class="icon" @click="toggleStreamMute"/>
                <input
                    v-model="volumeValue"
                    class="volume-slider"
                    type="range"
                    min="0"
                    max="100"
                    value="100"
                    step="1"
                    @input="volumeChanged"
                />
            </div>
            <div class="toggles">
                <!--<img src="~/assets/icons/keyboard.svg" alt="" title="Show keyboard" class="icon keyboard" @click="showKeyboard" />-->
                <img v-if="canPiP" src="~/assets/icons/pip.svg" alt="" title="Picture-in-Picture" class="icon" @click="togglePiP" />
                <img src="~/assets/icons/full-screen.svg" alt="" title="Fullscreen" class="icon" @click="toggleFullscreen" />
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
                volumeValue: 50
            }
        },
        computed: {
            ...mapGetters(['apertureWs', 'apertureToken', 'fullscreen', 'janusId', 'pip', 'portalStatus', 'room', 'users', 'userId', 'onlineUsers', 'viewerMuted']),

            isJanusEnabled() {
                return process.env.ENABLE_JANUS
            },
            canPiP() {
                if (process.server)
                    return false

                return ('pictureInPictureEnabled' in document && document.pictureInPictureEnabled)
            },
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
        mounted() {
            const volume = localStorage.getItem('volume')
            if (!isNaN(parseFloat(volume)) && isFinite(volume))
                this.volumeValue = volume
        },
        methods: {
            toggleStreamMute() {
                if (this.volumeValue <= 0) {
                    this.isStreamMuted = false
                    this.volumeValue = 50
                    this.volumeChanged()
                }
                else
                    this.isStreamMuted = !this.isStreamMuted

                this.$store.commit('setMutedStatus', this.isStreamMuted)
            },
            volumeChanged() {
                if (this.isStreamMuted)
                    this.toggleStreamMute()

                this.$store.commit('setViewerVolume', this.volumeValue)
            },

            /*showKeyboard() {
                // ToDo: Properly code
            },*/
            toggleFullscreen() {
                 if (this.pip && !this.fullscreen)
                    this.$store.commit('setPiPStatus', !this.pip)

                this.$store.commit('setFullscreenStatus', (document.fullscreenElement === null))
            },
            togglePiP() {
                if (!this.canPiP)
                    return

                if (this.fullscreen && !this.pip)
                    this.$store.commit('setFullscreenStatus', !this.fullscreen)

                this.$store.commit('setPiPStatus', (document.pictureInPictureElement === null))
            }
        }
    }
</script>
