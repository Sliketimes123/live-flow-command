# Product Requirements Document — Moderation Console

**Product:** Moderation Console  
**Platform:** Web (SPA)  
**Version:** 1.0  
**Date:** 2026-04-21  
**Status:** Draft

---

## 1. Overview

Moderation Console is a professional browser-based control panel for live-streaming events. It gives a single operator — a broadcast engineer or content moderator — unified control over stream lifecycle management and real-time audience interaction from one screen. The product is built to integrate with the Slike RTMP streaming infrastructure and is targeted at media organisations running live events such as press conferences, summits, and news broadcasts.

The current codebase is a high-fidelity UI prototype. All data is mock/hardcoded. This PRD defines requirements to bring it to a production-ready state.

---

## 2. Problem Statement

Live events require two roles to operate simultaneously: a **stream engineer** who monitors ingest/output health and controls the broadcast, and a **content moderator** who manages audience chat, questions, and disruptive users. Today these responsibilities are split across separate tools — a streaming dashboard and a manual moderation workflow — forcing operators to context-switch constantly and increasing the risk of missed incidents.

Moderation Console solves this by collapsing both responsibilities into a single, low-latency control surface.

---

## 3. Goals

- Give one operator complete visibility and control over a live stream from a single browser tab.
- Reduce moderation response time by keeping chat, Q&A, and user management one click away at all times.
- Provide real-time stream health telemetry so operators can catch and respond to ingest or output degradation before viewers notice.
- Support multi-moderator collaboration on large events without requiring custom infrastructure beyond Slike's existing backend.

## 4. Non-Goals

- Mobile or tablet layout (desktop-first; mobile breakpoints are an enhancement, not a launch requirement).
- Viewer-facing UI — this product is operator-only.
- Self-serve event creation or account management.
- Standalone chat/Q&A SDK (this is a control panel, not an embeddable widget).
- VOD or replay management.

---

## 5. Users

### Primary — Live Event Operator
A broadcast engineer or editorial producer who runs live-streaming events for a media organisation. Technically proficient, works under time pressure, needs immediate feedback on every action. Runs one event at a time per session.

### Secondary — Content Moderator
An editorial team member focused exclusively on audience interaction (chat, Q&A). May not have technical streaming knowledge. Needs a clean, scannable feed and one-click moderation actions.

### Tertiary — Platform Administrator
Sets up events, provisions stream keys, manages moderator access. Not present in the live session UI; interacts via separate admin tooling that feeds configuration into this dashboard.

---

## 6. Feature Requirements

### 6.1 Stream Lifecycle Control

| # | Requirement | Priority |
|---|-------------|----------|
| SL-1 | Operator can start, pause, resume, and stop a live stream via a single dropdown | P0 |
| SL-2 | Stream state transitions call the Slike API and reflect confirmed state (not optimistic only) | P0 |
| SL-3 | "End Event" action requires a two-step confirmation dialog and calls a separate API endpoint | P0 |
| SL-4 | Recording can be started and stopped independently of the live stream | P1 |
| SL-5 | All state transitions trigger a timestamped entry in the Event Logs | P1 |
| SL-6 | Elapsed timer reflects actual stream start time from the server, not the client clock | P1 |

### 6.2 Stream Health Monitoring

| # | Requirement | Priority |
|---|-------------|----------|
| SH-1 | Input health panel polls Slike's stream metrics API every 5 seconds and displays: bitrate (kbps), FPS, resolution, and connection health | P0 |
| SH-2 | Output health panel displays adaptive bitrate rungs (1080p / 720p / 480p), encryption status, and per-rung availability | P0 |
| SH-3 | Health status indicators use three states: Healthy (green), Degraded (amber), Critical (red) | P0 |
| SH-4 | Critical health state triggers a non-blocking toast alert visible across all tabs | P0 |
| SH-5 | Operators can toggle between Input and Output views without losing scroll position in other panels | P2 |

### 6.3 Real-Time Chat Moderation

| # | Requirement | Priority |
|---|-------------|----------|
| CM-1 | Public chat feed receives messages over a WebSocket/SSE connection with sub-500 ms latency | P0 |
| CM-2 | Messages display username, timestamp, and message text | P0 |
| CM-3 | Operators can hide, delete, copy, or star any message with a single click; each action is immediately reflected in the viewer feed | P0 |
| CM-4 | Blocking a user requires a confirmation dialog; blocked users' messages are dimmed and labelled; block is persisted server-side | P0 |
| CM-5 | Starred/selected messages are pinned to the top of the moderation feed | P1 |
| CM-6 | Auto-scroll toggle persists per-tab across tab switches within a session | P1 |
| CM-7 | Search/filter bar filters the visible list in real time without interrupting the live feed | P1 |
| CM-8 | Studio (internal) chat is a separate channel visible only to operators; messages never appear in the viewer feed | P1 |
| CM-9 | Private DM view shows a sidebar of all chat participants and opens a 1:1 thread with any user; operator messages are sent as "Admin" | P2 |

### 6.4 Q&A Management

| # | Requirement | Priority |
|---|-------------|----------|
| QA-1 | Incoming questions arrive in the Queue tab in real time | P0 |
| QA-2 | Operators can move questions between Queue, Selected, and Skipped states; transitions are reflected server-side | P0 |
| QA-3 | A question can be assigned to a named moderator from a searchable participant list | P1 |
| QA-4 | Each state transition triggers a toast notification | P1 |
| QA-5 | Questions in Selected state are surfaced as "on-deck" for the host (future integration hook) | P2 |

### 6.5 Social Publishing

| # | Requirement | Priority |
|---|-------------|----------|
| SP-1 | Operators can view configured social destinations (YouTube, Facebook channels) and their current publishing status | P1 |
| SP-2 | Operators can toggle auto-publish per destination | P1 |
| SP-3 | "Unpublish All" stops all active social streams with a single action after confirmation | P1 |
| SP-4 | Adding a new destination is out of scope for the live session; destinations are preconfigured at event setup | P2 |

### 6.6 Event Configuration (Info / Settings)

| # | Requirement | Priority |
|---|-------------|----------|
| EC-1 | Event details (title, description, thumbnail, date/time) are read-only in the live session and fetched from the Slike API on load | P0 |
| EC-2 | RTMP URL and Stream Key are shown; stream key is masked by default with a toggle to reveal; both are copyable | P0 |
| EC-3 | Feature toggles (Comments, Reactions, Q&A, Audience Count, etc.) call the Slike API when changed and reflect confirmed server state | P1 |
| EC-4 | "Reset Stream" action calls a dedicated API endpoint after a two-step confirmation; this is a destructive action | P1 |

### 6.7 Viewer Metrics

| # | Requirement | Priority |
|---|-------------|----------|
| VM-1 | Concurrent viewer count is polled every 10 seconds from the Slike API and displayed in the header | P1 |
| VM-2 | Total attendee count (cumulative unique joins) is displayed alongside concurrent viewers | P1 |
| VM-3 | Active Moderators list is derived from real session presence data | P2 |

### 6.8 Authentication & Access Control

| # | Requirement | Priority |
|---|-------------|----------|
| AC-1 | Operators must authenticate before accessing the dashboard (SSO or token-based, TBD per Slike's auth system) | P0 |
| AC-2 | Session token is refreshed silently; operators are never kicked mid-event without warning | P0 |
| AC-3 | Role-based access: "Operator" has full controls; "Moderator" role hides stream lifecycle controls but retains all chat/Q&A actions | P1 |

---

## 7. Technical Requirements

### 7.1 Real-Time Data
- Chat and Q&A must use WebSocket or Server-Sent Events; polling is not acceptable for the message feed.
- Health metrics and viewer counts may use polling (5–10 s intervals).
- All writes (block, hide, delete, state transition) must be acknowledged by the server before the UI reflects the final state.

### 7.2 Latency
- UI actions (block, hide, delete) must complete the server round-trip and update the UI in under 1 second on a standard broadband connection.
- WebSocket reconnection must be automatic with exponential back-off; the operator must see a visible "reconnecting" indicator if the connection drops for more than 2 seconds.

### 7.3 Reliability
- The app must continue to function (read-only mode) if the WebSocket drops; a banner should indicate degraded state.
- No action that could affect the live broadcast (start/stop/end) may proceed without a confirmed server response.

### 7.4 Browser Support
- Chrome 120+, Edge 120+, Safari 17+ (desktop only).

### 7.5 State Management
- TanStack Query (already installed) should be used for all server state: fetching event details, health metrics, participant lists, and social channel status.
- WebSocket message feeds should be managed via a dedicated hook with connection lifecycle handling.

### 7.6 Error Handling
- All API failures must surface a descriptive toast notification.
- Destructive actions (End Event, Reset Stream, Block User) must fall back gracefully if the API call fails — the UI must not update until success is confirmed.

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Time to moderate an offensive message (see → act) | < 5 seconds |
| Stream health degradation notice latency | < 10 seconds from ingest drop |
| Operator task completion rate (end-to-end event run) | > 95% without support intervention |
| WebSocket uptime during a 2-hour event | > 99.5% |
| Page load time (logged-in, active event) | < 2 seconds on 10 Mbps connection |

---

## 9. Out of Scope (v1.0)

- Viewer-facing embeds or widgets.
- Clip creation or highlight tagging.
- Automated moderation (AI-based message filtering).
- Multi-event switching without a page reload.
- Offline/PWA mode.
- Analytics dashboard or post-event reports (EventSummary component deferred to v1.1).

---

## 10. Open Questions

1. **Auth system** — Does Slike provide an OAuth/SSO endpoint, or does this app implement its own credential flow?
2. **WebSocket protocol** — Does Slike expose a chat/events WebSocket directly, or does this app need a relay server?
3. **Role provisioning** — How are Operator vs. Moderator roles assigned? At event creation or at login?
4. **Social publishing API** — Are YouTube/Facebook integrations managed through Slike's backend or direct OAuth to each platform?
5. **Blocked user scope** — Is a block scoped to a single event or to the user's account across all events?
6. **Multi-moderator concurrency** — If two operators act on the same message simultaneously, what is the conflict resolution strategy?

---

## 11. Milestones

| Milestone | Scope | Target |
|-----------|-------|--------|
| M1 — Backend integration foundation | Auth, TanStack Query wiring, Slike API client, event data fetch on load | TBD |
| M2 — Real-time chat | WebSocket connection, live message feed, block/hide/delete writes | TBD |
| M3 — Stream controls | Start/pause/stop/end API calls, health metric polling | TBD |
| M4 — Q&A and social | Q&A state transitions, social publishing toggles | TBD |
| M5 — Roles & hardening | RBAC, reconnect handling, error states, browser testing | TBD |
| v1.0 Launch | All P0 and P1 requirements verified end-to-end | TBD |
