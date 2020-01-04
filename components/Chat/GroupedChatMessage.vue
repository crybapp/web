<template>
    <div
        v-if="author"
        class="grouped-chat-messages"
        @mouseover="hover = true"
        @mouseleave="hover = false"
    >
        <img
            v-if="userIcon"
            :src="userIcon"
            class="chat-messages-author-avatar"
            :class="{ 'has-controller': hasController }"
        >
        <div class="chat-messages">
            <div class="grouped-chat-messages-meta">
                <p class="chat-messages-author-name">
                    {{ author.name }}
                </p>
            </div>
            <Message
                v-for="message in messages"
                :key="message.id"
                :message="message"
            />
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import Message from '~/components/Chat/Message'

    export default {
        components: {
            Message
        },
        props: [
            'group',
            'isLastGroup'
        ],
        data() {
            return {
                hover: false
            }
        },
        computed: {
            ...mapGetters(['users', 'timestamps', 'userId', 'controllerId', 'sendingMessages']),

            author() {
                return this.users[this.group.author]
            },
            messages() {
                if (!this.isAuthorSelf || !this.isLastGroup) return this.group.messages

                return [...this.group.messages, ...this.sendingMessages]
            },

            userIcon() {
                if (!this.author) return null

                if (this.hover) return this.author.icon

                return this.author.icon.replace('.gif', '.png')
            },

            isAuthorSelf() {
                if (!this.author) return

                return this.group.author === this.userId
            },
            hasController() {
                if (!this.author) return false

                return this.author.id === this.controllerId
            }
        }
    }
</script>
