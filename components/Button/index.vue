<template>
    <a class="button-wrapper" :href="href">
        <div class="button" :class="{ 'discord': type === 'discord', disabled, loading }">
            <img
                v-if="icon"
                :src="icon"
                class="button-icon"
            >
            <img
                v-if="icon && hover"
                :src="hover"
                class="button-icon-hover"
            >
            <p class="button-content"><slot /></p>
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

            'loading',
            'disabled'
        ]
    }
</script>
<style src="~/static/css/components/button.css" scoped></style>
