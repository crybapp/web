<template>
    <div class="header" :class="{ 'is-dark': dark }">
        <div class="left">
            <nuxt-link :to="shouldShowRoomMenu ? '#room-menu' : (token ? '/home' : '/')" @click.native=toggleRoomMenu()>
                <div class="gradient loading"></div>
                <picture>
                    <source srcset="/img/logo.svg" media="(prefers-color-scheme: light)">
                    <img src="/img/logo-light.svg" class="logo">
                </picture>
            </nuxt-link>
            <h1 class="title" v-if=title>{{ title }}</h1>
            <RoomMenu :dark=dark ref="roomMenu" />
        </div>
        <div class="right" v-if=user>
            <img :src=userIcon v-if=userIcon class="profile-image" @click=toggleUserMenu()>
            <UserMenu :dark=dark ref="userMenu" />
        </div>
        <div class="right" v-else-if=token>
            <Button @click.native=logout()>Logout</Button>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import UserMenu from './menu/user-menu'
    import RoomMenu from './menu/room-menu'

    import Button from '~/components/button'

    export default {
        computed: {
            ...mapGetters(['user', 'token', 'room']),
            title() {
                if(this.$route.name === 'room' && this.room)
                    return this.room.name

                return null
            },
            userIcon() {
                if(!this.user) return null

                return this.user.icon.replace(".gif", ".png")
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
        },
        mounted() {
            if(this.$route.hash === '#user-menu')
                this.toggleUserMenu(true)
            else if(this.$route.hash === '#room-menu')
                this.toggleRoomMenu(true)
        },
        components: {
            Button,
            UserMenu,
            RoomMenu
        },
        props: [
            'dark',
            'loading'
        ]
    }
</script>
