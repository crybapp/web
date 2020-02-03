<template>
    <a class="is-wrapper" :href=href>
        <button class="button" :class="{ 'has-theme': theme, 'is-discord-theme': theme === 'discord', 'has-icon': icon, 'is-loading': loading, 'is-disabled': disabled }">
            <img v-if=icon class="icon" :src=icon :alt=iconAlt />
            <img v-if="icon && hoverIcon" class="icon is-hover" :src=hoverIcon :alt=iconAlt />
            <slot />
        </button>
    </a>
</template>
<script>
    export default {
        props: [
            'href',
            'icon',
            'hoverIcon',
            'iconAlt',

            'theme',

            'loading',
            'disabled'
        ]
    }
</script>
