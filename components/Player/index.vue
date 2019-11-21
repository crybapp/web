<template>
    <!-- The room object is present and the room type is not set -->
    <div v-if="room && !room.type" class="player-wrapper" :class="{ 'is-picking-type': !room.type }">
        <div class="type-picker">
            <h1 class="title">What's on the agenda today?</h1>
            <p class="subtitle">Share a virtual browser or watch YouTube in sync - the choice is yours</p>
            <div class="options has-link horizontal" v-if=!room.type>
                <a :href="`#${type}`" @click=updateRoomType(type) v-for="(type, i) in room.types" :key=i>
                    <div class="box option" :class="{ 'loading': changingRoomType === type, 'disabled': room.allowedTypes.indexOf(type) === -1 || changingRoomType || !isRoomOwner }">
                        <div class="option-inner">
                            <img :src="`/icons/${icons[type]}`" class="icon" v-if=icons[type]>
                            <h3 class="header">
                                {{ titles[type] }}
                            </h3>
                            <p class="description">
                                {{ descriptions[type] }}
                            </p>
                        </div>
                    </div>
                </a>
            </div>
            <p class="disclaimer" v-if=!isRoomOwner>{{ roomOwner ? roomOwner.name : 'The owner of this room' }} is currently picking a Room type - hold tight!</p>
        </div>
    </div>
    <!-- The room object is present and the room type is vm -->
    <div class="player-wrapper" v-else-if="room && room.type === 'vm'">
        <VMPlayer />
    </div>
    <!-- The room object is present and the room type is media -->
    <div class="player-wrapper" v-else-if="room && room.type === 'media'">
        <MediaPlayer />
    </div>
    <!-- The room object is present but the room type is not known -->
    <div class="player-wrapper" v-else-if=room>

    </div>
    <!-- The room object is not present -->
    <div class="player-wrapper" v-else>

    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import VMPlayer from '~/components/Player/VM'
    import MediaPlayer from '~/components/Player/Media'

    export default {
        computed: {
            ...mapGetters(['room', 'user']),

            roomOwner() {
                return typeof this.room.owner === 'string' ? null : this.room.owner
            },
            isRoomOwner() {
                return typeof this.room.owner === 'string' ? this.room.owner : this.room.owner.id === this.user.id 
            }
        },
        data() {
            return {
                changingRoomType: false,
                changingRoomTypeTo: null,

                titles: {
                    vm: 'Virtual Browser',
                    media: 'Synced Media'
                },
                descriptions: {
                    vm: 'Share a virtual browser to watch anything with friends',
                    media: 'Watch YouTube, SoundCloud and more in sync with friends'
                },
                icons: {
                    vm: 'computer-chip.svg',
                    media: 'panel-play.svg'
                }
            }
        },
        methods: {
            async updateRoomType(type) {
                if(!this.isRoomOwner) return
                if(this.changingRoomType) return
                if(this.room.allowedTypes.indexOf(type) === -1) return

                this.changingRoomType = true
                this.changingRoomTypeTo = type

                try {
                    await this.$axios.$patch('/room/type', { type })

                    this.$store.commit('handleRoomType', type)
                } catch(error) {
                    alert(error)
                }

                this.changingRoomType = false
                this.changingRoomTypeTo = null
            }
        },
        components: {
            VMPlayer,
            MediaPlayer
        }
    }
</script>
<style src="~/static/css/room/player.css">
/* Manage scoping properly */
</style>
<style src="~/static/css/home.css" scoped></style>
