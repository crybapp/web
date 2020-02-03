<template>
    <div class="root">
        <nuxt />
        <GoogleAnalytics v-if=brand.ga_tracking_id />
    </div>
</template>
<script>
    import brand from '~/brand/config'

    import GoogleAnalytics from '~/components/GoogleAnalytics'

    export default {
        components: {
            GoogleAnalytics
        },
        data() {
            return {
                brand
            }
        }
    }
</script>
