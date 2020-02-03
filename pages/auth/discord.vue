<template>
    <p>
        {{ message }}
    </p>
</template>
<script>
export default {
    middleware: 'logged-out',
    data() {
        return {
            message: 'Authenticating...'
        }
    },
    async mounted() {
        const { code, state } = this.$route.query

        try {
            const token = await this.$axios.$post(`/auth/discord`, { code })

            this.message = 'Authenticated! Redirecting...'

            this.$store.commit('handleToken', { token, save: true })
            this.$store.dispatch('fetchUser')
            setTimeout(() => this.$router.push(state ? `/i/${state.split('=')[1]}` : '/home'), 250)
        } catch(error) {
            this.message = 'An error occurred while authenticating. Please go home and try logging in again.'
        }
    },
    head() {
        return {
            title: 'Logging in'
        }
    }
}
</script>
