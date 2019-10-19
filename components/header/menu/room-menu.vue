<template>
    <Menu class="room-menu" type="room" ref="menu" :dark="true" v-if=room>
        <MenuOption to="/home" icon="home">Go Home</MenuOption>
        <MenuSection>
            <MenuOption name="copyInvite" icon="door" :html="true" v-if=room.invites>
                <p class="menu-option-content menu-option-title">Invite Code</p>
                <p class="menu-option-content menu-option-subtitle">{{ room.invites[0].code }}</p>
                <p class="menu-option-content menu-option-hint">{{ hint }}</p>
            </MenuOption>
            <MenuOption name="refreshInvite" icon="die-3" :loading=refreshingInvite :disabled="refreshingInvite || destroyingRoom" v-if=room.invites>{{ refreshingInvite ? 'Refreshing...' : refreshInviteTooltip }}</MenuOption>
        </MenuSection>
        <MenuOption name="restartPortal" icon="cube" :loading=restartingPortal :disabled=restartingPortal v-if="room.portal.status === 'open'">{{ restartingPortal ? 'Restarting...' : 'Restart Browser' }}</MenuOption>
        <MenuOption name="destroyRoom" icon="circle-close" :loading=destroyingRoom :disabled="refreshingInvite || destroyingRoom">{{ destroyingRoom ? 'Deleting...' : 'Delete Room' }}</MenuOption>
    </Menu>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Menu from './index'
    import MenuOption from './option'
    import MenuSection from './section'

    export default {
        computed: {
            ...mapGetters(['room'])
        },
        data() {
            return {
                hint: 'Click to copy link',

                refreshingInvite: false,
                refreshInviteTooltip: 'Refresh Invite',
                refreshInviteTimeout: null,

                restartingPortal: false,

                destroyingRoom: false
            }
        },
        methods: {
            async restartPortal() {
                this.restartingPortal = true

                try {
                    await this.$axios.$post(`room/portal/restart`)

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
                    setTimeout(() => {
                        this.$refs.menu.toggleMenu()
                        this.hint = 'Click to copy link'
                    }, 500)
                } catch(error) {
                    alert(error)
                }
            },
            async refreshInvite() {
                this.refreshingInvite = true
                if(this.refreshInviteTimeout) clearTimeout(this.refreshInviteTimeout)

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
                if(!confirm('Are you sure you want to delete this room? This action is irreversible.')) return

                this.destroyingRoom = true
                this.refreshingInvite = false

                try {
                    await this.$axios.$delete('room')

                    this.$store.commit('handleRoom', null)
                } catch(error) {
                    console.error(error)
                }

                this.destroyingRoom = false
            },

            didClickOption(name) {
                if(!name) return this.$refs.menu.toggleMenu()

                if(name === 'copyInvite')
                    this.copyInvite()
                else if(name === 'refreshInvite')
                    this.refreshInvite()
                else if(name === 'restartPortal')
                    this.restartPortal()
                else if(name === 'destroyRoom')
                    this.destroyRoom()
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
