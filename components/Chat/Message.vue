<template>
    <div class="chat-message" :class="{ 'is-sending': loading || isMessageSending }">
        <p class="chat-message-content" v-html=getEmojifiedMessageContent />
        <div v-if="!isMessageSending" class="chat-message-options">
            <img v-if=!isAuthorSelf class="chat-message-option chat-message-report" src="~/assets/icons/message-exclaimation.svg" title="Report message" @click=report()>
            <img v-if="isAuthorSelf || isSelfRoomOwner" class="chat-message-option chat-message-delete" src="~/assets/icons/trash-full.svg" title="Delete message" @click=destroy()>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import stripHtml from 'string-strip-html'
    import twemoji from 'twemoji'

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
                if (!this.room) return

                return this.userId === (typeof this.room.owner === 'string' ? this.room.owner : this.room.owner.id)
            },
            isMessageSending() {
                return typeof this.message === 'string'
            },
            getEmojifiedMessageContent() {
                const content = (typeof this.message === 'string' ? this.message : this.message.content)
                const safeContent = stripHtml(content)

                return twemoji.parse(safeContent, {
                    callback: (icon, options, variant) => {
                        switch (icon) {
                            case 'a9':      // © copyright
                            case 'ae':      // ® registered trademark
                            case '2122':    // ™ trademark
                                return false
                        }
                        return ''.concat(options.base, options.size, '/', icon, options.ext)
                    },
                    className: 'chat-message-emoji'
                })
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
