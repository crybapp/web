<template>
    <div class="landing">
        <div :class="{ left: hasLandingVideo, 'has-landing-video': hasLandingVideo }">
            <div class="center">
                <picture>
                    <source srcset="/img/logo.svg" media="(prefers-color-scheme: light)">
                    <img src="/img/logo-light.svg" class="logo">
                </picture>
                <h1 class="title">Share the internet with your friends</h1>
                <p class="body">{{ brand.name }} makes it easy to start up a room, add your friends, and browse the web</p>
                <div class="login" v-if=!token>
                    <Button type="discord" :href=redirectUrl icon="/icons/discord-white.svg" hover="/icons/discord-colour.svg">
                        Login with Discord
                    </Button>
                </div>
                <div class="continue" v-else>
                    <Button href="/home" icon="/icons/user-white.svg" hover="/icons/user.svg">Continue to {{ brand.name }}</Button>
                </div>
            </div>
        </div>
        <div class="right" v-if=hasLandingVideo>
            <iframe class="video" width="1920" height="1080" :src="`https://www.youtube.com/embed/${brand.landing_video_id}?controls=0&autoplay=1&loop=1&playlist=${brand.landing_video_id}`" frameborder="0" allow="accelerometer; autoplay; loop; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    
    import brand from '~/brand/config'

    import Button from '~/components/button'

    export default {
        async asyncData(context) {
            const redirectUrl = await context.$axios.$get('auth/discord/redirect')

            return { redirectUrl }
        },
        computed: {
            ...mapGetters(['token']),

            hasLandingVideo() {
                return this.brand.landing_video_id && this.brand.landing_video_id.length > 0
            }
        },
        layout: 'logged-out',
        middleware: 'logged-out',
        data() {
            return {
                brand
            }
        },
        components: {
            Button
        }
    }
</script>
<style src="~/static/css/landing.css" scoped></style>
