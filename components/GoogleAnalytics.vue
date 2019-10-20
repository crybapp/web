<template>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '{{ this.brand.ga_tracking_id }}');
    </script>
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