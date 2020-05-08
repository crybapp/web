<template>
    <div class="error">
        <h1 v-if="errResponse.title || error.statusCode" class="title">
            {{ errResponse.title || error.statusCode }}
        </h1>
        <h1 v-else class="title">
            Fuck.
        </h1>

        <p v-if="error.statusCode === 404" class="subtitle">
            We couldn't find this page. Maybe it's our fault, maybe it's yours.
        </p>
        <p v-else-if="errResponse.description" class="subtitle">
            {{ errResponse.description }}
        </p>
        <p v-else-if="error.message && !isProduction" class="subtitle">
            {{ error.message }}
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
        layout: 'default',
        props: {
            'error': Object
        },
        computed: {
            errResponse() {
                if (this.error.response && this.error.response.data)
                    return this.error.response.data.error || {}
                return {}
            },
            isProduction() {
                return process.env.NODE_ENV === 'production'
            }
        },
        head() {
            return {
                title: this.errResponse.title || this.error.statusCode || 'Error'
            }
        }
    }
</script>
