<template>
    <Menu v-if=room ref="menu" type="room" :header="true" :left="true">
        <MenuOption to="/home" icon="home">
            Go Home
        </MenuOption>
        <MenuSection>
            <MenuOption v-if=room.invites name="copyInvite" icon="door" :html="true">
                <p class="menu-option-content menu-option-title">
                    Invite Code
                </p>
                <p class="menu-option-content menu-option-subtitle">
                    {{ room.invites[0].code }}
                </p>
                <p class="menu-option-content menu-option-hint">
                    {{ hint }}
                </p>
            </MenuOption>
            <MenuOption name="refreshInvite" icon="die-3" :loading=refreshingInvite :disabled="refreshingInvite || destroyingRoom">
                {{ refreshingInvite ? 'Refreshing...' : (room.invites ? 'Refresh Invite' : 'Create Invite') }}
            </MenuOption>
        </MenuSection>
        <MenuOption v-if="room.portal.id && isRoomOwner" name="restartPortal" icon="cube" :loading=restartingPortal :disabled=restartingPortal>
            {{ restartingPortal ? 'Restarting...' : 'Restart Browser' }}
        </MenuOption>
        <MenuOption v-if=isRoomOwner name="destroyRoom" icon="circle-close" :loading=destroyingRoom :disabled="refreshingInvite || destroyingRoom">
            {{ destroyingRoom ? 'Deleting...' : 'Delete Room' }}
        </MenuOption>
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
                hint: 'Click to copy link',

                refreshingInvite: false,
                refreshInviteTimeout: null,

                restartingPortal: false,

                destroyingRoom: false
            }
        },
        computed: {
            ...mapGetters(['room', 'user']),
            isRoomOwner() {
                if (!this.user || !this.room)
                    return false

                return (this.user.id === (typeof this.room.owner === 'string' ? this.room.owner : this.room.owner.id))
            }
        },
        methods: {
            async restartPortal() {
                this.restartingPortal = true

                try {
                    await this.$axios.$post('room/portal/restart')

                    this.$refs.menu.toggleMenu()
                } catch(error) {
                    alert(error)
                }

                this.restartingPortal = false
            },
            async copyInvite() {
                try {
                    await this.$copyText(`${process.env.BASE_WEB_URL}/i/${this.room.invites[0].code}`)

                    this.hint = 'Copied!'
                    setTimeout(() => this.hint = 'Click to copy link', 1250)
                } catch(error) {
                    alert(error)
                }
            },
            async refreshInvite() {
                this.refreshingInvite = true
                if (this.refreshInviteTimeout)
                    clearTimeout(this.refreshInviteTimeout)

                try {
                    const invite = await this.$axios.$post('room/invite/refresh')

                    this.$store.commit('handleInvite', invite)

                    this.refreshInviteTooltip = 'Refreshed!'
                    this.refreshInviteTimeout = setTimeout(() => this.refreshInviteTooltip = 'Refresh Invite', 1250)
                } catch(error) {
                    alert(error)
                }

                this.refreshingInvite = false
            },
            async destroyRoom() {
                if (!confirm('Are you sure you want to delete this room? This action is irreversible.'))
                    return

                this.destroyingRoom = true
                this.refreshingInvite = false

                try {
                    await this.$axios.$delete('room')

                    this.$store.commit('handleRoom', null)
                    this.$router.push('/home')
                } catch(error) {
                    console.error(error)
                }

                this.destroyingRoom = false
            },

            didClickOption(name) {
                if (!name)
                    return this.$refs.menu.toggleMenu()

                switch (name) {
                    case 'copyInvite':
                        this.copyInvite()
                        break
                    case 'refreshInvite':
                        this.refreshInvite()
                        break
                    case 'restartPortal':
                        this.restartPortal()
                        break
                    case 'destroyRoom':
                        this.destroyRoom()
                        break
                }
            }
        }
    }
</script>
