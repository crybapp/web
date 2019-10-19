<template>
    <div class="root">
        <nuxt />
        <GoogleAnalytics v-if=brand.ga_tracking_id />
    </div>
</template>
<script>
    import brand from '~/brand/config'

    import GoogleAnalytics from '~/components/analytics'

    export default {
        head() {
            const script = []

            if(this.brand.ga_tracking_id)
                script.push({
                    src: `https://www.googletagmanager.com/gtag/js?id=${this.brand.ga_tracking_id}`
                })

            return {
                titleTemplate: this.brand.name,
                meta: [
                    { charset: 'utf-8' },
                    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                    { name: 'description', content: `${this.brand.name} makes it easy to enjoy what you love with your friends` }
                ],
                link: [
                    { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }
                ],
                script: [
                    ...script
                ]
            }
        },
        data() {
            return {
                brand
            }
        },
        components: {
            GoogleAnalytics
        }
    }
</script>

<style src="~/static/css/master.css"></style>
<style src="~/static/css/components.css"></style>
