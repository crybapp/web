<template>
    <div class="user-icon" :class="{ 'passable': canPassControl, 'offline': !isUserOnline, 'has-control': hasControl }" v-if=member @click=didClickUserIcon() @mouseover="hover = true" @mouseleave="hover = false">
        <img :src=userIcon v-if=userIcon class="user-icon-avatar" :title=userHoverTitle />
        <div class="user-name-wrapper">
            <p class="user-name">{{ member.name }}</p>
        </div>
        <div class="user-control-indicator" :class="{ 'visible': hasControl, 'non-interactable': !interactable }" @click=didClickControlIcon() :title=indicatorHoverTitle>
            <img src="/icons/cursor-a.svg" class="user-control-icon has-control">
            <img src="/icons/multiply.svg" class="user-control-icon remove-control" v-if=interactable>
        </div>
    </div>
</template>
<script>
	import { mapGetters } from 'vuex'

    export default {
        computed: {
            ...mapGetters(['room', 'userId', 'controllerId', 'onlineUserIds']),

            userIcon() {
                if(!this.member) return null

                if(this.hover) return this.member.icon
                
                return this.member.icon.replace(".gif", ".png")
            },

            userHoverTitle() {
                if(this.controllerId === null && this.isUserSelf) return 'Take the controller'
                if(!this.isUserSelf && this.canPassControl) return `Pass ${this.member.name} the controller`

                return `${this.member.name}${this.isUserSelf ? ' (you)' : ''}`
            },
            indicatorHoverTitle() {
                if(this.hasControl && this.interactable)
                    return `Release the controller${this.isUserSelf ? '' : ` from ${this.member.name}`}`

                if(this.canPassControl) return `Give the controller to ${this.member.name}`
                if(this.hasControl) return `${this.member.name} has the controller`

                return `${this.member.name}${this.isUserSelf ? ' (you)' : ''}`
            },

            interactable() {
                return this.isUserSelf || this.isSelfOwnerOfRoom
            },

            canPassControl() {
                if(!this.isUserOnline) return false

                return ((this.isSelfOwnerOfRoom || this.isSelfControllerOfRoom) && !this.hasControl) || (this.controllerId === null && this.isUserSelf)
            },

            hasControl() {
                if(!this.controllerId) return false

                return this.member.id === this.controllerId
            },

            isUserSelf() {
                if(!this.userId) return false
                if(!this.member) return false

                return this.userId === this.member.id
            },
            isUserOnline() {
                return this.onlineUserIds.indexOf(this.member.id) > -1 || this.isUserSelf
            },
            isSelfOwnerOfRoom() {
                if(!this.room) return false
                if(!this.userId) return false

                return this.userId === (typeof this.room.owner === 'string' ? this.room.owner : this.room.owner.id)
            },
            isSelfControllerOfRoom() {
                if(!this.userId) return false
                if(!this.controllerId) return false

                return this.userId === this.controllerId
            }
        },
        data() {
            return {
                hover: false,
            }
        },
        methods: {
            didClickUserIcon() {
                if(this.controllerId === null && this.isUserSelf)
                    this.$store.dispatch('takeControl')
                else if(this.canPassControl)
                    this.$store.dispatch('giveControl', this.member.id)
            },
            didClickControlIcon() {
                if(this.hasControl && this.interactable)
                    this.$store.dispatch('releaseControl')
            }
        },
        props: [
            'member'
        ]
    }
</script>
<style src="~/static/css/room/user-icon.css" scoped></style>
