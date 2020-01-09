<template>
    <div v-if=room class="invite-wrapper">
        <div class="invite-info">
            <div v-if="room.portal.status === 'open'" class="portal-indicator loading" />
            <img src="/icons/tv.svg" class="invite-icon">
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
            <Button v-else-if="user && isSelfInInvitedRoom" href="/room">
                View Room
            </Button>
            <Button v-else-if=redirectUrl theme="discord" :href=redirectUrl icon="/icons/discord-white.svg" hover-icon="/icons/discord-colour.svg">
                Login with Discord
            </Button>
            <p v-if=reqFailed class="disclaimer">
                Looks like an issue occured while trying to contact
            </p>
            <p v-else-if=!redirectUrl class="disclaimer">
                Uh-oh! Looks like we can't find a redirect URL for Login with Discord.
            </p>
            <p v-else-if="token && !user" class="disclaimer">
                Please wait...
            </p>

            <p v-if="isSelfInRoom && !isSelfInInvitedRoom" class="disclaimer">
                You're already in a room. You need to <a href="#" @click="leaveRoom()">leave the room you're in</a> before joining this one
            </p>
            <p v-else-if=isSelfInInvitedRoom class="disclaimer">
                You're already in this room.
            </p>

            <p v-if=error class="error">
                {{ error }}
            </p>
        </div>
    </div>
    <div v-else class="invite-not-found">
        <h1 class="title">
            Invite Not Found
        </h1>
        <p class="subtitle">
            We couldn't find a room linked with this invite code. Make sure you have the right invite and try again!
        </p>
        <p class="disclaimer">
            You might want to <nuxt-link to="/home">
                go home
            </nuxt-link> now.
        </p>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import brand from '~/brand/config'

    import Form from '~/components/Form'
    import Button from '~/components/Button'

    export default {
        components: {
            Form,
            Button
        },
        data() {
            return {
                brand,
                error: '',
                loading: false,
                reqFailed: false
            }
        },
        head() {
            let inviteHeaders = {}

            if (this.room)
                inviteHeaders = {
                    meta: [
                        { name: 'description', content: `You've been invited to join ${this.membersList} on ${this.brand.name}, the best way to share the internet with your friends` },

                        { property: 'og:title', content: `Join ${this.room.name} on ${this.brand.name}` },
                        { property: 'og:description', content: `You've been invted to join ${this.membersList} on ${this.brand.name}, the best way to share the internet with your friends` },
                    ],
                    link: [
                        { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }
                    ]
                }

            return {
                title: this.room ? `Join ${this.room.name}` : 'Invite Not Found',
                ...inviteHeaders
            }
        },
        computed: {
            ...mapGetters(['token', 'user']),

            membersList() {
                const memberLimit = 3, members = this.room.members.slice(0, 3)

                return `${members.map(({ name }) => name).join(', ')}${this.room.members.length > memberLimit ? ` and ${this.room.members.length - memberLimit} others` : ''}`
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
        async mounted() {
            if (this.token && !this.user)
                try {
                    await this.$axios.$get('user/me')
                    // fetch user if it worked
                    // ToDo: avoid doing 2 requests for this
                    this.$store.dispatch('fetchUser')
                } catch(error) {
                    if (error.response && error.response.data.response === 'USER_NO_AUTH')
                        this.$store.commit('logout')
                    else
                        this.reqFailed = true
                }
        },
        async asyncData(context) {
            try {
                const redirectUrl = await context.$axios.$get(`/auth/discord/redirect?invite=${context.route.params.id}`),
                    room = await context.$axios.$get(`/invite/${context.route.params.id}/peek`)

                return { room, redirectUrl }
            } catch(error) {
                console.error(error)
                return { room: null, redirectUrl: null }
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
        }
    }
</script>
