<template>
    <div
        class="chat-message"
        :class="{ 'is-loading': loading || isMessageSending }"
    >
        <p class="chat-message-content" v-html="getEmojifiedMessageContent" />
        <div v-if="!isMessageSending" class="chat-message-options">
            <img
                v-if="!isAuthorSelf"
                class="chat-message-option chat-message-report"
                src="/icons/message-exclaimation.svg"
                title="Report message"
                @click="report()"
            >
            <img
                v-if="isAuthorSelf || isSelfRoomOwner"
                class="chat-message-option chat-message-delete"
                src="/icons/trash-full.svg"
                title="Delete message"
                @click="destroy()"
            >
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import emoji from 'node-emoji'
    import twemoji from 'twemoji'
    import sanitizeHtml from 'sanitize-html'

    export default {
        props: [
            'message'
        ],
        data() {
            return {
                loading: false
            }
        },
        computed: {
            ...mapGetters(['userId', 'room']),

            isAuthorSelf() {
                return this.$parent.isAuthorSelf
            },
            isSelfRoomOwner() {
                if(!this.room) return

                return this.userId === (typeof this.room.owner === 'string' ? this.room.owner : this.room.owner.id)
            },
            isMessageSending() {
                return typeof this.message === 'string'
            },
            getEmojifiedMessageContent() {
                var content;
                if (typeof this.message === 'string')
                    content = this.message
                else
                    content = this.message.content

                content = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} })

                return twemoji.parse(emoji.emojify(content))
            }
        },
        methods: {
            async destroy() {
                this.loading = true

                try {
                    await this.$axios.$delete(`room/message/${this.message.id}`)

                    this.$store.commit('pullMessage', this.message.id)
                } catch(error) {
                    alert(error)
                    this.loading = false
                }
            },
            async report() {
                this.loading = true

                try {
                    await this.$axios.$post(`room/message/${this.message.id}/report`)

                    this.$store.commit('pullMessage', this.message.id)
                } catch(error) {
                    alert(error)
                    this.loading = false
                }
            }
        }
    }
</script>
