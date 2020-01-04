<template>
    <div class="room-create" :class="{ 'has-icon': modal && !loading }">
        <nuxt-link v-if=modal to="" @click.native=$parent.$parent.hideModals()>
            <img src="/icons/circle-close.svg" class="close-button">
            <img src="/icons/circle-close-filled.svg" class="close-button-hover">
        </nuxt-link>
        <h1 class="title">
            Create a Room
        </h1>
        <p class="subtitle">
            When you create a room, you'll be able to add your friends and browse the internet
        </p>
        <Form>
            <Input
                v-model=roomName
                placeholder="Room Name"
                :disabled=loading
                @keydown.enter=createRoom()
            />
            <Button
                :loading=loading
                :disabled="loading || !isRoomNameValid"
                @click.native=createRoom()
            >
                {{ loading ? 'Creating room...' : 'Create Room' }}
            </Button>
        </Form>
        <p v-if=error class="error">
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
                roomName: ''
            }
        },
        computed: {
            ...mapGetters(['user']),

            isRoomNameValid() {
                return this.roomName.length > 0 &&
                        this.roomName.length < 30
            }
        },
        methods: {
            async createRoom() {
                if (this.loading) return
                if (!this.isRoomNameValid) return

                this.error = null
                this.loading = true

                try {
                    await this.$axios.$post('room', { name: this.roomName })

                    this.$router.push(`/room`)
                } catch(error) {
                    this.error = error.response.data ? error.response.data.error.description : error

                    this.loading = false
                }
            }
        }
    }
</script>
