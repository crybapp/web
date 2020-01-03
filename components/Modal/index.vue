<template>
    <div class="modal-wrapper" :class="{ visible, cover }">
        <div class="modal-cover" @click="hideModal()" />
        <div class="modal">
            <slot />
        </div>
    </div>
</template>
<script>
    export default {
        props: [
            'cover'
        ],
        data() {
            return {
                visible: false
            }
        },
        methods: {
            hideModal() {
                this.visible = false
                this.$router.push('')
            }
        }
    }
</script>
