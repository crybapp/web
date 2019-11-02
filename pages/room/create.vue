<template>
    <CreateRoom />
</template>
<script>
    import CreateRoom from '~/components/Room/Create'

    export default {
        head() {
            return {
                title: 'Create a Room'
            }
        },
        middleware: 'authenticated',
        components: {
            CreateRoom
        }
    }
</script>
