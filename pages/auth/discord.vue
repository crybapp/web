<template>
    <p v-html="message"></p>
</template>
<script>
export default {
    head() {
        return {
            title: 'Logging In'
        }
    },
    middleware: 'logged-out',
    data() {
        return {
            message: this.$t('discord.authenticating')
        }
    },
    async mounted() {
        const { code, state } = this.$route.query

        try {
            const token = await this.$axios.$post(`/auth/discord`, { code })

            this.message = this.$t('discord.authenticated')
            
            this.$store.commit('handleToken', { token, save: true })
            this.$store.dispatch('fetchUser')
            this.$router.push(state ? `/i/${state.split('=')[1]}` : '/home')
        } catch(error) {
            this.message = this.$t('discord.authenticationError')
        }
    }
}
</script>
