<template>
    <div class="chat">
        <p class="chat-no-messages-warn" v-if="!messages || messages.length === 0">Nobody said nothing. Maybe say something?</p>
        <div class="chat-messages" :class="{ 'users-are-typing': typingUsers.length > 0 }" ref="messagesView" v-else-if=messages>
            <GroupedChatMessage v-for="(group, i) in messages" :key=group.id :group=group :isLastGroup="i === messages.length - 1" />
        </div>
        <ChatTypingBar />
        <ChatInput />
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import ChatInput from './input'
    import ChatTypingBar from './typing'
    import GroupedChatMessage from './grouped-message'

    export default {
        computed: {
            ...mapGetters(['messages', 'typingUsers'])
        },
        methods: {
            updateMessageView() {
                const { messagesView } = this.$refs
                if(!messagesView) return

                messagesView.scrollTop = messagesView.scrollHeight
            }
        },
        mounted() {
            this.$nextTick(this.updateMessageView)

            this.$store.subscribe(({ type }, state) => {
                if(type === 'pushMessage' || type === 'pushSendingMessage')
                    this.$nextTick(this.updateMessageView)
            })
        },
        components: {
            ChatInput,
            ChatTypingBar,
            GroupedChatMessage
        }
    }
</script>
<style src="~/static/css/room/chat.css">
/* Manage scoping properly */
</style>