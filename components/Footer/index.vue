<template>
    <div class="footer">
        <p class="footer">
            Powered by <a href="https://cryb.app" target="_blank" rel="noopener">Cryb</a>
            <span v-for="page in pages" :key=page.name>
                &mdash; <a :href=page.link target="_blank" rel="noopener">{{ page.name }}</a>
            </span>
        </p>
    </div>
</template>
<script>
    import pages from '~/brand/pages'

    export default {
        data() {
            return {
                pages
            }
        }
    }
</script>
