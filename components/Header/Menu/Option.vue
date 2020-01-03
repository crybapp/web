<template>
    <nuxt-link
        class="is-wrapper"
        :to="to || ''"
        :class="{ disabled }"
    >
        <div class="menu-option-wrapper">
            <div
                class="menu-option"
                :class="{ 'has-icon': icon, loading, disabled }"
                @click="didClickOption()"
            >
                <img
                    v-if="icon"
                    class="menu-option-icon"
                    :class="{ 'align-top': icon === 'door' }"
                    :src="`/icons/${icon}.svg`"
                >
                <p v-if="!html" class="menu-option-content">
                    <slot />
                </p>
                <slot v-else />
            </div>
        </div>
    </nuxt-link>
</template>
<script>
    export default {
        props: [
            'to',
            'icon',
            'name',
            'html',
            'loading',
            'disabled'
        ],
        methods: {
            didClickOption() {
                if(this.$parent.$parent.didClickOption)
                    this.$parent.$parent.didClickOption(this.name)
                else if(this.$parent.$parent.$parent.didClickOption)
                    this.$parent.$parent.$parent.didClickOption(this.name)
            }
        }
    }
</script>
