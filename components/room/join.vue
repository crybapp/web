<template>
    <div class="room-join" :class="{ 'has-icon': modal && !loading }">
        <nuxt-link to="" @click.native=$parent.$parent.hideModals()>
            <img src="/icons/circle-close.svg" class="close-button">
            <img src="/icons/circle-close-filled.svg" class="close-button-hover">
        </nuxt-link>
        <h1 class="title" v-html="$t('home.modals.joinRoom.title')"></h1>
        <p class="subtitle" v-html="$t('home.modals.joinRoom.subtitle')"></p>
        <Form>
            <Input :placeholder="$t('home.modals.joinRoom.placeholder')" v-model=invite :disabled=loading @keydown.enter=joinRoom() />
            <Button @click.native=joinRoom() :loading=loading :disabled=!isRoomInviteValid>{{ loading ? $t('home.modals.joinRoom.findingRoom') : $t('home.modals.joinRoom.findRoom') }}</Button>
        </Form>
        <p class="error" v-if=error>{{ error }}</p>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Form from '~/components/form'
    import Input from '~/components/input'
    import Button from '~/components/button'

    export default {
        computed: {
            ...mapGetters(['user']),

            isRoomInviteValid() {
                return this.invite.length > 0
            }
        },
        data() {
            return {
                error: null,
                loading: false,
                invite: ''
            }
        },
        methods: {
            async joinRoom() {
                if(this.loading) return
                if(!this.isRoomInviteValid) return

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
        },
        props: [
            'modal'
        ],
        components: {
            Form,
            Input,
            Button
        }
    }
</script>
