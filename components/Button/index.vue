<template>
    <a class="button-wrapper" :href="href">
        <div class="button" :class="{ 'discord': type === 'discord', disabled, loading }">
            <img class="button-icon" v-if=icon :src=icon />
            <img class="button-icon-hover" :src=hover v-if="icon && hover" />
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
