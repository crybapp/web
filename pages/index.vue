<template>
    <div class="landing">
        <div class="left" :class="{ 'has-landing-video': hasLandingVideo }">
            <div class="centre">
                <div class="logo-small logo-mask" />
                <h1 class="title">
                    Share the internet with your friends
                </h1>
                <p class="body">
                    {{ brand.name }} makes it easy to start up a room, add your friends, and browse the web
                </p>
                <LoginButton />
                <p v-if="!isSecure" class="error">
                    This instance is not using HTTPS for the web client, which will result in some functionability to be disabled by your browser due to security concerns.
                </p>
            </div>
            <Footer />
        </div>
        <div v-if="hasLandingVideo" class="right">
            <iframe
                class="video"
                width="1920"
                height="1080"
                :src="`https://www.youtube.com/embed/${brand.landing_video_id}?controls=0&autoplay=1&loop=1&mute=1&playlist=${brand.landing_video_id}`"
                allow="accelerometer; autoplay; loop; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            />
        </div>
    </div>
</template>
<script>
    import brand from '~/brand/config'

    import LoginButton from '~/components/Button/Login'
    import Footer from '~/components/Footer'

    export default {
        layout: 'logged-out',
        middleware: 'logged-out',
        components: {
			Footer,
            LoginButton
        },
        data() {
            return {
                brand
            }
        },
        computed: {
            hasLandingVideo() {
                return this.brand.landing_video_id && this.brand.landing_video_id.length > 0
            },
            isSecure() {
                if (process.server)
                    return true

                return window.isSecureContext
            }
        }
    }
</script>
