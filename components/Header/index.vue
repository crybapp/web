<template>
    <div class="header" :class="{ 'is-dark': dark }">
        <div class="left">
            <nuxt-link :to="shouldShowRoomMenu ? '#room-menu' : (token ? '/home' : '/')" @click.native="toggleRoomMenu()">
                <div class="gradient loading" />
                <picture>
                    <source srcset="/img/logo.svg" media="(prefers-color-scheme: light)">
                    <img src="/img/logo-light.svg" class="logo">
                </picture>
            </nuxt-link>
            <h1 v-if="title" class="title">
                {{ title }}
            </h1>
            <RoomMenu ref="roomMenu" :dark="dark" />
        </div>
        <div v-if="user" class="right">
            <img
                v-if="userIcon"
                :src="userIcon"
                class="profile-image"
                @click="toggleUserMenu()"
            >
            <UserMenu ref="userMenu" :dark="dark" />
        </div>
        <div v-else-if="token" class="right">
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
            'dark',
            'loading'
        ],
        computed: {
            ...mapGetters(['user', 'token', 'room']),
            title() {
                if(this.$route.name === 'room' && this.room)
                    return this.room.name

                return null
            },
            userIcon() {
                if(!this.user) return null

                return this.user.icon.replace('.gif', '.png')
            },

            isUserMenuVisible() {
                if(!this.$refs.userMenu.$children[0]) return false

                return this.$refs.userMenu.$children[0].visible
            },
            isRoomMenuVisible() {
                if(!this.$refs.roomMenu.$children[0]) return false

                return this.$refs.roomMenu.$children[0].visible
            },
            shouldShowRoomMenu() {
                if(!this.user) return false
                if(!this.room) return false

                return this.user.id === (typeof this.room.owner === 'string' ? this.room.owner : this.room.owner.id) && this.$route.name === 'room'
            }
        },
        mounted() {
            if(this.$route.hash === '#user-menu')
                this.toggleUserMenu(true)
            else if(this.$route.hash === '#room-menu')
                this.toggleRoomMenu(true)
        },
        methods: {
            logout() {
                this.$store.commit('logout')
                this.$router.push('/')
            },

            toggleUserMenu(userAction) {
                if(!this.isUserMenuVisible && this.isRoomMenuVisible && userAction)
                    this.toggleRoomMenu(false)

                this.$refs.userMenu.$children[0].toggleMenu()
                this.$router.push(this.isUserMenuVisible ? '#user-menu' : '')
            },
            toggleRoomMenu(userAction) {
                if(!this.isRoomMenuVisible && this.isUserMenuVisible && userAction)
                    this.toggleUserMenu(false)

                if(!this.shouldShowRoomMenu) return

                this.$refs.roomMenu.$children[0].toggleMenu()
                this.$router.push(this.isRoomMenuVisible ? '#room-menu' : '')
            }
        }
    }
</script>
