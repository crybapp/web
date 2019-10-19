<template>
    <nuxt-link class="menu-option-wrapper" :to="to || ''" :class="{ disabled }">
        <div class="menu-option" :class="{ 'has-icon': icon, loading, disabled }" @click=didClickOption()>
            <img class="menu-option-icon" :class="{ 'align-top': icon === 'door' }" :src="`/icons/${icon}.svg`" v-if=icon>
            <p class="menu-option-content" v-if="!html"><slot /></p>
            <div class="menu-option-content" v-else>
                <slot />
            </div>
        </div>
    </nuxt-link>
</template>
<script>
    export default {
        methods: {
            didClickOption() {
                if(this.$parent.$parent.didClickOption)
                    this.$parent.$parent.didClickOption(this.name)
                else if(this.$parent.$parent.$parent.didClickOption)
                    this.$parent.$parent.$parent.didClickOption(this.name)
            }
        },
        props: [
            'to',
            'icon',
            'name',
            'html',
            'loading',
            'disabled'
        ]
    }
</script>
