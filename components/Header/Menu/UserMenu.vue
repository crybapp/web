<template>
    <Menu
        v-if="user"
        ref="menu"
        class="user-menu"
        type="user"
    >
        <MenuSection>
            <MenuOption :html="true" :disabled="true">
                <p class="menu-option-content menu-option-title">
                    {{ user.name }}
                </p>
            </MenuOption>
        </MenuSection>
        <MenuSection>
            <MenuOption
                v-if="user.room && this.$route.name !== 'room'"
                to="/room"
                icon="preview"
            >
                View Room
            </MenuOption>
            <MenuOption
                v-if="user.room"
                name="leave-room"
                icon="panel-arrow-left"
                :loading="leavingRoom"
            >
                {{ leavingRoom ? 'Leaving...' : 'Leave Room' }}
            </MenuOption>

            <MenuOption
                v-if="!user.room"
                to="/room/join"
                icon="panel-arrow-right"
            >
                Join Room
            </MenuOption>
            <MenuOption
                v-if="!user.room"
                to="/room/create"
                icon="add"
            >
                Create Room
            </MenuOption>
        </MenuSection>
        <MenuSection>
            <MenuOption
                name="reload-profile"
                icon="user"
                :loading="reloadingProfile"
            >
                {{ reloadingProfile ? 'Reloading...' : 'Reload Profile' }}
            </MenuOption>
            <MenuOption
                to="/"
                name="logout"
                icon="log-out"
            >
                Logout
            </MenuOption>
        </MenuSection>
    </Menu>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Menu from '~/components/Header/Menu'
    import MenuOption from '~/components/Header/Menu/Option'
    import MenuSection from '~/components/Header/Menu/Section'

    export default {
        components: {
            Menu,
            MenuOption,
            MenuSection
        },
        data() {
            return {
                leavingRoom: false,
                reloadingProfile: false,
                loadingInvites: false
            }
        },
        computed: {
            ...mapGetters(['user'])
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
        }
    }
</script>
