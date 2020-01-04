<template>
    <div class="chat-bar-wrapper">
        <input
            ref="input"
            v-model="content"
            type="text"
            class="chat-bar"
            :class="{ 'disabled': sending }"
            placeholder="Say something cool..."
            @keyup="didPressKey"
            @keyup.enter="sendMessage()"
        >
        <div
            class="send-button"
            :class="{ 'is-loading': sending, disabled: sending || !canSendMessage }"
            title="Send Message"
            @click="sendMessage()"
        >
            <img src="/icons/airplane.svg" class="send-button-icon">
        </div>
    </div>
</template>
<script>
    import sanitizeHtml from 'sanitize-html'

    export default {
        data() {
            return {
                content: '',
                sending: false,
                typingTimer: null
            }
        },
        computed: {
            canSendMessage() {
                return this.content.length > 0
            }
        },
        mounted() {
            this.$refs.input.focus()
        },
        methods: {
            async sendMessage() {
                if(this.sending) return
                if(this.content.length === 0) return
                if(this.content.length > 255) return alert('This message is longer than 255 characters, please shorten it before trying again.')

                const content = sanitizeHtml(this.content, { allowedTags: [], allowedAttributes: {} })

                if (content.length === 0) return

                this.content = ''
                this.didEndTyping()
                this.$refs.input.focus()

                this.$store.commit('pushSendingMessage', { content })

                if(content.trim().toLowerCase() === 'something cool')
                    alert('You are not very funny. At all.')

                try {
                    const message = await this.$axios.$post('room/message', { content })

                    this.$store.commit('pushMessage', message)
                } catch(error) {
                    alert(error)
                }
            },
            didPressKey(e) {
                if(e.keyCode === 8) return
                if(this.content.length === 0) return

                if(this.typingTimer)
                    clearInterval(this.typingTimer)
                else
                    this.$store.commit('setTypingStatus', true)

                this.typingTimer = setInterval(() => this.didEndTyping(), 2500)
            },
            didEndTyping(broadcast) {
                this.$store.commit('setTypingStatus', false)

                if(this.typingTimer) {
                    clearInterval(this.typingTimer)
                    this.typingTimer = null
                }
            }
        }
    }
</script>
