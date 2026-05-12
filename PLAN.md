# Kalms MVP Next Phase: LangChain Multi-Chat System

## Agent Handoff Instructions

Use this file as the source of truth for the remaining MVP chat work. When you complete an item, change its checkbox from `[ ]` to `[x]`, add a short dated note with the files touched, and leave it in place under the same section until the user asks for cleanup. If you split an item, add the new child items directly under it so the next agent can continue without rereading the whole codebase.
Make sure as you execute you update this file marking completed items and adding notes on what you did, so the next agent can pick up where you left off without needing to read the whole codebase again.
Here's a sample format for an entry:
- [x] <Task description> (Completed on YYYY-MM-DD)
  - <Short note on what you did, including files touched and any important details.>+
- [ ] <Next task description> (Not started)
  - <Short note on what you plan to do, including files you expect to touch and any important details.>+

## Remaining Work

This file previously listed many completed backend and frontend chat integration items; those have been completed and were removed from this document to keep the plan focused on the remaining priorities.

### Auth System: OAuth And Onboarding Carryover

- [x] Fix OAuth callback redirect hanging after `login-or-register` returns an onboarding response. Reported 2026-05-12 from production route `/auth/oauth/callback/google?...`: the callback page says `Redirecting...` forever until the user refreshes. Network trace shows `POST /oauth/google/login-or-register/` succeeds with `onboarding_required: true`, `onboarding_status: "needs_password"`, `onboarding_flow`, and `onboarding_token`, but the frontend then makes `/me` requests instead of sending the user through onboarding.
  - Start with `frontend/app/auth/oauth/callback/[provider]/page.tsx`, `frontend/app/pages/oauth/callback/[provider]/page.tsx`, and `frontend/app/auth/hooks/useLoginSuccess.ts`.
  - `useLoginSuccess` currently returns early when `authUtils.isAuthenticated()` is true, which can skip the onboarding branch and leave the callback page with no navigation. Make onboarding and MFA responses win over stale/full auth state.
  - Persist the `onboarding_token`, `onboarding_status`, and `onboarding_flow` from OAuth before any `/me` fetch happens.
  - Route the user directly to `getOnboardingRoute(response.onboarding_status)`, e.g. `/auth/onboarding/password` for `needs_password`.
  - Prevent duplicate callback exchanges from React Strict Mode or dependency churn by guarding each OAuth `code`/`provider` pair once the exchange starts.
  - Clean the callback URL after reading `code`, `state`, and provider errors so refresh does not reuse an already-consumed authorization code.
  - Add error handling for an expired/invalid reused OAuth code that sends the user back to login with a clear message.

- [x] Audit and consolidate duplicate auth/onboarding route trees. The frontend currently has both `/auth/...` and legacy `/pages/...` auth/onboarding implementations, including duplicate OAuth callback pages. Decide which tree is canonical, then either remove the stale tree or keep it as a thin redirect so fixes do not drift. (btw pages is the the old stuff)
  - Confirm all `FrontendRoutes` auth paths point to the canonical `/auth/...` routes.
  - Check that OAuth redirect URI configuration uses the same callback route in local, Vercel preview, and production.
  - Make sure old `/pages/oauth/callback/[provider]` behavior cannot silently diverge from `/auth/oauth/callback/[provider]`.

- [ ] Tighten onboarding integration after OAuth.
  - Ensure every onboarding page can recover from the stored OAuth `onboarding_token` without requiring a password login first.
  - Verify `needs_basic_information`, `needs_password`, `needs_profile_username`, `needs_profile_picture`, and `completed` transitions match the backend `onboarding_flow`.
  - After the final onboarding step, exchange the onboarding token for login tokens exactly once and then fetch `/me`.
  - Clear partial onboarding state only after token exchange succeeds, not before.
  - Handle expired onboarding tokens by sending the user back through login/OAuth with a useful error.

- [ ] Add auth regression coverage.
  - Frontend test for OAuth callback receiving `onboarding_required: true` and navigating to the expected onboarding route without calling `/me`.
  - Frontend test for OAuth callback receiving normal JWT tokens and navigating to the dashboard/home after `/me` succeeds.
  - Frontend test for duplicate callback effects so one authorization code is exchanged once.
  - Backend/API test or documented contract check that OAuth users skip email verification and receive the expected onboarding status/token payload.

## Verification Requirements

- [ ] Backend tests cover LangChain provider configuration errors and at least one mocked successful model call. Added 2026-05-12 in `backend/src/ai_chats/tests.py`, but not verified because the sandbox blocks Python/uv access outside the workspace.
- [ ] Backend tests cover user-context tools and prove they are scoped to the authenticated user. Added 2026-05-12 in `backend/src/ai_chats/tests.py`, but not verified because the sandbox blocks Python/uv access outside the workspace.
- [ ] Backend tests cover listing, creating, deleting, and renaming chat threads. Added 2026-05-12 in `backend/src/ai_chats/tests.py`, but not verified because the sandbox blocks Python/uv access outside the workspace.
- [ ] Backend tests cover auto-naming fallback behavior. Added 2026-05-12 in `backend/src/ai_chats/tests.py`, but not verified because the sandbox blocks Python/uv access outside the workspace.
- [ ] Backend tests cover edit/regenerate pruning and active branch history. Added 2026-05-12 in `backend/src/ai_chats/tests.py`, but not verified because the sandbox blocks Python/uv access outside the workspace.
- [ ] Frontend TypeScript passes with `npx.cmd tsc --noEmit`. Attempted 2026-05-12, but the sandbox blocked Node while resolving `C:\Users\Us` with `EPERM: operation not permitted`.
- [ ] Targeted frontend lint passes for the new chat route, chat components, chat services, and updated API types. Attempted 2026-05-12, but the sandbox blocked Node while resolving `C:\Users\Us` with `EPERM: operation not permitted`.
- [ ] Run a browser smoke test for the full-page chat route after implementation. Not run 2026-05-12 because frontend dev/runtime checks were blocked by sandboxed Node access.

## Known Carryover Work Outside This Phase

- [ ] Sync `backend/uv.lock` after adding LangChain dependencies to `backend/pyproject.toml`. Note 2026-05-12: `uv` could not run in this sandbox because it needs access to user-level Python/cache directories outside the workspace.
- [ ] Clean up or document the stale Postgres test database issue (`test_neondb`) so normal backend test commands do not prompt or fail in automation.
- [ ] Fix full-project frontend lint failures outside the chat work, especially older auth/API/WebSocket files.
