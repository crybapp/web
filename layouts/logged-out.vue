<template>
    <div class="root">
        <nuxt />
    </div>
</template>
<script>
    import brand from '~/brand/config'

    export default {
        head() {
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
                    {
                        src: 'https://www.googletagmanager.com/gtag/js?id=UA-146441740-1'
                    }
                ]
            }
        },
        data() {
            return {
                brand
            }
        }
    }
</script>
<style src="~/static/css/cryb-master.css"></style>
<style src="~/static/css/cryb-components.css"></style>
