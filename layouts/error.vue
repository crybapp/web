<template>
    <div class="error">
        <h1 v-if=error.statusCode class="title">
            {{ error.statusCode }}
        </h1>
        <h1 v-else class="title">
            Fuck.
        </h1>
        <p v-if="error.statusCode === 404" class="subtitle">
            We couldn't find this page. Maybe it's our fault, maybe it's yours, but you should <nuxt-link to="/home">go home</nuxt-link> in any case.
        </p>
        <p v-else>
            We're not sure what quite happened here. It's our fault, so for now you should <nuxt-link to="/home">go home</nuxt-link> now.
        </p>
    </div>
</template>
<script>
    export default {
        props: [
            'error'
        ]
    }
</script>
