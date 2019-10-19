<template>
    <div class="user-icon" :class="{ 'passable': canPassControl, 'offline': !isUserOnline, 'has-control': hasControl }" v-if=member @click=didClickUserIcon() :title=hoverTitle>
        <img :src=member.icon  :alt=member.name class="user-icon-avatar">
        <div class="user-name-wrapper">
            <p class="user-name">{{ member.name }}</p>
        </div>
        <div class="user-control-indicator" :class="{ 'visible': hasControl, 'non-interactable': !interactable }" @click=didClickControlIcon()>
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

            hoverTitle() {
                if(!this.interactable) return `${this.isUserSelf ? 'You have' : `${this.member.name} has`} the controller`
                if(this.isUserSelf && this.hasControl) return 'Release the controller'

                if(this.isUserSelf)
                    if(this.hasControl)
                        return 'Release the controller'
                    else
                        return 'Take the controller'

                return `Steal the controller from ${this.member.name}`
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
            },
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
