/**
 * Kalms Backend API Routes
 * Keep this file limited to the MVP API surface that the frontend actually uses.
 */

const API_VERSION = "/api/v1";

export const BackendRoutes = {
  auth: {
    login: `${API_VERSION}/auth/login/`,
    refresh: `${API_VERSION}/auth/login/refresh_token/`,
    register: `${API_VERSION}/auth/register/`,
    checkUsername: `${API_VERSION}/auth/check_username/`,
    joinWaitlist: `${API_VERSION}/auth/join_waitlist/`,

    me: `${API_VERSION}/users/me/`,
    updateMe: `${API_VERSION}/users/update_me/`,
    deleteMe: `${API_VERSION}/users/delete_me/`,

    changePassword: `${API_VERSION}/security/password/`,
    sendForgotPasswordOtp: `${API_VERSION}/security/password/send_forgot_password_otp/`,
    resetForgotPassword: `${API_VERSION}/security/password/reset_forgot_password/`,

    mfa: {
      qrImage: (token: string) => `${API_VERSION}/auth/mfa/authapp/qr-image/${token}/`,
      requestQrCode: `${API_VERSION}/auth/mfa/authapp/request_qr_code/`,
      challenge: `${API_VERSION}/auth/mfa/challenge/`,
      methods: `${API_VERSION}/auth/mfa/methods/`,
      pushRegisterDevice: `${API_VERSION}/auth/mfa/push/register-device/`,
      setupTotp: `${API_VERSION}/auth/mfa/setup/totp/`,
      setupWebauthn: `${API_VERSION}/auth/mfa/setup/webauthn/`,
      verify: `${API_VERSION}/auth/mfa/verify/`,
      verifyTotp: `${API_VERSION}/auth/mfa/verify/totp/`,
      verifyWebauthn: `${API_VERSION}/auth/mfa/verify/webauthn/`,
    },

    onboarding: {
      sendEmailOtp: `${API_VERSION}/auth/onboarding/email/send_email_verification_otp/`,
      checkEmailOtp: `${API_VERSION}/auth/onboarding/email/check_email_verification_otp/`,
      sendPhoneOtp: `${API_VERSION}/auth/onboarding/phone/send_phone_verification_otp/`,
      checkPhoneOtp: `${API_VERSION}/auth/onboarding/phone/check_phone_verification_otp/`,
      getOnboardingToken: `${API_VERSION}/auth/onboarding/get_onboarding_token/`,
      getUserData: `${API_VERSION}/auth/onboarding/get_user_data/`,
      setUserBasicInfo: `${API_VERSION}/auth/onboarding/set_user_basic_info/`,
      setPassword: `${API_VERSION}/auth/onboarding/set_password/`,
      setUsername: `${API_VERSION}/auth/onboarding/set_username/`,
      setProfilePicture: `${API_VERSION}/auth/onboarding/set_profile_picture/`,
      exchangeTokens: `${API_VERSION}/auth/onboarding/exchange_onboarding_tokens_for_login_tokens/`,
    },

    requestQrCode: `${API_VERSION}/auth/mfa/authapp/request_qr_code/`,
    check2faOtp: `${API_VERSION}/auth/mfa/verify/`,
    sendEmailOtp: `${API_VERSION}/auth/onboarding/email/send_email_verification_otp/`,
    sendPhoneOtp: `${API_VERSION}/auth/onboarding/phone/send_phone_verification_otp/`,
    checkEmailOtp: `${API_VERSION}/auth/onboarding/email/check_email_verification_otp/`,
    checkPhoneOtp: `${API_VERSION}/auth/onboarding/phone/check_phone_verification_otp/`,
    getOnboardingToken: `${API_VERSION}/auth/onboarding/get_onboarding_token/`,
    setBasicInfo: `${API_VERSION}/auth/onboarding/set_user_basic_info/`,
    setPassword: `${API_VERSION}/auth/onboarding/set_password/`,
    setUsername: `${API_VERSION}/auth/onboarding/set_username/`,
    setProfilePicture: `${API_VERSION}/auth/onboarding/set_profile_picture/`,
    exchangeOnboardingTokens: `${API_VERSION}/auth/onboarding/exchange_onboarding_tokens_for_login_tokens/`,
  },

  organizations: {
    base: `${API_VERSION}/organizations/`,
    detail: (id: string) => `${API_VERSION}/organizations/${id}/`,
  },

  dashboard: {
    summary: `${API_VERSION}/dashboard/summary/`,
  },

  wellness: {
    assessments: `${API_VERSION}/assessments/`,
    submitAssessment: `${API_VERSION}/assessments/submit/`,
    latestAssessment: `${API_VERSION}/assessments/latest/`,
    assessmentHistory: `${API_VERSION}/assessments/history/`,
    questionnaires: `${API_VERSION}/assessments/questionnaires/`,
    assessmentDetail: (id: string) => `${API_VERSION}/assessments/${id}/`,
    recommendations: `${API_VERSION}/recommendations/`,
    dismissRecommendation: (id: string) => `${API_VERSION}/recommendations/${id}/dismiss/`,
    moodLogs: `${API_VERSION}/mood-logs/`,
    moodSummary: `${API_VERSION}/mood-logs/summary/`,
    todayMoodLog: `${API_VERSION}/mood-logs/today/`,
    insightsSummary: `${API_VERSION}/insights/summary/`,
    chatConversations: `${API_VERSION}/chat/conversations/`,
    activeChatConversation: `${API_VERSION}/chat/conversations/active/`,
    chatConversationDetail: (id: string) => `${API_VERSION}/chat/conversations/${id}/`,
    chatMessages: (id: string) => `${API_VERSION}/chat/conversations/${id}/messages/`,
    sendChatMessage: (id: string) => `${API_VERSION}/chat/conversations/${id}/send-message/`,
  },

  passwordReset: {
    request: `${API_VERSION}/reset/`,
    confirm: `${API_VERSION}/reset/confirm/`,
    renderResetPage: `${API_VERSION}/reset/confirm/render_reset_page/`,
    validateToken: `${API_VERSION}/reset/validate_token/`,
  },

  realtime: {
    websocket: (token: string) => `ws://localhost:9000/ws/kalms/?token=${token}`,
  },

  me: `${API_VERSION}/users/me/`,
  loginFirstFactor: `${API_VERSION}/auth/login/`,
  refreshToken: `${API_VERSION}/auth/login/refresh_token/`,
  register: `${API_VERSION}/auth/register/`,
  checkUsername: `${API_VERSION}/auth/check_username/`,
  joinWaitlist: `${API_VERSION}/auth/join_waitlist/`,
  updateMe: `${API_VERSION}/users/update_me/`,
  deleteMe: `${API_VERSION}/users/delete_me/`,
  changePassword: `${API_VERSION}/security/password/`,
  sendForgotPasswordOtp: `${API_VERSION}/security/password/send_forgot_password_otp/`,
  resetForgotPassword: `${API_VERSION}/security/password/reset_forgot_password/`,

  getUsers: `${API_VERSION}/users/`,
  getUser: (id: string) => `${API_VERSION}/users/${id}/`,
  updatePassword: `${API_VERSION}/security/password/`,
  resetRecoveryCodes: `${API_VERSION}/security/2fa/reset_recovery_codes/`,

  requestQrCode: `${API_VERSION}/auth/mfa/authapp/request_qr_code/`,
  check2faOtp: `${API_VERSION}/auth/mfa/verify/`,

  sendEmailOtp: `${API_VERSION}/auth/onboarding/email/send_email_verification_otp/`,
  sendPhoneOtp: `${API_VERSION}/auth/onboarding/phone/send_phone_verification_otp/`,
  checkEmailOtp: `${API_VERSION}/auth/onboarding/email/check_email_verification_otp/`,
  checkPhoneOtp: `${API_VERSION}/auth/onboarding/phone/check_phone_verification_otp/`,
  getOnboardingToken: `${API_VERSION}/auth/onboarding/get_onboarding_token/`,
  onboardingSendEmailOtp: `${API_VERSION}/auth/onboarding/email/send_email_verification_otp/`,
  onboardingCheckEmailOtp: `${API_VERSION}/auth/onboarding/email/check_email_verification_otp/`,
  onboardingSendPhoneOtp: `${API_VERSION}/auth/onboarding/phone/send_phone_verification_otp/`,
  onboardingCheckPhoneOtp: `${API_VERSION}/auth/onboarding/phone/check_phone_verification_otp/`,
  onboardingSetUserBasicInfo: `${API_VERSION}/auth/onboarding/set_user_basic_info/`,
  onboardingSetPassword: `${API_VERSION}/auth/onboarding/set_password/`,
  onboardingSetUsername: `${API_VERSION}/auth/onboarding/set_username/`,
  onboardingSetProfilePicture: `${API_VERSION}/auth/onboarding/set_profile_picture/`,
  onboardingGetUserData: `${API_VERSION}/auth/onboarding/get_user_data/`,
  onboardingExchangeTokens: `${API_VERSION}/auth/onboarding/exchange_onboarding_tokens_for_login_tokens/`,

  oauthAuthorizeCode: (provider: string) => `${API_VERSION}/oauth/${provider}/login-or-register/`,
  oauthLoginOrRegister: (provider: string) => `${API_VERSION}/oauth/${provider}/login-or-register/`,
  oauthGetProviders: `${API_VERSION}/oauth/get_providers/`,

  notifications: `${API_VERSION}/notifications/`,
  notificationsUnreadCount: `${API_VERSION}/notifications/unread-count/`,
  notificationMarkRead: (id: string) => `${API_VERSION}/notifications/${id}/read/`,
  notificationsMarkAllRead: `${API_VERSION}/notifications/mark-all-read/`,
} as const;

export default BackendRoutes;
