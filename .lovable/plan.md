
# AI Workplace Productivity Assistant — Build Plan

A single-page TanStack Start app with a sidebar dashboard, 5 AI-powered productivity modules, persistent chat history in localStorage, and a Responsible AI disclaimer modal. All AI calls go through Lovable AI Gateway (no API key setup required) using Gemini 3 Flash as the default model.

## Design direction

- **Aesthetic:** Dark, MacBook Pro-inspired. Deep navy background (`#0a0e27`), elevated surfaces (`#1a1f3a` / `#242d4a`), bright cyan-blue accent (`#00d9ff`) used sparingly for active states, primary CTAs, and section accents.
- **Typography:** Inter (via `@fontsource-variable/inter`), tight tracking on headings, mono font for system-prompt code blocks.
- **Feel:** Glassy borders (`rgba(0,217,255,0.2)`), subtle glow on focused/active elements, rounded-xl cards, generous spacing, no purple gradients.
- **Motion:** Quiet — fade/slide on modal, message append animation in chatbot, shimmer on loading.

## Routes

```text
/                       → Dashboard shell (sidebar + active module)
                          Active module driven by ?feature= query param
                          (email | meetings | tasks | research | chat)
                          Default: chat
```

Single route keeps state simple; sidebar swaps the active panel.

## Layout

```text
┌──────────────┬─────────────────────────────────────────────┐
│ Sidebar      │  Active Module Panel                        │
│  Logo        │  ┌──────────────────────────────────────┐  │
│  · Chatbot   │  │  Input area (top)                    │  │
│  · Email     │  │                                      │  │
│  · Meetings  │  ├──────────────────────────────────────┤  │
│  · Tasks     │  │  Output area (editable, copy/save)   │  │
│  · Research  │  │  [View System Prompt ▾]              │  │
│  ─────────   │  └──────────────────────────────────────┘  │
│  History     │                                             │
│   chat 1     │                                             │
│   chat 2     │                                             │
│  ─────────   │                                             │
│  Saved       │                                             │
│  Responsible │                                             │
│  AI          │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

Mobile: sidebar collapses behind a hamburger using shadcn `Sheet`.

## Features

1. **Chatbot** (default landing) — streaming chat via `useChat` + `DefaultChatTransport`, message parts rendering, "View system prompt" expander, example prompt cards on empty state, persisted per-session messages in localStorage.
2. **Smart Email Generator** — context textarea + audience dropdown; generates 3 tone variations (Formal / Informal / Persuasive) in parallel, side-by-side cards, each editable + copy + save.
3. **Meeting Notes Summarizer** — paste textarea (txt/md), structured JSON output (title, key points, decisions, action items with owner/deadline). PDF upload skipped per user choice.
4. **AI Task Planner** — task input + urgency + timeframe → prioritized JSON plan with time slots, rendered as priority-coded cards + optimization tips sidebar.
5. **AI Research Assistant** — paste text + research angle → structured insights (exec summary, key insights with confidence, statistics, recommendations, follow-up questions). Paste-only.

All structured-output features use `generateText` + `Output.object` with Zod schemas on the server.

## AI backend

One server function per non-chat feature in `src/lib/ai.functions.ts` plus one streaming chat server route at `src/routes/api/chat.ts`.

- Provider: `createLovableAiGatewayProvider` helper in `src/lib/ai-gateway.server.ts`.
- Default model: `google/gemini-3-flash-preview`.
- Email generator runs 3 parallel `generateText` calls (one per tone).
- Structured features return validated JSON to the client.
- Chat route uses `streamText` + `toUIMessageStreamResponse`, system prompt mentions the 5 modules and AI-responsibility framing.
- `LOVABLE_API_KEY` provisioned via `ai_gateway--create`.

## Persistence (localStorage)

Single hook `useLocalStorage<T>` + a small `storage.ts` helper with these keys:

- `aiw.settings` — `{ disclaimerSeen, lastFeature }`
- `aiw.chat` — array of `UIMessage[]` for the chatbot (single conversation, per user's storage choice). "New conversation" button clears it.
- `aiw.saved` — saved outputs: `{ id, type, title, content, createdAt }[]`
- `aiw.drafts` — per-feature draft inputs so refresh doesn't wipe in-progress work.

History sidebar lists saved outputs grouped by type with delete/star.

## Responsible AI modal

Shown on first load (when `disclaimerSeen` is false). Lists what AI can/can't do, limitations, best practices. "I understand, proceed" + "Don't show again" checkbox. Accessible via sidebar footer link any time.

## Shared UI

- `OutputCard` — editable `contentEditable` block + Copy / Save / View Prompt actions.
- `SystemPromptViewer` — collapsible `<details>` with mono code block.
- `LoadingShimmer` — used across all features.
- Toaster (sonner) for copy/save/error feedback.
- Map AI Gateway 429 / 402 errors to friendly toasts.

## Technical details

- Stack: TanStack Start (existing), Tailwind v4, shadcn/ui, AI SDK v5, `@ai-sdk/openai-compatible`, `@ai-sdk/react` for `useChat`, Zod, sonner, lucide-react icons, `@fontsource-variable/inter`.
- New deps to install: `ai`, `@ai-sdk/openai-compatible`, `@ai-sdk/react`, `zod`, `@fontsource-variable/inter`.
- Design tokens added to `src/styles.css` (`@theme` block) — override default shadcn dark palette with the spec's exact hex values converted to oklch.
- Routes: replace `src/routes/index.tsx` placeholder with the dashboard; add `src/routes/api/chat.ts`.
- New files:
  - `src/components/dashboard/{Sidebar,DashboardShell,ResponsibleAiModal,HistoryList,SystemPromptViewer,OutputCard}.tsx`
  - `src/components/features/{Chatbot,EmailGenerator,MeetingNotes,TaskPlanner,ResearchAssistant}.tsx`
  - `src/lib/ai-gateway.server.ts` (gateway helper from knowledge)
  - `src/lib/ai.functions.ts` (4 server functions)
  - `src/lib/prompts.ts` (all system prompts, importable by both client display and server)
  - `src/lib/storage.ts` + `src/hooks/use-local-storage.ts`
  - `src/routes/api/chat.ts` (streaming chat endpoint)
- TanStack guardrails respected: no `useEffect`-based thread bootstrap (single conversation), chat textarea autofocus, message parts rendering, errors surfaced via toast.

## Out of scope for v1

- PDF / file upload (txt/md paste only, per your choice)
- Google Calendar / .ics export
- URL auto-fetch in research
- Auth, multi-device sync, multi-thread chat history
