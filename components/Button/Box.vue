<template>
    <ButtonLink :href="href" :to="to" :fake="fake">
        <div class="box option is-hoverable" :class="{ 'is-loading': loading, 'is-disabled': disabled }">
            <img v-if="icon" class="icon" :src="require(`~/assets/icons/${icon}.svg`)" :alt="alt" />
            <img v-if="icon && hover" class="icon is-hover" :src="require(`~/assets/icons/${hover}.svg`)" :alt="alt" />
            <h3 class="header">
                <slot />
            </h3>
            <p v-if="description" class="description">
                {{ description }}
            </p>
        </div>
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
            'description',

            'loading',
            'disabled'
        ],
    }
</script>
