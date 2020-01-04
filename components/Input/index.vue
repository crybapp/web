<template>
    <input
        ref="input"
        class="input"
        type="text"
        :value=value
        :placeholder=placeholder
        @input=didUpdateInput()
        @keydown.enter=didPressEnter
    >
</template>
<script>
    export default {
        props: [
            'type',
            'href',
            'icon',
            'hover',

            'value',
            'disabled',
            'placeholder'
        ],
        methods: {
            didUpdateInput() {
                this.$emit('input', this.$refs.input.value)
            },
            didPressEnter(event) {
                this.$refs.input.blur()
                this.$emit('keydown', event)
            }
        }
    }
</script>
