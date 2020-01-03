<template>
    <a class="input-wrapper" :href="href">
        <div class="input" :class="{ 'discord': type === 'discord', disabled }">
            <img
                v-if="icon"
                :src="icon"
                class="input-icon"
            >
            <img
                v-if="icon && hover"
                :src="hover"
                class="input-icon-hover"
            >
            <input
                ref="input"
                class="input-inner"
                type="text"
                :value="value"
                :placeholder="placeholder"
                @input="didUpdateInput()"
                @keydown.enter="didPressEnter"
            >
        </div>
    </a>
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
