<template>
    <div class="modal-wrapper" :class="{ visible, cover }">
        <div class="modal-cover" @click=hideModal()></div>
        <div class="modal">
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
            hideModal() {
                this.visible = false
                this.$router.push('')
            }
        },
        props: [
            'cover'
        ]
    }
</script>
<style src="~/static/css/components/modal.css" scoped></style>