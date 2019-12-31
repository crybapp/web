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
                <div v-if="user" class="continue">
                    <Button
                        href="/home"
                        icon="/icons/user-white.svg"
                        hover="/icons/user.svg"
                    >
                        Continue to {{ brand.name }}
                    </Button>
                </div>
                <div v-else-if="!token" class="login">
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
                    </p>
                </div>
                <div v-else-if="reqFailed">
                    <p class="disclaimer">
                        An error has occurred trying to contact this instance's API.
                    </p>
                </div>
                <div v-else>
                    <p class="disclaimer">
                        Please wait...
                    </p>
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
                brand,
                reqFailed: false
            }
        },
        computed: {
            ...mapGetters(['token', 'user']),

            hasLandingVideo() {
                return this.brand.landing_video_id && this.brand.landing_video_id.length > 0
            }
        },
        async mounted() {
            if(this.token && !this.user) {
                try {
                    await this.$axios.$get('user/me')
                    // fetch user and redirect automatically if it worked
                    // ToDo: avoid doing 2 requests for this
                    this.$store.dispatch('fetchUser')
                    setTimeout(() => this.$router.push('/home'), 250)
                } catch(error) {
                    if (error.response && error.response.data.response === 'USER_NO_AUTH')
                        this.$store.commit('logout')
                    else
                        this.reqFailed = true
                }
            }
        },
        async asyncData(context) {
            try {
                const redirectUrl = await context.$axios.$get('auth/discord/redirect')

                return {redirectUrl}
            } catch (error) {
                console.error(error)
                return null
            }
        }
    }
</script>
<style src="~/static/css/landing.css" scoped></style>
