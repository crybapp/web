<template>
    <div class="grouped-chat-wrapper" v-if=author @mouseover="hover = true" @mouseleave="hover = false">
        <img :src=userIcon v-if=userIcon class="chat-author-avatar" :class="{ 'has-controller': hasController }">
        <div class="grouped-chat-messages-content">
            <div class="grouped-chat-messages-meta">
                <p class="chat-author-name">{{ author.name }}</p>
            </div>
            <div class="grouped-chat-messages">
                <Message v-for="message in messages" :key=message.id :message=message />
            </div>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import { formatDistance } from 'date-fns'

    import Message from './message'

    export default {
        computed: {
            ...mapGetters(['users', 'timestamps', 'userId', 'controllerId', 'sendingMessages']),

            author() {
                return this.users[this.group.author]
            },
            messages() {
                if(!this.isAuthorSelf || !this.isLastGroup) return this.group.messages

                return [...this.group.messages, ...this.sendingMessages]
            },

            userIcon() {
                if(!this.author) return null

                if(this.hover) return this.author.icon
                
                return this.author.icon.replace(".gif", ".png")
            },

            isAuthorSelf() {
                if(!this.author) return

                return this.group.author === this.userId
            },
            hasController() {
                if(!this.author) return false

                return this.author.id === this.controllerId
            }
        },
        data() {
            return {
                hover: false
            }
        },
        components: {
            Message
        },
        props: [
            'group',
            'isLastGroup'
        ]
    }
</script>