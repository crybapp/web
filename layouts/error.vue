<template>
    <div class="center">
        <h1 class="title" v-if="error.statusCode === 404">{{ error.statusCode }} Not Found</h1>
        <h1 class="title" v-else-if=error.statusCode>{{ error.statusCode }}</h1>
        <h1 class="title" v-else>Fuck.</h1>
        <p class="subtitle" v-if="error.statusCode === 404">We couldn't find this page. Maybe it's our fault, maybe it's yours, but you should <nuxt-link to="/home">go home</nuxt-link></p>
        <p v-else>We're not sure what quite happened here. It's our fault and we've logged it, you should <nuxt-link to="/home">go home</nuxt-link> now</p>
    </div>
</template>
<script>
    export default {
        props: [
            'error'
        ]
    }
</script>