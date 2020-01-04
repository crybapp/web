<template>
    <div class="footer">
        <p class="footer">
            &copy; {{ new Date().getFullYear() }} {{ brand.name }}
        </p>
    </div>
</template>
<script>
	import brand from '~/brand/config'

	export default {
		data() {
			return {
				brand
			}
		}
	}
</script>
