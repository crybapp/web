<template>
    <JoinRoom :modal="false" />
</template>
<script>
    import JoinRoom from '~/components/Room/Join'

    export default {
        middleware: 'authenticated',
        components: {
            JoinRoom
        },
        head() {
            return {
                title: 'Join a Room'
            }
        }
    }
</script>
