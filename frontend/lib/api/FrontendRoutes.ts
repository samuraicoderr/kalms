/**
 * Frontend Route Definitions
 * Centralized route management for kalms
 */


export const FrontendRoutes = {
  home: '/',
  dashboard: '/dashboard',

  dashboardRoutes: {
    main: '/dashboard',
    organization: '/dashboard/organization',
    trash: '/dashboard/trash',
    profile: '/settings',
  },

  // Auth routes
  auth: {
    login: '/auth/login',
    mfa: '/auth/login/mfa',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    oauthCallback: (provider: string) => `/auth/oauth/callback/${provider}`,
    onboarding: {
      root: '/auth/onboarding', 
      basicInfo: '/auth/onboarding/basic-info',
      password: '/auth/onboarding/password',
      verifyEmail: '/auth/onboarding/verify-email',
      verifyPhone: '/auth/onboarding/phone-verification',
      username: '/auth/onboarding/username',
      profilePicture: '/auth/onboarding/profile-picture',
      complete: '/auth/onboarding/complete',
    }
  },

  organization: '/dashboard/organization',
  trash: '/dashboard/trash',
} as const;

export const Routes = FrontendRoutes;

export default FrontendRoutes;
