<template>
    <p class="chat-typing-bar" v-if=areUsersTyping>{{ typingTooltip }}</p>
</template>
<script>
    import { mapGetters } from 'vuex'

    export default {
        computed: {
            ...mapGetters(['typingUsers']),

            typingTooltip() {
                return this.$t('room.chat.typing', {users: this.typingUsersList, isAre: this.typingUsers.length === 1 ? this.$t('general.is') : this.$t('general.are')})
            },
            areUsersTyping() {
                return this.typingUsers.length > 0
            },
            typingUsersList() {
                return this.typingUsers.map(user => user.name).join(', ') 
            }
        }
    }
</script>
