<template>
    <div class="root">
        <nuxt />
    </div>
</template>
<script>
    export default {
        head() {
            return {
                titleTemplate: 'Cryb',
                meta: [
                    { charset: 'utf-8' },
                    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                    { name: 'description', content: 'Cryb makes it easy to enjoy what you love with your friends' }
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
        }
    }
</script>
<style src="~/static/css/cryb-master.css"></style>
<style src="~/static/css/cryb-components.css"></style>