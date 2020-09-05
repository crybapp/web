<template>
    <div class="root">
        <Header />
        <div class="content is-center">
            <nuxt />
            <GoogleAnalytics v-if=brand.ga_tracking_id />
        </div>
        <Footer v-if="!isRoomPage && showFooter" />
    </div>
</template>
<script>
    import brand from '~/brand/config'

    import Header from '~/components/Header'
    import Footer from '~/components/Footer'

    import GoogleAnalytics from '~/components/GoogleAnalytics'

    export default {
        components: {
			Header,
			Footer,
            GoogleAnalytics
        },
        data() {
            return {
                brand
            }
        },
        computed: {
            isRoomPage() {
                return this.$route.name === 'room'
            },
            showFooter() {
                return process.env.SHOW_FOOTER
            }
        },
        head() {
            return {
                titleTemplate: chunk => (chunk ? `${chunk} - ${this.brand.name}` : this.brand.name)
            }
        }
    }
</script>
