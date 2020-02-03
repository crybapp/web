<template>
    <div class="header">
        <div class="left">
            <nuxt-link class="is-wrapper" :to="shouldShowRoomMenu ? '#room-menu' : (token ? '/home' : '/')" @click.native=toggleRoomMenu()>
                <div class="gradient loading" />
                <picture class="logo">
                    <source srcset="/img/logo.svg" media="(prefers-color-scheme: light)">
                    <img src="/img/logo-light.svg" class="logo">
                </picture>
            </nuxt-link>

            <h1 v-if=title class="header-title">
                {{ title }}
            </h1>
            <RoomMenu ref="roomMenu" />
        </div>
        <div v-if=user class="right">
            <img v-if=userIcon :src=userIcon class="profile-image" @click=toggleUserMenu()>
            <UserMenu ref="userMenu" />
        </div>
        <div v-else-if=token class="right">
            <Button @click.native="logout()">
                Logout
            </Button>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Button from '~/components/Button'

    import UserMenu from '~/components/Header/Menu/UserMenu'
    import RoomMenu from '~/components/Header/Menu/RoomMenu'

    export default {
        components: {
            Button,
            UserMenu,
            RoomMenu
        },
        props: [
            'loading'
        ],
        computed: {
            ...mapGetters(['user', 'token', 'room']),
            title() {
                if (this.$route.name === 'room' && this.room)
                    return this.room.name

                return null
            },
            userIcon() {
                if (!this.user) return null

                // ToDo: Re-work how animated avatars work.
                return this.user.icon.replace('.gif', '.png')
            },

            isUserMenuVisible() {
                if (!this.$refs.userMenu || !this.$refs.userMenu.$children[0]) return false

                return this.$refs.userMenu.$children[0].visible
            },
            isRoomMenuVisible() {
                if (!this.$refs.userMenu || !this.$refs.roomMenu.$children[0]) return false

                return this.$refs.roomMenu.$children[0].visible
            },
            shouldShowRoomMenu() {
                if (!this.user || !this.room) return false

                return (this.$route.name === 'room' && this.user.id === (typeof this.room.owner === 'string' ? this.room.owner : this.room.owner.id))
            }
        },
        mounted() {
            if (this.$route.hash === '#user-menu')
                this.toggleUserMenu(true)
            else if (this.$route.hash === '#room-menu')
                this.toggleRoomMenu(true)
        },
        methods: {
            logout() {
                this.$store.commit('logout')
                this.$router.push('/')
            },

            toggleUserMenu(userAction) {
                if (!this.isUserMenuVisible && this.isRoomMenuVisible && userAction)
                    this.toggleRoomMenu(false)

                this.$refs.userMenu.$children[0].toggleMenu()
            },
            toggleRoomMenu(userAction) {
                if (!this.isRoomMenuVisible && this.isUserMenuVisible && userAction)
                    this.toggleUserMenu(false)

                if (!this.shouldShowRoomMenu) return

                this.$refs.roomMenu.$children[0].toggleMenu()
            }
        }
    }
</script>
