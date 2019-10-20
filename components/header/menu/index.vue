<template>
    <div class="header-menu-wrapper">
        <div class="menu-cover" :class="{ visible }" @click=toggleMenu()></div>
        <div class="header-menu" :class="{ visible, 'is-dark': dark, 'user-menu': type === 'user', 'room-menu': type === 'room' }">
            <slot />
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            visible: false
        }
    },
    methods: {
        toggleMenu() {
            this.visible = !this.visible

            if(this.type)
                this.$router.push(this.visible ? `#${this.type}-menu` : '')
        }
    },
    props: [
        'type',
        'dark'
    ]
}
</script>
