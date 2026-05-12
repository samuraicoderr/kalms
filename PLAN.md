# Kalms MVP Backend/Frontend Plan

## Agent Handoff Instructions

Use this file as the source of truth for remaining MVP work. When you complete an item, change its checkbox from `[ ]` to `[x]`, add a short dated note with the files touched, and leave it in place under the same section until the user asks for cleanup. If you split an item, add the new child items directly under it so the next agent can continue without rereading the whole codebase.

## Completed Hardcoded Data Remediation

- [x] `DashboardUI.tsx` mock exports removed/refactored. Completed 2026-05-11. Removed hardcoded `wellnessScores`, `weeklyTrend`, `historyRows`, `chatMessages`, `recommendations`, `dashboardMetrics`, and `moodWeek`; deleted unused mock components; made `MiniTrend` and `MoodBars` prop-driven. Files touched: `frontend/app/dashboard/components/DashboardUI.tsx`, `frontend/app/dashboard/overview/page.tsx`, `frontend/app/dashboard/assessments/results/page.tsx`.

- [x] Mood bars and mood averages now come from backend summaries. Completed 2026-05-11. Added mood summary service logic and `/api/v1/mood-logs/summary/`; frontend mood tracker uses summary points and averages instead of hardcoded bars or first-page calculations. Files touched: `backend/src/moods/services.py`, `backend/src/moods/views.py`, `backend/src/moods/tests.py`, `frontend/app/dashboard/mood-tracker/page.tsx`, `frontend/lib/api/services/MoodService.ts`, `frontend/lib/api/types/wellness.types.ts`.

- [x] Insights page is backend-driven for MVP. Completed 2026-05-11. Added `/api/v1/insights/summary/`, removed hardcoded insight cards, and wired metrics/cards/trend values from the API. Files touched: `backend/src/assessments/views.py`, `backend/src/assessments/urls.py`, `frontend/app/dashboard/insights/page.tsx`, `frontend/lib/api/services/DashboardService.ts`.

- [x] Chat hardcoded prompt/status cleanup completed. Completed 2026-05-11. Moved suggested prompts into a documented constants file and replaced fixed `"Online"` copy with neutral `"Ready"`; backend chat reply logic now sits behind a service boundary with crisis-term fallback handling. Files touched: `frontend/app/dashboard/chat/page.tsx`, `frontend/app/dashboard/chat/prompts.ts`, `backend/src/ai_chats/services.py`, `backend/src/ai_chats/views.py`, `backend/src/ai_chats/serializers.py`.

- [x] Assessment questions are backend-owned. Completed 2026-05-11. Added questionnaire definitions with versioned scales/questions and wired `AssessmentForm` to fetch them instead of duplicating prompts in the client. Files touched: `backend/src/assessments/questions.py`, `backend/src/assessments/views.py`, `frontend/app/dashboard/components/AssessmentForm.tsx`, `frontend/lib/api/services/AssessmentService.ts`.

- [x] Recommendation templates moved out of assessment service. Completed 2026-05-11. Added versioned recommendation rules and kept frontend rendering backend-provided recommendation objects only. Files touched: `backend/src/assessments/recommendation_rules.py`, `backend/src/assessments/services.py`.

- [x] Random Forest artifact branch covered by tests. Completed 2026-05-11. Fallback remains for MVP/dev, and tests now cover configured model loading. Files touched: `backend/src/assessments/tests.py`.

- [x] Daily check-in no longer starts with optimistic non-neutral values. Completed 2026-05-11. Sliders initialize to neutral `5` and disable saving while today's log loads. Files touched: `frontend/app/dashboard/components/DailyCheckInForm.tsx`.

- [x] API route map narrowed to Kalms MVP routes. Completed 2026-05-11. Removed legacy beds/patients/admissions/housekeeping/alerts/reports route groups and added questionnaire, mood summary, and insights routes. Files touched: `frontend/lib/api/BackendRoutes.ts`.

- [x] Unused legacy plan/template components removed. Completed 2026-05-11. Deleted stale plan/template components that were not part of Kalms MVP and were tied to missing config entries. Files touched: `frontend/components/app/plans/*`, `frontend/components/app/templates/*`.

- [x] Visible placeholder navigation hidden for MVP. Completed 2026-05-11. Sidebar and user dropdown now expose only wired MVP dashboard areas; old admin/trash/profile/settings/app-marketplace style entries were removed from visible navigation. Files touched: `frontend/components/app/layout/Sidebar.tsx`, `frontend/components/app/layout/TopHeader.tsx`, `frontend/components/app/fragments/UserDropdown.tsx`.

## Remaining MVP Work

- [ ] Clean up or document the stale Postgres test database issue (`test_neondb`) so normal backend test commands do not prompt or fail in automation. Note 2026-05-11: focused tests pass with `USE_DEFAULT_BACKEND=True`; default database behavior still needs a team decision.

- [ ] Fix full-project frontend lint failures outside the new wellness/dashboard work. Note 2026-05-11: `npx.cmd tsc --noEmit` passes and targeted lint for touched MVP files passes, but full `npx.cmd eslint` still fails in older auth/API files such as `frontend/lib/api/ApiClient.ts`, OAuth callback pages, username onboarding pages, WebSocket hooks, and settings/user services.

- [ ] Optional direct-route cleanup for hidden placeholder dashboard pages. Note 2026-05-11: placeholder pages were removed from visible MVP navigation, but files like `dashboard/settings/*`, `dashboard/profile`, `dashboard/organization`, `dashboard/chat/tips`, and similar direct routes still exist. Delete, redirect, or replace them if direct URL access should be blocked before launch.

## Verification

- [x] Backend system check passed on 2026-05-11 with `DJANGO_DEBUG=True`.
- [x] Backend focused tests passed on 2026-05-11 with `USE_DEFAULT_BACKEND=True`: `src.assessments`, `src.moods`, `src.ai_chats` ran 9 tests successfully.
- [x] Frontend touched-file lint passed on 2026-05-11.
- [x] Frontend TypeScript check passed on 2026-05-11 with `npx.cmd tsc --noEmit`.
- [ ] Full frontend lint is not clean yet. See remaining lint item above.
