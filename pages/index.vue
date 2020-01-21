<template>
    <div class="landing">
        <div class="left" :class="{ 'has-landing-video': hasLandingVideo }">
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
                <div v-if="user" class="continue">
                    <Button href="/home" icon="/icons/user-white.svg" hover="/icons/user.svg">
                        Continue to {{ brand.name }}
                    </Button>
                </div>
                <div v-else-if=!token class="login">
                    <Button v-if=redirectUrl theme="discord" :href=redirectUrl icon="/icons/discord-white.svg" hover-icon="/icons/discord-colour.svg" icon-alt="Discord Logo">
                        Login with Discord
                    </Button>
                    <p v-else class="disclaimer">
                        Uh-oh! Looks like we can't find a redirect URL for Login with Discord
                    </p>
                </div>
                <div v-else>
                    <p class="disclaimer">
                        An error has occurred while trying to authenticate with this instance's API
                    </p>
                </div>
            </div>
            <Footer />
        </div>
        <div v-if="hasLandingVideo" class="right">
            <iframe
                class="video"
                width="1920"
                height="1080"
                :src="`https://www.youtube.com/embed/${brand.landing_video_id}?controls=0&autoplay=1&loop=1&mute=1`"
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

    import Footer from '~/components/Footer'

    export default {
        layout: 'logged-out',
        middleware: 'logged-out',
        components: {
			Footer,
            Button
        },
        async asyncData(context) {
            let redirectUrl

            try {
                redirectUrl = await context.$axios.$get('auth/discord/redirect')
            } catch (error) {
                console.error(error)
            }

            return { redirectUrl }
        },
        data() {
            return {
                brand
            }
        },
        computed: {
            ...mapGetters(['token', 'user']),

            hasLandingVideo() {
                return this.brand.landing_video_id && this.brand.landing_video_id.length > 0
            }
        }
    }
</script>
