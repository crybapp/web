<template>
    <div class="root">
        <Header />
        <div class="content" :class="{ 'is-center': !isRoomPage }">
            <nuxt />
            <GoogleAnalytics v-if=brand.ga_tracking_id />
        </div>
        <Footer v-if=!isRoomPage />
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
        head() {
            return {
                titleTemplate: chunk => (chunk ? `${chunk} - ${this.brand.name}` : this.brand.name)
            }
        },
        computed: {
            isRoomPage() {
                return this.$route.name === 'room'
            }
        }
    }
</script>
