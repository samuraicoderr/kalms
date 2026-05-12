# Kalms MVP Next Phase: LangChain Multi-Chat System

## Agent Handoff Instructions

Use this file as the source of truth for the remaining MVP chat work. When you complete an item, change its checkbox from `[ ]` to `[x]`, add a short dated note with the files touched, and leave it in place under the same section until the user asks for cleanup. If you split an item, add the new child items directly under it so the next agent can continue without rereading the whole codebase.

## Backend: LangChain And Multi-Chat Integration

- [x] Replace the current MVP rule-based chat reply logic with LangChain. Completed 2026-05-12. Added `LangChainCompanionService`, removed the rule-based main path, and retained crisis guardrail handling before model calls. Files touched: `backend/src/ai_chats/services.py`, `backend/src/ai_chats/views.py`.
  - Remove direct rule-based response generation from the main chat path.
  - Keep crisis/safety guardrails around the LangChain flow so urgent language still receives safe escalation copy.
  - Preserve the current API contract where possible so frontend integration can evolve without churn.

- [x] Implement model-agnostic LangChain configuration. Completed 2026-05-12. Added provider/model/API-key environment configuration with OpenAI, Anthropic, Gemini, and Ollama factories plus clear configuration errors. Files touched: `backend/src/ai_chats/services.py`, `backend/pyproject.toml`.
  - Use LangChain chat model interfaces rather than provider-specific code in views or serializers.
  - Configure provider/model entirely via environment variables.
  - Required environment variables should include `LANGCHAIN_LLM_PROVIDER`, `LANGCHAIN_LLM_MODEL`, and `LANGCHAIN_LLM_API_KEY`.
  - Support provider choices such as OpenAI, Anthropic, Gemini, and Ollama where practical for MVP.
  - Fail clearly when provider configuration is missing or unsupported.

- [x] Add LangChain tools for authenticated user context. Completed 2026-05-12. Added user-scoped tools for recent mood logs, latest assessment/prediction, and active recommendations. Files touched: `backend/src/ai_chats/services.py`, `backend/src/ai_chats/tests.py`.
  - Create a tool for fetching recent mood logs for the current authenticated user.
  - Create a tool for fetching the latest assessment scores and prediction for the current authenticated user.
  - Create a tool for fetching active recommendations for the current authenticated user.
  - Ensure tools are user-scoped and cannot access another user's data.
  - Let the LLM decide when to call these tools based on the user's prompt.

- [x] Update backend chat support for multiple chat threads per user. Completed 2026-05-12. Added/refined list, create, delete, and rename support using existing conversation ownership boundaries. Files touched: `backend/src/ai_chats/views.py`, `backend/src/ai_chats/serializers.py`, `backend/src/ai_chats/tests.py`.
  - Add or refine endpoint for listing the authenticated user's chats.
  - Add endpoint for creating a new chat.
  - Add endpoint for deleting a chat.
  - Add endpoint for renaming a chat.
  - Ensure all chat queries are user-scoped.

- [x] Implement automatic chat naming. Completed 2026-05-12. Added title generation through the companion service with first-message truncation fallback. Files touched: `backend/src/ai_chats/services.py`, `backend/src/ai_chats/serializers.py`, `backend/src/ai_chats/tests.py`.
  - When a new chat is created, generate a title from the user's first message and the AI's first response.
  - Use a simple LangChain chain if configuration is available.
  - Fall back to truncating the user's first message to roughly 50 characters if title generation fails.

- [x] Implement message ordering and active branch history. Completed 2026-05-12. Added `message_index`, migration backfill, ordering constraints, and history scoped to the selected thread. Files touched: `backend/src/ai_chats/models.py`, `backend/src/ai_chats/migrations/0002_chatmessage_message_index.py`, `backend/src/ai_chats/admin.py`, `backend/src/ai_chats/tests.py`.
  - Ensure chat messages have a stable per-thread index/order field if one does not already exist.
  - The LLM should only receive messages from the active branch in index order.
  - Add tests that prove message history is scoped to the selected chat thread.

- [x] Implement message branching for user edit and AI regenerate flows. Completed 2026-05-12. Added edit/regenerate service methods and endpoints that prune messages after the selected index and regenerate against the active branch. Files touched: `backend/src/ai_chats/services.py`, `backend/src/ai_chats/views.py`, `backend/src/ai_chats/serializers.py`, `backend/src/ai_chats/tests.py`.
  - Rule: when a user edits their message or regenerates an AI response at index `i`, that message becomes the new head of the conversation.
  - Permanently delete all messages in the same chat with an index greater than `i`.
  - For edited user messages, save the updated text, prune subsequent messages, and generate a fresh AI response from the active branch.
  - For regenerated AI messages, prune from the AI message index onward as needed, then generate and save a fresh AI response for that branch.
  - Add tests for pruning behavior, active branch history, edit flow, and regenerate flow.

## Frontend: Full-Page Chat UI And Thread Management

- [x] Add full-page chat thread route. Completed 2026-05-12. Added `/dashboard/chats/[id]` and adjusted the dashboard layout so chat threads use a full-height workspace instead of the standard page container. Files touched: `frontend/app/dashboard/chats/[id]/page.tsx`, `frontend/app/dashboard/layout.tsx`, `frontend/app/dashboard/chat/page.tsx`.
  - Implement a route like `/dashboard/chats/[id]`.
  - The chat interface should occupy the entire viewport minus the existing `Sidebar` and `TopHeader`.
  - Remove standard dashboard page headers, page padding, and card/grid page layouts for this route.
  - Use a full-height flex layout with message history and composer pinned into a usable chat experience.

- [x] Add chat thread management UI. Completed 2026-05-12. Added an in-route thread rail with active thread state, switching, create, rename, and delete controls. Files touched: `frontend/app/dashboard/chats/[id]/page.tsx`.
  - Add a sidebar panel or sheet inside the chat route for chat threads.
  - Let users switch between chat threads.
  - Let users create new threads.
  - Let users delete threads.
  - Let users rename threads.
  - Visually indicate the active thread.

- [x] Wire frontend chat services to the new multi-chat backend endpoints. Completed 2026-05-12. Added routes, service methods, response types, and active-thread navigation. Files touched: `frontend/lib/api/BackendRoutes.ts`, `frontend/lib/api/FrontendRoutes.ts`, `frontend/lib/api/services/ChatService.ts`, `frontend/lib/api/types/wellness.types.ts`, `frontend/components/app/layout/Sidebar.tsx`, `frontend/components/app/layout/TopHeader.tsx`.
  - Add API routes for listing, creating, deleting, renaming, editing, and regenerating chat threads/messages.
  - Update frontend chat types to include thread ids, titles, message indexes, and active branch data.
  - Handle loading, empty, error, and optimistic update states carefully.

- [x] Add copy actions to messages. Completed 2026-05-12. Added copy-to-clipboard actions for user and AI messages with transient copied state. Files touched: `frontend/app/dashboard/chats/[id]/page.tsx`.
  - Add a copy-to-clipboard button to user messages.
  - Add a copy-to-clipboard button to AI messages.
  - Provide a subtle copied state without disrupting the chat layout.

- [x] Add regenerate action to AI messages. Completed 2026-05-12. Added AI message regenerate action wired to backend pruning/regeneration endpoint. Files touched: `frontend/app/dashboard/chats/[id]/page.tsx`, `frontend/lib/api/services/ChatService.ts`.
  - Add a `Regenerate` button to AI messages.
  - On click, call the backend regenerate endpoint for that message index.
  - Update the UI with the pruned active branch and regenerated response.
  - Disable conflicting composer/message actions while regeneration is in progress.

- [x] Add edit action to user messages. Completed 2026-05-12. Added inline user-message editing with cancel/save behavior and branch refresh from backend. Files touched: `frontend/app/dashboard/chats/[id]/page.tsx`, `frontend/lib/api/services/ChatService.ts`.
  - Add an `Edit` button to user messages.
  - Allow inline editing of the selected user message.
  - On submit, call the backend edit endpoint with the updated text and message index.
  - Update the UI with the pruned active branch and regenerated AI response.
  - Provide cancel behavior that restores the original message without backend changes.

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
