<template>
    <div class="chat">
        <p v-if="!messages || messages.length === 0" class="chat-no-messages-warn">
            Nobody said nothing. Maybe say something?
        </p>
        <div
            v-else-if="messages"
            ref="messagesView"
            class="chat-messages"
            :class="{ 'users-are-typing': typingUsers.length > 0 }"
        >
            <GroupedChatMessage
                v-for="(group, i) in messages"
                :key="group.id"
                :group="group"
                :isLastGroup="i === messages.length - 1"
            />
        </div>
        <ChatTypingBar />
        <ChatInput />
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import ChatInput from '~/components/Chat/InputBar'
    import ChatTypingBar from '~/components/Chat/TypingBar'
    import GroupedChatMessage from '~/components/Chat/GroupedMessage'

    export default {
        components: {
            ChatInput,
            ChatTypingBar,
            GroupedChatMessage
        },
        computed: {
            ...mapGetters(['messages', 'typingUsers'])
        },
        mounted() {
            this.$nextTick(this.updateMessageView)

            this.$store.subscribe(({ type }, state) => {
                if(type === 'pushMessage' || type === 'pushSendingMessage')
                    this.$nextTick(this.updateMessageView)
            })
        },
        methods: {
            updateMessageView() {
                const { messagesView } = this.$refs
                if(!messagesView) return

                messagesView.scrollTop = messagesView.scrollHeight
            }
        }
    }
</script>
