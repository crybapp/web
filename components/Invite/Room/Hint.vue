<template>
    <div class="invite-hint">
        <h3 class="title">
            Rooms are better with friends
        </h3>
        <p class="subtitle">
            Copy and share this link with your friends
        </p>
        <a
            class="invite-link"
            href="#"
            @click="copyInviteLink()"
        >
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
                // eslint-disable-next-line no-undef
                return `${process.env.BASE_WEB_URL}/i/${this.room.invites[0].code}`
            }
        },
        methods: {
            async copyInviteLink() {
                if(this.hintTimeout)
                    clearTimeout(this.hintTimeout)

                try {
                    await this.$copyText(this.inviteLink)

                    this.hint = ' - copied!'
                    this.hintTimeout = setTimeout(() => this.hint = '', 1500)
                } catch(error) {
                    alert(error)
                }
            }
        }
    }
</script>
<style src="~/static/css/room/invite-hint.css" scoped></style>
