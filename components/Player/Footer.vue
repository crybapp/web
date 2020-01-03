<template>
    <div class="player-footer">
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
        computed: {
            ...mapGetters(['room', 'users', 'userId', 'onlineUsers']),

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
                if(!this.room || !this.room.members) return []

                return [...new Set(this.room.members.map(({ id }) => id))]
            }
        }
    }
</script>
