<template>
    <div class="chat-bar-wrapper">
        <input type="text" class="chat-bar" :class="{ 'disabled': sending }" :placeholder="$t('room.chat.placeholder')" ref="input" v-model=content @keyup=didPressKey @keyup.enter=sendMessage() />
        <div class="send-button" :class="{ 'is-enabled': canSendMessage, loading: sending, disabled: sending }" @click="sendMessage()" :title="$t('room.chat.sendButtonTooltip')">
            <img src="/icons/airplane.svg" class="send-button-icon">
        </div>
    </div>
</template>
<script>
    export default {
        computed: {
            canSendMessage() {
                return this.content.length > 0
            }
        },
        data() {
            return {
                content: '',
                sending: false,
                typingTimer: null
            }
        },
        methods: {
            async sendMessage() {
                if(this.sending) return
                if(this.content.length === 0) return
                if(this.content.length > 255) return alert('This message is longer than 255 characters, please shorten it before trying again.')
                
                const content = this.content

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
        },
        mounted() {
            this.$refs.input.focus()
        }
    }
</script>
<style src="~/static/css/room/chat-bar.css" scoped></style>
