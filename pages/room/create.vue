<template>
    <CreateRoom />
</template>
<script>
    import CreateRoom from '~/components/Room/Create'

    export default {
        middleware: 'authenticated',
        components: {
            CreateRoom
        },
        head() {
            return {
                title: 'Create a Room'
            }
        }
    }
</script>
