<template>
    <a class="is-wrapper" :href=href>
        <button class="button" :class="{ 'has-theme': theme, 'is-discord-theme': theme === 'discord', 'has-icon': icon, 'is-loading': loading, 'is-disabled': disabled }">
            <img v-if=icon class="icon" :src=icon />
            <img v-if="icon && hoverIcon" class="icon is-hover" :src=hoverIcon />
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
			
			'theme',

            'loading',
            'disabled'
        ]
    }
</script>
