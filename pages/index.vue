<template>
    <div class="landing">
        <div :class="{ 'left': true, 'has-landing-video': hasLandingVideo }">
            <div class="center">
                <picture>
                    <source srcset="/img/logo.svg" media="(prefers-color-scheme: light)">
                    <img src="/img/logo-light.svg" class="logo">
                </picture>
                <h1 class="title">
                    Share the internet with your friends
                </h1>
                <p class="body">
                    {{ brand.name }} makes it easy to start up a room, add your friends, and browse the web
                </p>
                <div v-if="!token" class="login">
                    <Button
                        v-if="redirectUrl"
                        type="discord"
                        :href="redirectUrl"
                        icon="/icons/discord-white.svg"
                        hover="/icons/discord-colour.svg"
                    >
                        Login with Discord
                    </Button>
                    <p v-else class="disclaimer">
                        Uh-oh! Looks like we can't find a redirect URL for Login with Discord.
                        <br>
                        If this is your site, make sure the environment variables for both API and Web are setup correctly.
                    </p>
                </div>
                <div v-else class="continue">
                    <Button
                        href="/home"
                        icon="/icons/user-white.svg"
                        hover="/icons/user.svg"
                    >
                        Continue to {{ brand.name }}
                    </Button>
                </div>
            </div>
        </div>
        <div v-if="hasLandingVideo" class="right">
            <iframe
                class="video"
                width="1920"
                height="1080"
                :src="`https://www.youtube.com/embed/${brand.landing_video_id}?controls=0&autoplay=1&loop=1&mute=1`"
                frameborder="0"
                allow="accelerometer; autoplay; loop; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            />
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import brand from '~/brand/config'

    import Button from '~/components/Button'

    export default {
        layout: 'logged-out',
        middleware: 'logged-out',
        components: {
            Button
        },
        data() {
            return {
                brand
            }
        },
        computed: {
            ...mapGetters(['token']),

            hasLandingVideo() {
                return this.brand.landing_video_id && this.brand.landing_video_id.length > 0
            }
        },
        async asyncData(context) {
            const redirectUrl = await context.$axios.$get('auth/discord/redirect')

            return { redirectUrl }
        }
    }
</script>
<style src="~/static/css/landing.css" scoped></style>
