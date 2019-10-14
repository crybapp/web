require('dotenv').config()

export default {
    loading: false,
    modules: [
        'nuxt-client-init-module',
        'nuxt-clipboard2',

        '@nuxtjs/axios'
    ],
    env: {
        WS_URL: process.env.API_WS_URL,
        APERTURE_WS_URL: process.env.APERTURE_WS_URL,
        
        BASE_WEB_URL: process.env.WEB_BASE_URL,
        SHOW_PLAYER_DEVTOOLS: process.env.NODE_ENV === 'development'
    },
    axios: {
        baseURL: process.env.API_BASE_URL
    },
    build: {
        extractCSS: true
    }
}
