import 'dotenv/config'
import brand from './brand/config'

const borealis = process.env.BOREALIS_REPOSITORY && process.env.NODE_ENV === 'development' ? process.env.BOREALIS_REPOSITORY : '@cryb/borealis'

const script = []
if (brand.ga_tracking_id)
    script.push({
        src: `https://www.googletagmanager.com/gtag/js?id=${brand.ga_tracking_id}`,
        async: true,
        defer: true
    })

export default {
    globalName: 'cryb',
    mode: 'spa',
    css: [
        borealis
    ],
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
        SHOW_PLAYER_DEVTOOLS: (process.env.SHOW_PLAYER_DEVTOOLS === 'true' && process.env.NODE_ENV === 'development'),
        AUDIO_BITRATE: process.env.AUDIO_BITRATE,
        VIDEO_BITRATE: process.env.VIDEO_BITRATE
    },
    generate: {
        routes: [
            '/i/'
        ]
    },
    modules: [
        'nuxt-client-init-module',
        'nuxt-clipboard2',

        '@nuxtjs/axios',
        '@nuxtjs/robots'
    ],

    axios: {
        baseURL: process.env.API_BASE_URL
    },
    build: {
        extractCSS: true,
        publicPath: (process.env.PUBLIC_PATH || '/_cryb/')
	},
    head: {
        title: brand.name,
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no' },
            { name: 'description', content: `${brand.name} makes it easy to enjoy what you love with your friends` },
            { name: 'theme-color', content: '#000000' },
            { property: 'og:title', content: brand.name },
            { property: 'og:image', content: '/img/icon-hq.png' },
            { property: 'og:type', content: 'website' }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }
        ],
        script: [
            ...script
        ]
    },
    loadingIndicator: '~/components/Loading/index.html',
    robots: {
        // by default, this only allows the root to be indexed, not the rest, which is enough.
        UserAgent: '*',
        Allow: '/$',
        Disallow: '/'
    }
}
