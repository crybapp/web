<template>
    <div class="root">
        <Header :dark="isDarkTheme" />
        <div class="content" :class="{ 'is-dark': isDarkTheme, 'is-center': !isRoomPage }">
            <nuxt />
            <GoogleAnalytics v-if="brand.ga_tracking_id" />
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import brand from '~/brand/config'

    import Header from '~/components/Header'
    import GoogleAnalytics from '~/components/GoogleAnalytics'

    export default {
        components: {
            Header,
            GoogleAnalytics
        },
        data() {
            return {
                brand
            }
        },
        head() {
            const script = []

            if(this.brand.ga_tracking_id)
                script.push({
                    src: `https://www.googletagmanager.com/gtag/js?id=${this.brand.ga_tracking_id}`
                })

            return {
                titleTemplate: chunk => this.$route.name === 'room' && this.room ? `${this.room.name} - ${this.brand.name}` : (chunk ? `${chunk} - ${this.brand.name}` : this.brand.name),
                meta: [
                    { charset: 'utf-8' },
                    { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no' },
                    { name: 'description', content: `${this.brand.name} makes it easy to enjoy what you love with your friends` },
                    { name: 'theme-color', content: '#000000' },
                    { property: 'og:image', content: '/img/icon-hq.png'}
                ],
                link: [
                    { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }
                ],
                script: [
                    ...script
                ]
            }
        },
        computed: {
            ...mapGetters(['room']),

            isRoomPage() {
                return this.$route.name === 'room'
            },
            isDarkTheme() {
                return this.isRoomPage
            }
        }
    }
</script>
<style src="~/static/fonts/inter.css"></style>
<style src="~/static/css/master.css"></style>
<style src="~/static/css/components.css"></style>
