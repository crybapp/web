<template>
    <a class="is-wrapper" :href=href>
        <button class="button" :class="{ 'has-theme': theme, 'is-discord-theme': theme === 'discord', 'has-icon': icon, 'is-loading': loading, 'is-disabled': disabled }">
            <img v-if=icon class="icon" :src=icon />
            <img v-if="icon && hoverIcon" class="icon is-hover" :src=hoverIcon />
            <slot />
        </button>
    </a>
    <!-- <a class="button-wrapper" :href="href">
        <div class="button" :class="{ 'discord': type === 'discord', disabled, loading }">
            <img class="button-icon" v-if=icon :src=icon />
            <img class="button-icon-hover" :src=hover v-if="icon && hover" />
            <p class="button-content"><slot /></p>
        </div>
    </a> -->
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
