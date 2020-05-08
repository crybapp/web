<template>
    <div v-if="room" class="invite-wrapper">
        <div class="invite-info">
            <div v-if="room.portal.status === 'open'" class="portal-indicator loading" />
            <img src="~/assets/icons/tv.svg" class="invite-icon">
            <div class="invite-member-icons">
                <div v-for="member in room.members" :key=member.id class="invite-member-icon-wrapper">
                    <img class="invite-member-icon" :src=member.icon>
                </div>
                <div class="invite-member-icons-overlay" />
            </div>
        </div>
        <div class="invite-meta">
            <h1 class="title">
                Join {{ room.name }}
            </h1>
            <p class="subtitle">
                Start watching along with {{ membersList }} instantly
            </p>
            <Button v-if="user && !isSelfInInvitedRoom" :loading=loading :disabled="loading || isSelfInRoom" @click.native=joinRoom()>
                {{ loading ? 'Accepting invite...' : 'Accept Invite' }}
            </Button>
            <Button v-else-if="user && isSelfInInvitedRoom" to="/room">
                View Room
            </Button>
            <LoginButton v-else :invite="inviteId" />

            <p v-if="isSelfInRoom && !isSelfInInvitedRoom" class="disclaimer">
                You're already in a room. You need to <a class="is-hoverable" @click="leaveRoom()">leave the room you're in</a> before joining this one
            </p>
            <p v-else-if=isSelfInInvitedRoom class="disclaimer">
                You're already in this room.
            </p>

            <p v-if=error class="error">
                {{ error }}
            </p>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import brand from '~/brand/config'

    import Button from '~/components/Button'
    import LoginButton from '~/components/Button/Login'

    export default {
        components: {
            Button,
            LoginButton
        },
        async asyncData(context) {
            const room = await context.$axios.$get(`/invite/${context.route.params.id}/peek`)

            return { room }
        },
        data() {
            return {
                brand,
                error: '',
                loading: false,
                reqFailed: false
            }
        },
        computed: {
            ...mapGetters(['user']),

            membersList() {
                const memberLimit = 3, members = this.room.members.slice(0, 3)

                return `${members.map(({ name }) => name).join(', ')}${this.room.members.length > memberLimit ? ` and ${this.room.members.length - memberLimit} others` : ''}`
            },

            inviteId() {
                return this.$route.params.id
            },
            isSelfInRoom() {
                if (!this.user) return false

                return !!this.user.room
            },
            isSelfInInvitedRoom() {
                if (!this.user) return false

                return this.user.room && this.user.room.id === this.room.id
            }
        },
        methods: {
            async joinRoom() {
                if (this.isSelfInRoom) return

                this.loading = true

                try {
                    await this.$axios.$post(`/invite/${this.$route.params.id}`)

                    this.$router.push('/room')
                } catch(error) {
                    this.error = error.response ? error.response.data.error.description : error

                    this.loading = false
                }
            },
            leaveRoom() {
                if (!confirm(`Are you sure you want to leave ${this.user.room.name}? Once you leave, you cannot join back without an invite`)) return

                this.$store.dispatch('leaveRoom')
            }
        },
        head() {
            let inviteHeaders = {}

            if (this.room)
                inviteHeaders = {
                    meta: [
                        { hid: 'description', name: 'description', content: `You've been invited to join ${this.membersList} on ${this.brand.name}, the best way to share the internet with your friends` },

                        { hid: 'og:title', property: 'og:title', content: `Join ${this.room.name} on ${this.brand.name}` },
                        { hid: 'og:description', property: 'og:description', content: `You've been invted to join ${this.membersList} on ${this.brand.name}, the best way to share the internet with your friends` },
                    ]
                }

            return {
                title: this.room ? `Join ${this.room.name}` : 'Invite Not Found',
                ...inviteHeaders
            }
        },
    }
</script>
