<template>
    <div class="invite-page">
        <div class="invite-wrapper" v-if=room>
            <div class="portal-indicator loading" v-if="room.portal.status === 'open'"></div>
            <img src="/icons/tv.svg" class="invite-image">
            <div class="invite-member-icons">
                <div class="invite-member-icon-wrapper" v-for="member in room.members" :key=member.id>
                    <img class="invite-member-icon" :src=member.icon>
                </div>
                <div class="invite-member-icons-overlay"></div>
            </div>
            <div class="invite-details">
                <h1 class="title" v-html="$t('invite.title', {room: room.name})"></h1>
                <p class="subtitle" v-html="$t('invite.subtitle', {membersList})"></p>
                <Form>
                    <Button type="discord" :href=redirectUrl v-if=!user icon="/icons/discord-white.svg" hover="/icons/discord-colour.svg">
                        {{ $t('invite.loginWithDiscord') }}
                    </Button>
                    <Button v-else-if=!isSelfInInvitedRoom :loading=loading :disabled=isSelfInRoom @click.native=joinRoom()>{{ loading ? $t('invite.acceptingInvite') : $t('invite.acceptInvite') }}</Button>
                    <Button v-else-if=isSelfInInvitedRoom href="/room">{{ $t('invite.viewRoom') }}</Button>
                </Form>
                <p class="disclaimer" v-if="isSelfInRoom && !isSelfInInvitedRoom">You're already in a room. You need to <a href="#" @click=leaveRoom()>leave the room you're in</a> before joining this one</p>
                <p class="disclaimer" v-else-if=isSelfInInvitedRoom v-html="$t('invite.alreadyInThisRoom')"></p>
                <p class="error" v-if=error>{{ error }}</p>
            </div>
        </div>
        <div class="invite-not-found" v-else>
            <h1 class="title" v-html="$t('invite.inviteNotFound.title')"></h1>
            <p class="subtitle" v-html="$t('invite.inviteNotFound.subtitle')"></p>
            <p>If something seems fishy, <nuxt-link to="/support" target="_blank">contact support</nuxt-link>.</p>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import brand from '~/brand/config'

    import Form from '~/components/form'
    import Button from '~/components/button'

    export default {
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
        head() {
            let inviteHeaders = {}

            if(this.room)
                inviteHeaders = {
                    meta: [
                        { name: 'description', content: `You've been invited to join ${this.membersList} on ${this.brand.name}, the best way to share the internet with your friends` },

                        { property: 'og:title', content: `Join ${this.room.name} on ${this.brand.name}` },
                        { property: 'og:description', content: `You've been invited to join ${this.membersList} on ${this.brand.name}, the best way to share the internet with your friends` },
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
            ...mapGetters(['user']),

            membersList() {
                const memberLimit = 3, members = this.room.members.slice(0, memberLimit)

                return `${members.map(({ name }) => name).join(', ')}${this.room.members.length > memberLimit ? ` ${this.$t("invite.membersOthers", [this.room.members.length - memberLimit])}` : ''}`
            },

            isSelfInRoom() {
                if(!this.user) return false

                return !!this.user.room
            },
            isSelfInInvitedRoom() {
                if(!this.user) return false

                return this.user.room && this.user.room.id === this.room.id
            }
        },
        data() {
            return {
                brand,
                error: '',
                loading: false
            }
        },
        methods: {
            async joinRoom() {
                if(this.isSelfInRoom) return
                
                this.loading = true

                try {
                    const room = await this.$axios.$post(`/invite/${this.$route.params.id}`)

                    this.$router.push('/room')
                } catch(error) {
                    this.error = error.response ? error.response.data.error.description : error

                    this.loading = false
                }
            },
            leaveRoom() {
                if(!confirm(this.$t('invite.confirmLeave', {room: this.user.room.name}))) return

                this.$store.dispatch('leaveRoom')
            }
        },
        components: {
            Form,
            Button
        }
    }
</script>
<style src="~/static/css/invite.css" scoped></style>
