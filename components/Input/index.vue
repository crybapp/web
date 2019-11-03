<template>
    <a class="input-wrapper" :href=href>
        <div class="input" :class="{ 'discord': type === 'discord', disabled }">
            <img :src=icon v-if=icon class="input-icon">
            <img :src=hover v-if="icon && hover" class="input-icon-hover">
            <input class="input-inner" type="text" ref="input" :value=value :placeholder=placeholder @input=didUpdateInput() @keydown.enter=didPressEnter />
        </div>
    </a>
</template>
<script>
    export default {
        methods: {
            didUpdateInput() {
                this.$emit('input', this.$refs.input.value)
            },
            didPressEnter(event) {
                this.$refs.input.blur()
                this.$emit('keydown', event)
            }
        },
        props: [
            'type',
            'href',
            'icon',
            'hover',

            'value',
            'disabled',
            'placeholder'
        ]
    }
</script>
<style src="~/static/css/components/input.css" scoped></style>
