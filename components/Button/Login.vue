<template>
    <div v-if="user" class="continue">
        <Button to="/home" icon="user-white" hover="user">
            Continue to {{ brand.name }}
        </Button>
    </div>
    <div v-else-if="!token" class="login">
        <Button v-if="redirectUrl" theme="discord" :href="redirectUrl"
                icon="discord-white" hover="discord-colour" alt="Discord Logo">
            Login with Discord
        </Button>
        <p v-else-if="errResponse.description" class="disclaimer">
            {{ errResponse.description }}
        </p>
        <p v-else-if="error" class="disclaimer">
            Uh-oh! Looks like we can't find a redirect URL for Login with Discord.
        </p>
        <p v-else class="disclaimer">
            Please wait...
        </p>
    </div>
    <div v-else>
        <p class="disclaimer">
            An error has occurred while trying to authenticate with this instance's API
        </p>

        <p v-if="errResponse.description" class="disclaimer">
            {{ errResponse.description }}
        </p>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Button from '~/components/Button'

    export default {
        components: {
            Button
        },
        props: {
            'invite': String
        },
        data() {
            return {
                redirectUrl: null,
                error: null
            }
        },
        computed: {
            ...mapGetters(['token', 'user']),

            errResponse() {
                if (this.error && this.error.response && this.error.response.data)
                    return this.error.response.data.error || {}
                return {}
            }
        },
        async mounted() {
            if (this.user || this.token)
                return

            // ToDo: definitely not hardcode to Discord
            try {
                this.redirectUrl = await this.$axios.$get(`/auth/discord/redirect${this.invite ? `?invite=${this.invite}` : ''}`)
            } catch (error) {
                this.error = error
            }
        }
    }
</script>
