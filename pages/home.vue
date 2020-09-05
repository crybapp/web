<template>
    <div v-if=user class="home">
        <div v-if=room>
            <h1 class="title">
                Let's jump back into watching
            </h1>
            <p class="subtitle">
                You're already in a room. Click the button below to get back into the room.
                <br>
                Want to get out? There's an option for that too!
            </p>
            <div class="options">
                <ButtonBox icon="tv" to="/room">
                    Return to {{ room.name }}
                </ButtonBox>

                <ButtonBox icon="panel-arrow-right" :loading="leavingRoom"
                           :disabled="leavingRoom" @click.native="leaveRoom()">
                    {{ leavingRoom ? 'Leaving' : 'Leave' }} {{ room.name }}{{ leavingRoom ? '...' : '' }}
                </ButtonBox>
            </div>
        </div>
        <div v-else>
            <h1 class="title">
                Welcome Home
            </h1>
            <p class="subtitle">
                It's never been easier to join or start a room with your friends.
                <br>
                Select an option below to get started:
            </p>
            <div class="options">
                <ButtonBox
                    icon="panel-arrow-right"
                    href="/room/join"
                    :fake="true"
                    description="Received an invite link or an invite code for a room? Enter it here!"
                    @click.native="toggleJoinRoomModal()"
                >
                    Join a Room
                </ButtonBox>

                <ButtonBox
                    icon="add"
                    href="/room/create"
                    :fake="true"
                    description="Need a room where you can watch anything with your friends? This is the place to go"
                    @click.native="toggleCreateRoomModal()"
                >
                    Create a Room
                </ButtonBox>
            </div>
        </div>
        <p v-if="!isSecure" class="error">
            This instance is not using HTTPS for the web client, which will result in some
            <br>
            functionability to be disabled by your browser due to security concerns.
        </p>
        <p v-if="!tokenStored">
            This session will only last until you leave the page.
        </p>
        <Modal ref="createRoomModal" :cover="true">
            <CreateRoom />
        </Modal>
        <Modal ref="joinRoomModal" :cover="true">
            <JoinRoom />
        </Modal>
    </div>
</template>
<script>
    import cookies from 'browser-cookies'
    import { mapGetters } from 'vuex'

    import ButtonBox from '~/components/Button/Box'
    import Modal from '~/components/Modal'

    export default {
        middleware: 'authenticated',
        components: {
            ButtonBox,
            Modal,
            JoinRoom: () => import('~/components/Room/Join'),
            CreateRoom: () => import('~/components/Room/Create')
        },
        data() {
            return {
                leavingRoom: false
            }
        },
        computed: {
            ...mapGetters(['user']),
            room() {
                return this.$store.state.room || this.user.room || null
            },
            isSecure() {
                if (process.server)
                    return true // it'll update itself when client is rendered anyway

                return window.isSecureContext
            },
            tokenStored() {
                if (process.server)
                    return true

                return cookies.get('token') !== null
            }
        },
        methods: {
            leaveRoom() {
                if (!confirm('Are you sure you want to leave this room? Once you leave this room, you cannot join back without an invite.')) return

                this.leavingRoom = true
                this.$store.dispatch('leaveRoom')
            },

            toggleCreateRoomModal() {
                if (!this.$refs.createRoomModal)
                    return

                this.$refs.createRoomModal.visible = !this.$refs.createRoomModal.visible
            },
            toggleJoinRoomModal() {
                if (!this.$refs.joinRoomModal)
                    return

                this.$refs.joinRoomModal.visible = !this.$refs.joinRoomModal.visible
            }
        },
        head() {
            return {
                title: false
            }
        }
    }
</script>
