/**
 * Note that you'll still need to change the logo, which is located under static/img.
 * We recommend that you keep the cryb_ prefix for these files to avoid any conflicts.
 * The cryb_ prefix won't be visible to users, and we'll remove any cryb- or cryb_ prefixes in static files in the future.
 */

export default {
    // The name of the service (i.e. 'Cryb')
    name: typeof process.env.BRAND_NAME !== 'undefined' ? process.env.BRAND_NAME : 'Cryb',
    
    // The YouTube ID for the landing video
    landing_video_id: typeof process.env.BRAND_LANDING_VIDEO_ID !== 'undefined' ? process.env.BRAND_LANDING_VIDEO_ID : '-eUJgIrWONo',

    // Optional: Google Analytics Tracking
    ga_tracking_id: typeof process.env.BRAND_GA_TRACKING_ID !== 'undefined' ? process.env.BRAND_GA_TRACKING_ID : undefined
}
