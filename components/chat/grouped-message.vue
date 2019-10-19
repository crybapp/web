<template>
    <div class="grouped-chat-wrapper" v-if=author>
        <img :src=author.icon class="chat-author-avatar" :class="{ 'has-controller': hasController }">
        <div class="grouped-chat-messages-content">
            <div class="grouped-chat-messages-meta">
                <p class="chat-author-name">{{ author.name }}
                </p>
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

            isAuthorSelf() {
                if(!this.author) return

                return this.group.author === this.userId
            },
            hasController() {
                if(!this.author) return false

                return this.author.id === this.controllerId
            }
        },
        // data() {
            // return {
                // timestamp: formatDistance(new Date(this.group.createdAt || new Date()), new Date(), { addSuffix: true }),
                // dateTimer: null
            // }  
        // },
        // mounted() {
            // this.dateTimer = setInterval(() => this.timestamp = formatDistance(new Date(this.group.createdAt), new Date(), { addSuffix: true }), 1000)
        // },
        // beforeDestroy() {
            // clearInterval(this.dateTimer)
            // this.dateTimer = null
        // },
        components: {
            Message
        },
        props: [
            'group',
            'isLastGroup'
        ]
    }
</script>
