<template>
    <div class="center">
        <JoinRoom />
    </div>
</template>
<script>
    import JoinRoom from '~/components/room/join'

    export default {
        head() {
            return {
                title: 'Join a Room'
            }
        },
        middleware: 'authenticated',
        components: {
            JoinRoom
        }
    }
</script>