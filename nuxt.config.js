import 'dotenv/config'
import brand from './brand/config'

const borealis = process.env.BOREALIS_REPOSITORY ? process.env.BOREALIS_REPOSITORY : '@cryb/borealis'

const script = []
if (brand.ga_tracking_id)
    script.push({
        src: `https://www.googletagmanager.com/gtag/js?id=${brand.ga_tracking_id}`,
        async: true,
        defer: true
    })

export default {
    globalName: 'cryb',
    mode: (process.env.RENDER_MODE === 'ssr' ? 'universal' : 'spa'),
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
        JANUS_PORT: process.env.JANUS_PORT,
        JANUS_URL: process.env.JANUS_URL,
        TURN_URL: process.env.TURN_URL,

        /**
         * Other Config
         */
        ENABLE_JANUS: (process.env.ENABLE_JANUS === 'true'),
        ENABLE_TURN: (process.env.ENABLE_TURN === 'true'),
        TURN_USERNAME: process.env.TURN_USERNAME,
        TURN_PASSWORD: process.env.TURN_PASSWORD,
        SHOW_PLAYER_DEVTOOLS: (process.env.SHOW_PLAYER_DEVTOOLS === 'true'),
        SHOW_FOOTER: (process.env.SHOW_FOOTER !== 'false'),
        AUDIO_BITRATE: process.env.AUDIO_BITRATE,
        VIDEO_BITRATE: process.env.VIDEO_BITRATE
    },
    generate: {
        routes: [
            '/i/'
        ],
        fallback: '200.html'
    },
    modules: [
        'nuxt-client-init-module',
        'nuxt-clipboard2',

        '@nuxtjs/axios',
        '@nuxtjs/pwa',
        '@nuxtjs/robots'
    ],

    axios: {
        baseURL: process.env.API_BASE_URL
    },
    build: {
        extractCSS: true,
        filenames: {
            app: ({ isDev }) => isDev ? '[name].js' : 'js/[contenthash:8].js',
            chunk: ({ isDev }) => isDev ? '[name].js' : 'js/[contenthash:8].js',
            css: ({ isDev }) => isDev ? '[name].css' : '[contenthash:8].css',
            img: ({ isDev }) => isDev ? '[path][name].[ext]' : 'img/[contenthash:8].[ext]',
            font: ({ isDev }) => isDev ? '[path][name].[ext]' : 'fonts/[contenthash:8].[ext]',
            video: ({ isDev }) => isDev ? '[path][name].[ext]' : '[contenthash:8].[ext]'
        },
        loaders: {
            imgUrl: { limit: 8192 },
        },
        publicPath: (process.env.PUBLIC_PATH || '/assets/'),
        watch: [
            '~/.env'
        ]
    },
    head: {
        title: brand.name,
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, minimal-ui' },
            { name: 'name', content: brand.name },
            { hid: 'description', name: 'description', content: `${brand.name} makes it easy to enjoy what you love with your friends` },
            { name: 'theme-color', content: '#000000' },
            { property: 'og:site_name', content: brand.name },
            { hid: 'og:title', property: 'og:title', content: brand.name },
            { hid: 'og:description', property: 'og:description', content: `${brand.name} makes it easy to enjoy what you love with your friends` },
            { property: 'og:image', content: '/img/icon-hq.png' },
            { property: 'og:type', content: 'website' },
            { name: 'format-detection', content: 'telephone=no' }
        ],
        link: [
            { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
            { rel: 'icon', type: 'image/png', href: '/favicon.png' }
        ],
        script: [
            ...script
        ],
        noscript: [
            { innerHTML: 'Cryb requires JavaScript to be enabled in order to work.' }
        ]
    },
    loadingIndicator: '~/components/Loading/index.html',
    robots: {
        // by default, this only allows the root to be indexed, not the rest, which is enough.
        UserAgent: '*',
        Allow: '/$',
        Disallow: '/'
    },
    pwa: {
        meta: {
            mobileApp: true,
            mobileAppIOS: true,
            author: false,
            appleStatusBarStyle: 'black',
            favicon: false
        },
        icon: {
            iconSrc: 'assets/icon.png',
            targetDir: 'img'
        },
        manifest: {
            name: brand.name,
            short_name: brand.name,
            description: `${brand.name} makes it easy to enjoy what you love with your friends`,
            prompt_message: 'Easily access Cryb via a convenient way - your home screen!',
            theme_color: '#000000',
            background_color: '#ffffff'
        }
    }
}
