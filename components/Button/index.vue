<template>
    <ButtonLink :href="href" :to="to" :fake="fake">
        <button class="button" :class="{ 'has-theme': theme, 'is-discord-theme': theme === 'discord', 'has-icon': icon, 'is-loading': loading, 'is-disabled': disabled }">
            <img v-if="icon" class="icon" :src="require(`~/assets/icons/${icon}.svg`)" :alt="alt" />
            <img v-if="icon && hover" class="icon is-hover" :src="require(`~/assets/icons/${hover}.svg`)" :alt="alt" />
            <slot />
        </button>
    </ButtonLink>
</template>
<script>
    import ButtonLink from '~/components/Button/Link'

    export default {
        components: {
            ButtonLink
        },
        props: [
            'href',
            'to',
            'fake',
            'icon',
            'hover',
            'alt',

            'theme',

            'loading',
            'disabled'
        ]
    }
</script>
