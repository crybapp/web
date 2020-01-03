<template>
    <div class="menu-wrapper" :class="{ visible }">
        <div
            class="menu-cover"
            @click="toggleMenu()"
        />
        <div class="menu">
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
    }
}
</script>
