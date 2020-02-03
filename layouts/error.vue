<template>
    <div class="error">
        <h1 v-if=error.statusCode class="title">
            {{ error.statusCode }}
        </h1>
        <h1 v-else class="title">
            Fuck.
        </h1>
        <p v-if="error.statusCode === 404" class="subtitle">
            We couldn't find this page. Maybe it's our fault, maybe it's yours.
        </p>
        <p v-else class="subtitle">
            We're not quite sure what happened here, but it's definitely our fault.
        </p>
        <p class="disclaimer">
            You might want to <nuxt-link to="/home">go home</nuxt-link> now.
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
