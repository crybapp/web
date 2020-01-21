<template>
    <div class="footer">
        <p class="footer">
            &copy; {{ new Date().getFullYear() }} {{ brand.name }}
            <span v-for="page in pages" :key=page.name>
                &mdash; <a :href=page.link target="_blank" rel="noopener">{{ page.name }}</a>
            </span>
        </p>
    </div>
</template>
<script>
	import brand from '~/brand/config'
	import pages from '~/brand/pages'

	export default {
		data() {
			return {
				brand,
				pages
			}
		}
	}
</script>
