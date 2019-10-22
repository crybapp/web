<template>
    <div class="room-create" :class="{ 'has-icon': modal && !loading }">
        <nuxt-link to="" @click.native=$parent.$parent.hideModals()>
            <img src="/icons/circle-close.svg" class="close-button">
            <img src="/icons/circle-close-filled.svg" class="close-button-hover">
        </nuxt-link>
        <h1 class="title" v-html="$t('home.modals.createRoom.title')"></h1>
        <p class="subtitle" v-html="$t('home.modals.createRoom.subtitle')"></p>
        <Form>
            <Input placeholder="Room Name" v-model=roomName :disabled=loading @keydown.enter=createRoom() />
            <Button @click.native=createRoom() :disabled=!isRoomNameValid :loading=loading>{{ loading ? $t('home.modals.createRoom.creatingRoom') : $t('home.modals.createRoom.createRoom')}}</Button>
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

            isRoomNameValid() {
                return this.roomName.length > 0 &&
                        this.roomName.length < 30
            }
        },
        data() {
            return {
                error: null,
                loading: false,
                roomName: ''
            }
        },
        methods: {
            async createRoom() {
                if(this.loading) return
                if(!this.isRoomNameValid) return

                this.error = null
                this.loading = true

                try {
                    const room = await this.$axios.$post('room', { name: this.roomName })

                    this.$router.push(`/room`)
                } catch(error) {
                    this.error = error.response.data ? error.response.data.error.description : error

                    this.loading = false
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
