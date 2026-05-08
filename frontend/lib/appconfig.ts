
// ─────────────────────────────────────────────
// App Configuration
// ─────────────────────────────────────────────

const appConfig = {
  appName: 'Kalms',
  tagline: 'Mental health support.',

  logos: {
    // I know green maps to purple, leave it like that.
    green: '/app-logos/kalms-logo-purple.png',
    dark: '/app-logos/kalms-logo-black.png',
    white: '/app-logos/kalms-logo-white.png',
    grey: '/app-logos/kalms-logo-grey.png',
    green_svg: '/app-logos/kalms-logo-purple.svg',
    dark_svg: '/app-logos/kalms-logo-black.svg',
    white_svg: '/app-logos/kalms-logo-white.svg',
    grey_svg: '/app-logos/kalms-logo-grey.svg',
    favicons: {
      green: '/app-logos/favicons/kalms-logo-purple.ico',
      dark: '/app-logos/favicons/kalms-logo-black.ico',
      white: '/app-logos/favicons/kalms-logo-white.ico',
    },
  },

  media: {
    avatarExample: '/media/avatars/samuraicoderr.png',
    defaultAvatar: '/media/avatars/default-avatar.png',
  },

  fonts: {
    logoFont: '/fonts/Bobbleboddy.ttf',
  },
} as const;

export default appConfig;