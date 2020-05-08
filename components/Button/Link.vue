<template>
    <nuxt-link v-if="to" class="is-wrapper" :to="to">
        <slot />
    </nuxt-link>
    <a v-else class="is-wrapper" :href="href" :onclick="fake ? 'return false' : null">
        <slot />
    </a>
</template>
<script>
    export default {
        props: [
            'href',
            'to',
            'fake'
        ]
    }
</script>
