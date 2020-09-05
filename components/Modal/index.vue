<template>
    <div class="modal-wrapper" :class="{ visible, cover, canHide }">
        <div class="modal-cover" @click=hideModal() />
        <div v-if="visible" class="modal">
            <slot />
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            'cover': {
                type: Boolean,
                default: true
            },
            'visible': {
                type: Boolean,
                default: false
            },
            'canHide': {
                type: Boolean,
                default: true
            }
        },
        methods: {
            hideModal() {
                if (this.canHide)
                    this.visible = false
            }
        }
    }
</script>
