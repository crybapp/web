require('dotenv').config()

export default {
    loading: false,
    modules: [
        'nuxt-client-init-module',
        'nuxt-clipboard2',

        '@nuxtjs/axios'
    ],
    plugins: ["~/middleware/i18n.js"],
    env: {
        /**
         * Brand
         */
        BRAND_NAME: process.env.BRAND_NAME,
        BRAND_LANDING_VIDEO_ID: process.env.BRAND_LANDING_VIDEO_ID,
        BRAND_GA_TRACKING_ID: process.env.BRAND_GA_TRACKING_ID,

        /**
         * URLs
         */
        WS_URL: process.env.API_WS_URL,
        BASE_WEB_URL: process.env.WEB_BASE_URL,

        /**
         * Other Config
         */
        SHOW_PLAYER_DEVTOOLS: process.env.NODE_ENV === 'development'
    },
    axios: {
        baseURL: process.env.API_BASE_URL
    },
    build: {
        extractCSS: true
    }
}
