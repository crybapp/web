<template>
    <div class="chat-message" :class="{ 'is-loading': loading || isMessageSending }">
        <p class="chat-message-content">{{ !isMessageSending ? message.content : message }}</p>
        <div class="chat-message-options" v-if=!isMessageSending>
            <img class="chat-message-option chat-message-report" src="/icons/message-exclaimation.svg" title="Report message" v-if=!isAuthorSelf @click=report()>
            <img class="chat-message-option chat-message-delete" src="/icons/trash-full.svg" title="Delete message" v-if="isAuthorSelf || isSelfRoomOwner" @click=destroy()>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import { formatDistance } from 'date-fns'

    export default {
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
            }
        },
        data() {
            return {
                loading: false,
                // timestamp: formatDistance(new Date(this.message.createdAt || new Date()), new Date()),
                // dateTimer: null
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
        },
        // mounted() {
        //     this.dateTimer = setInterval(() => this.timestamp = formatDistance(new Date(this.message.createdAt), new Date()), 1000)
        // },
        // beforeDestroy() {
        //     clearInterval(this.dateTimer)
        //     this.dateTimer = null
        // },
        props: [
            'message'
        ]
    }
</script>
