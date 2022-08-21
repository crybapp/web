<template>
    <div class="chat-bar-wrapper">
        <input ref="input" v-model="content" type="text" class="chat-bar" placeholder="Say something cool..." @keyup="didPressKey" @keyup.enter="sendMessage()" />
        <div class="send-button" :class="{ 'is-loading': pendingMessages, disabled: !canSendMessage || notFunnyContent }" title="Send Message" @click="sendMessage()">
            <img src="~/assets/icons/airplane.svg" class="send-button-icon">
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import emoji from 'node-emoji'
    import { stripHtml } from 'string-strip-html'

    export default {
        data() {
            return {
                content: '',
                typingTimer: null
            }
        },
        computed: {
            ...mapGetters(['sendingMessages']),
            canSendMessage() {
                return this.content.trim().length > 0
            },
            pendingMessages() {
                return this.sendingMessages.length > 0
            },
            notFunnyContent() {
                return this.content.trim() === 'You are not very funny. At all.'
            }
        },
        mounted() {
            this.$refs.input.focus()
        },
        methods: {
            async sendMessage() {
                if (this.content.length === 0 || this.notFunnyContent)
                    return
                if (this.sendingMessages.length > 5)
                    return alert('You already are sending too much messages!')

                const message = this.content

                this.content = ''
                this.didEndTyping()
                this.$refs.input.focus()

                const content = stripHtml(message.trim(), { dumpLinkHrefsNearby: { enabled: true } }).result

                if (content.length === 0)
                    return
                if (content.length > 255)
                    return alert('This message is longer than 255 characters, please shorten it before trying again.')

                if (content.toLowerCase() === 'something cool')
                    this.content = 'You are not very funny. At all.'

                const parsedContent = emoji.emojify(content)

                this.$store.commit('pushSendingMessage', { content: parsedContent })

                try {
                    const message = await this.$axios.$post('room/message', { content: parsedContent })

                    this.$store.commit('pushMessage', message)
                } catch(error) {
                    alert(error)
                }
            },
            didPressKey(e) {
                if (e.keyCode === 8 || this.content.length === 0)
                    return

                if (this.typingTimer)
                    clearInterval(this.typingTimer)
                else
                    this.$store.commit('setTypingStatus', true)

                this.typingTimer = setInterval(() => this.didEndTyping(), 2500)
            },
            didEndTyping(broadcast) {
                this.$store.commit('setTypingStatus', false)

                if (this.typingTimer) {
                    clearInterval(this.typingTimer)
                    this.typingTimer = null
                }
            }
        }
    }
</script>
