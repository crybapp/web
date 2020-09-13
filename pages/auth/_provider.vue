<template>
    <div class="content no-header is-center">
        <div class="home">
            <div class="auth-images center">
                <div v-if="!user && loading || !error" class="is-loading logo-big logo-mask" />
                <img v-if="user" :src="user.icon" class="profile-image" :alt="user.name" />
            </div>
            <p v-if="error" class="error center">
                {{ error }}
            </p>
            <p>
                {{ message }}
            </p>
            <p v-if="error" class="disclaimer">
                You might want to <nuxt-link to="/">try logging again</nuxt-link>.
            </p>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    export default {
        middleware: 'logged-out',
        layout: 'logged-out',
        data() {
            return {
                loading: true,
                message: 'Authenticating...',
                error: null,
                hidden: false
            }
        },
        computed: {
            ...mapGetters(['user'])
        },
        async mounted() {
            // ToDo: Recode this whole page.
            const { code } = this.$route.query
            const { provider } = this.$route.params

            this.unsubscribe = this.$store.subscribe(({ type }, { stream }) => {
                if (type === 'handleSelfUser')
                    this.welcomeUser()
            })

            try {
                const token = await this.$axios.$post(`/auth/${provider}`, { code })

                this.message = 'Authenticated! Fetching user...'

                this.$store.commit('handleToken', { token, save: true })
                this.$store.dispatch('fetchUser')
            } catch(error) {
                if (error.response && error.response.data)
                    if (error.response.data.error)
                        this.error = error.response.data.error.description
                    else
                        this.error = error.response.data

                this.message = 'An error occurred while authenticating. Please go home and try logging in again.'
            }

            this.loading = false
        },
        beforeDestroy() {
            this.unsubscribe()
        },
        methods: {
            welcomeUser() {
                const { state } = this.$route.query

                this.message = `Logged in! Welcome, ${this.user.name}`
                setTimeout(() => this.$router.push(state ? `/i/${state.split('=')[1]}` : '/home'), 2000)
            }
        },
        head() {
            return {
                title: 'Logging in'
            }
        }
    }
</script>
