

## AI Product Manager Assistant

A conversational AI assistant embedded into the product roadmap tool that acts as an expert product manager. It has full context of the current product's epics, stories, roadmap data, and can help with strategic decisions, story refinement, sprint planning, and roadmap analysis.

---

### What It Does

The assistant will be a chat panel accessible from the sidebar navigation. When opened, it streams responses in real-time and has awareness of the current product's data (epics, stories, quarters, modules, customers). 

Example interactions:
- "Which epics are at risk of not shipping this quarter?"
- "Suggest acceptance criteria for the RegimeDetector epic"
- "What's the story point distribution across Q2?"
- "Help me prioritize these 5 epics for the next sprint"
- "Write a stakeholder update email for Q3 progress"
- "What dependencies should I watch out for between CausalValidator and AlphaForge?"

---

### Components to Build

#### 1. New Edge Function: `pm-assistant`

A streaming edge function that:
- Receives the chat messages plus full product context (epics, stories, metadata)
- Uses a detailed system prompt that establishes the AI as an expert agile PM with financial technology domain knowledge
- Streams responses token-by-token using SSE
- Handles rate limiting (429) and credit errors (402)

#### 2. New Page: `src/pages/PMAssistantPage.tsx`

A full chat interface with:
- Message history (user and assistant messages)
- Real-time streaming with token-by-token rendering
- Markdown rendering for formatted responses (tables, lists, code blocks)
- Product context automatically injected into every request
- Quick-action suggestion chips for common PM tasks
- Clear conversation button

#### 3. Sidebar Navigation Update

- Add "PM Assistant" nav item with `MessageSquare` icon to both `Sidebar.tsx` and `MobileSidebar.tsx`
- Route: `/:productId/assistant`

#### 4. Route Registration in `App.tsx`

- Add the new route under the `/:productId` product layout

---

### Architecture

```text
User types message
       |
       v
PMAssistantPage.tsx
  - Collects current product's epics/stories
  - Builds context summary
  - Streams via fetch to edge function
       |
       v
supabase/functions/pm-assistant/index.ts
  - Receives messages + product context
  - System prompt: expert PM persona
  - Calls Lovable AI Gateway (streaming)
  - Returns SSE stream
       |
       v
Token-by-token rendering in chat UI
  - Markdown support via react-markdown
  - Auto-scroll to bottom
  - Loading indicator while streaming
```

---

### System Prompt Design

The PM assistant will have deep context:
- **Role**: Expert agile product manager specializing in financial technology
- **Context injection**: Each request will include a summary of the current product's epics (titles, quarters, story counts, modules, customers, dates)
- **Capabilities**: Sprint planning, story refinement, risk analysis, stakeholder communication, prioritization frameworks (MoSCoW, RICE), dependency analysis

---

### UI Design

The chat page will feature:
- A clean message list with user/assistant message bubbles
- A fixed input area at the bottom with send button
- Suggestion chips above the input for quick actions like:
  - "Summarize roadmap status"
  - "Identify at-risk epics"
  - "Draft sprint goals"
  - "Analyze story coverage"
- Assistant messages rendered with markdown support for rich formatting

---

### Dependencies

- **react-markdown**: New dependency needed for rendering markdown in assistant responses
- **Lovable AI Gateway**: Already configured with `LOVABLE_API_KEY`
- **Model**: `google/gemini-3-flash-preview` (default)

---

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/pm-assistant/index.ts` | Streaming edge function with PM system prompt |
| `src/pages/PMAssistantPage.tsx` | Chat interface with streaming, markdown, context injection |

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/assistant` route under product layout |
| `src/components/layout/Sidebar.tsx` | Add "PM Assistant" nav item |
| `src/components/layout/MobileSidebar.tsx` | Add "PM Assistant" nav item |
| `supabase/config.toml` | Register the new edge function |

---

### Technical Notes

- Product context (epics summary) is built client-side and sent with each message to keep the assistant aware of the current state
- Conversation history is kept in React state (not persisted to database) to keep things simple
- The streaming implementation follows the established SSE pattern with line-by-line parsing, CRLF handling, and final buffer flush
- The edge function mirrors the pattern from `generate-stories` but with streaming enabled
