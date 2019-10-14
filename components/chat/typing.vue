<template>
    <p class="chat-typing-bar" v-if=areUsersTyping>{{ typingTooltip }}</p>
</template>
<script>
    import { mapGetters } from 'vuex'

    export default {
        computed: {
            ...mapGetters(['typingUsers']),

            typingTooltip() {
                return `${this.typingUsersList} ${this.typingUsers.length === 1 ? 'is' : ' are'} typing...`
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