# Kalms MVP Backend and Frontend Integration Plan

This plan picks up from the current data model work and focuses only on what is needed to ship a usable MVP.

## Backend MVP Remaining

1. Build API serializers and viewsets for:
   - assessments: create draft, submit PHQ-9/GAD-7/PSS-10/full scan, list history, retrieve result detail
   - mood logs: create/update today's check-in, list logs, weekly/monthly summaries
   - AI chat: create conversation, list conversations, send message, list messages
   - recommendations: list active recommendations, dismiss recommendation

2. Add authenticated API routes under `/api/v1/` for the dashboard modules:
   - `/assessments/`
   - `/assessments/latest/`
   - `/assessments/history/`
   - `/mood-logs/`
   - `/mood-logs/today/`
   - `/chat/conversations/`
   - `/dashboard/summary/`

3. Add questionnaire definitions in code for the fixed MVP forms:
   - PHQ-9: 9 prompts, 0-3 answers, total score out of 27
   - GAD-7: 7 prompts, 0-3 answers, total score out of 21
   - PSS-10: 10 prompts, 0-4 answers, reverse-score the required items, total score out of 40

4. Implement scoring and validation services:
   - reject incomplete submissions
   - calculate scores server-side from submitted answers
   - store the raw answer map in `Assessment.responses`
   - mark submissions complete only after scoring succeeds

5. Implement the Random Forest prediction service:
   - define a stable input schema using PHQ-9, GAD-7, PSS-10, latest mood, energy, stress, and recent trend values
   - load the trained model from a configured path
   - return `healthy`, `at_risk`, or `distressed`
   - store model name/version, confidence, input snapshot, and trend signal in `Prediction`
   - provide a deterministic fallback rule while the model file is unavailable in local development

6. Implement the recommendation service:
   - generate 2-4 practical recommendations after each completed assessment
   - include higher-priority professional-support guidance for distressed results
   - avoid diagnostic or treatment language

7. Implement dashboard aggregation:
   - total assessments
   - current check-in streak
   - latest wellness category
   - trend indicator
   - latest PHQ-9/GAD-7/PSS-10 score breakdown
   - weekly mood/energy/stress chart data

8. Add permissions and privacy controls:
   - every wellness endpoint must be scoped to `request.user`
   - users must not be able to fetch another user's assessment, mood, prediction, recommendation, or chat data
   - chat responses must include crisis/escalation guardrails before the LLM integration goes live

9. Add tests:
   - model validation for score ranges and one mood log per day
   - assessment scoring for PHQ-9, GAD-7, and PSS-10
   - prediction creation after assessment submission
   - recommendation creation and dismissal
   - API permission boundaries
   - dashboard summary response shape

10. Clean up legacy healthcare route definitions in the frontend route map or isolate them so they do not confuse Kalms API work.

## Frontend Integration Remaining

1. Add TypeScript API types for:
   - `Assessment`
   - `AssessmentSubmission`
   - `Prediction`
   - `Recommendation`
   - `MoodLog`
   - `DashboardSummary`
   - `ChatConversation`
   - `ChatMessage`

2. Add frontend service modules:
   - `AssessmentService`
   - `MoodService`
   - `DashboardService`
   - `ChatService`

3. Replace mock dashboard data with backend data:
   - overview metrics
   - latest assessment scores
   - weekly wellness trend
   - recommendations
   - quick check-in state

4. Build real assessment screens:
   - PHQ-9 form
   - GAD-7 form
   - PSS-10 form
   - full wellness scan flow
   - result loading state and error handling

5. Wire the daily check-in controls:
   - save today's mood, energy, stress, and optional note
   - update the dashboard immediately after save
   - prevent accidental duplicate daily logs by updating the existing log

6. Wire assessment history:
   - list completed assessments newest-first
   - filter by assessment type
   - open result detail
   - export can remain a later enhancement unless required for submission

7. Wire chat companion:
   - create/reuse active conversation
   - send user message to backend
   - render assistant replies
   - show safety boundary text in the UI
   - keep suggested prompts as frontend helpers

8. Add frontend quality states:
   - loading skeletons
   - empty states for new users
   - API error messages that are calm and non-technical
   - mobile checks for forms and charts

9. Add integration checks:
   - registration to dashboard path
   - first assessment submission to results page
   - first daily check-in to dashboard update
   - chat message round trip
