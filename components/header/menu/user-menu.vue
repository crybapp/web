<template>
    <Menu class="user-menu" type="user" ref="menu" :dark="dark" v-if=user>
        <MenuSection>
            <MenuOption :html="true" :disabled="true">
                <p class="menu-option-content menu-option-title">{{ user.name }}</p>
            </MenuOption>
        </MenuSection>
        <MenuSection>
            <MenuOption to="/room" icon="preview" v-if="user.room && this.$route.name !== 'room'">View Room</MenuOption>
            <MenuOption name="leave-room" icon="panel-arrow-left" :loading=leavingRoom v-if=user.room>{{ leavingRoom ? 'Leaving...' : 'Leave Room'}}</MenuOption>

            <MenuOption to="/room/join" icon="panel-arrow-right" v-if=!user.room>Join Room</MenuOption>
            <MenuOption to="/room/create" icon="add" v-if=!user.room>Create Room</MenuOption>
        </MenuSection>
        <MenuSection>
            <MenuOption name="reload-profile" icon="user" :loading=reloadingProfile>{{ reloadingProfile ? 'Reloading...' : 'Reload Profile' }}</MenuOption>
            <MenuOption to="/" name="logout" icon="log-out">Logout</MenuOption>
        </MenuSection>
    </Menu>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Menu from './index'
    import MenuOption from './option'
    import MenuSection from './section'

    export default {
        computed: {
            ...mapGetters(['user'])
        },
        data() {
            return {
                leavingRoom: false,
                reloadingProfile: false,
                loadingInvites: false
            }
        },
        methods: {
            async reloadProfile() {
                this.reloadingProfile = true

                try {
                    const updatedUser = await this.$axios.$post('user/profile/refresh')

                    this.$refs.menu.toggleMenu()
                    this.$store.commit('handleSelfUser', updatedUser)
                } catch(error) {
                    alert(error)
                }

                this.reloadingProfile = false
            },
            async leaveRoom() {
                if(!confirm('Are you sure you want to leave this room? Once you leave this room, you cannot join back without an invite')) return
                
                this.leavingRoom = true

                try {
                    await this.$axios.$post('room/leave')

                    this.$router.push('/home')
                    this.$refs.menu.toggleMenu()
                    this.$store.commit('handleRoom', null)
                } catch(error) {
                    console.error(error)

                    if(error && error.response && error.response.status === 410)
                        this.$store.commit('handleRoom', null)
                }

                this.leavingRoom = false
            },

            async inviteFriends() {
                this.loadingInvites = true

                try {
                    await this.$router.push('invites')

                    this.$refs.menu.toggleMenu()
                } catch(error) {
                    alert(error)
                }

                this.loadingInvites = false
            },

            logout() {
                this.$store.commit('logout')
            },

            didClickOption(name) {
                if(!name) return this.$refs.menu.toggleMenu()

                if(name === 'reload-profile')
                    this.reloadProfile()
                else if(name === 'leave-room')
                    this.leaveRoom()
                else if(name === 'invite-friends')
                    this.inviteFriends()
                else if(name === 'logout')
                    this.logout()
            }
        },
        components: {
            Menu,
            MenuOption,
            MenuSection
        },
        props: [
            'dark'
        ]
    }
</script>