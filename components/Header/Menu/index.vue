<template>
    <div class="header-menu-wrapper">
        <div
            class="menu-cover"
            :class="{ visible }"
            @click="toggleMenu()"
        />
        <div class="header-menu" :class="{ visible, 'is-dark': dark, 'user-menu': type === 'user', 'room-menu': type === 'room' }">
            <slot />
        </div>
    </div>
</template>
<script>
export default {
    props: [
        'type',
        'dark'
    ],
    data() {
        return {
            visible: false
        }
    },
    methods: {
        toggleMenu(hide=false) {
            this.visible = !this.visible

            if(this.type && (hide && this.visible))
                this.$router.push(this.visible ? `#${this.type}-menu` : '')
        }
    }
}
</script>
