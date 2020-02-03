<template>
    <div v-if=inviteLink class="invite-hint">
        <h3 class="invite-hint-title">
            Rooms are better with friends
        </h3>
        <p class="invite-hint-subtitle">
            Copy and share this link with your friends
        </p>
        <a class="invite-link" :href=inviteLink onclick="return false" @click=copyInviteLink()>
            {{ inviteLink }}
        </a>
        <span class="hint" :class="{ visible: hint }">
            {{ hint }}
        </span>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    export default {
        data() {
            return {
                hint: '',
                hintTimeout: null
            }
        },
        computed: {
            ...mapGetters(['room']),

            inviteLink() {
                if (!this.room) return

                return `${process.env.BASE_WEB_URL}/i/${this.room.invites[0].code}`
            }
        },
        methods: {
            async copyInviteLink() {
                if (this.hintTimeout)
                    clearTimeout(this.hintTimeout)

                try {
                    await this.$copyText(this.inviteLink)

                    this.hint = ' - copied!'
                    this.hintTimeout = setTimeout(() => this.hint = '', 1250)
                } catch(error) {
                    alert(error)
                }
            }
        }
    }
</script>
