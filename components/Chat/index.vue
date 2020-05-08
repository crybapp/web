<template>
    <div class="chat">
        <div ref="messagesView" class="grouped-chat-messages-wrapper">
            <p v-if="!messages || messages.length === 0" class="chat-no-messages">
                Nobody said nothing.
                <br>
                Maybe say something?
            </p>
            <GroupedChatMessage v-for="(group, i) in messages" v-else :key=group.id :group=group :is-last-group="i === messages.length - 1" />
        </div>
        <ChatTypingBar />
        <ChatInput />
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import PerfectScrollbar from 'perfect-scrollbar'

    import ChatInput from '~/components/Chat/InputBar'
    import ChatTypingBar from '~/components/Chat/TypingBar'
    import GroupedChatMessage from '~/components/Chat/GroupedChatMessage'

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
            this.unsubscribe = this.$store.subscribe(({ type }, state) => {
                if (type === 'pushMessage' || type === 'pushSendingMessage' || type === 'pullMessage')
                    this.$nextTick(this.updateMessageView)
            })

            this.ps = new PerfectScrollbar(this.$refs.messagesView)
            window.addEventListener('resize', this.ps.update)
            this.updateMessageView()
        },
        beforeDestroy() {
            this.unsubscribe()
            window.removeEventListener('resize', this.ps.update)
            this.ps.destroy()
            this.ps = null
        },
        methods: {
            updateMessageView() {
                const { messagesView } = this.$refs
                if (!messagesView)
                    return

                messagesView.scrollTop = messagesView.scrollHeight

                this.ps.update()
            }
        }
    }
</script>
