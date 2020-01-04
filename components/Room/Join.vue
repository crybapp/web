<template>
    <div class="room-join" :class="{ 'has-icon': modal && !loading }">
        <nuxt-link v-if=modal to="" @click.native="$parent.$parent.hideModals()">
            <img src="/icons/circle-close.svg" class="close-button">
            <img src="/icons/circle-close-filled.svg" class="close-button-hover">
        </nuxt-link>
        <h1 class="title">
            Join Room
        </h1>
        <p class="subtitle">
            You're in the right place! Paste in your invite code or link below to get started
        </p>
        <Form>
            <Input
                v-model="invite"
                placeholder="Invite Code or Link"
                :disabled="loading"
                @keydown.enter="joinRoom()"
            />
            <Button
                :loading="loading"
                :disabled="!isRoomInviteValid"
                @click.native="joinRoom()"
            >
                {{ loading ? 'Finding room...' : 'Find Room' }}
            </Button>
        </Form>
        <p v-if="error" class="error">
            {{ error }}
        </p>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Form from '~/components/Form'
    import Input from '~/components/Input'
    import Button from '~/components/Button'

    export default {
        components: {
            Form,
            Input,
            Button
        },
        props: [
            'modal'
        ],
        data() {
            return {
                error: null,
                loading: false,
                invite: ''
            }
        },
        computed: {
            ...mapGetters(['user']),

            isRoomInviteValid() {
                return this.invite.length > 0
            }
        },
        methods: {
            async joinRoom() {
                if (this.loading) return
                if (!this.isRoomInviteValid) return

                this.loading = true

                const parts = this.invite.split('/')
                const invite = parts[parts.length - 1]

                try {
                    await this.$axios.$get(`invite/${invite}/peek`)

                    this.$router.push(`/i/${invite}`)
                } catch(error) {
                    this.loading = false
                    this.error = error.response.data.error.description
                }
            }
        }
    }
</script>
