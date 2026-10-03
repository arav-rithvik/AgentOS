# AgentOS: demo plan and task split

Rule: if it is not in the demo, do not build it.

## Clock

| Time | Goal |
|---|---|
| 2:20 PM | Setup (S) done. Empty app is live on Vercel. |
| 3:20 PM | Scene 1 works: Arav's engine alone, Rithvik's page alone with fake data. |
| 3:50 PM | Undo, fork and the denied action work. |
| 4:20 PM | Merged (M). Real data on the page. |
| 4:30 PM | **Stop building.** Fix only what breaks the demo. |
| 5:00 PM | Video recorded. |
| 5:15 PM | **Submit.** |

If you are late, cut in this order: voice (R8), Scene 4, Scene 3. Never cut Scene 1 or Scene 2.

---

## The demo (2 to 3 minutes)

One web page, three columns:

- **Left, "World":** the calendar, mail and files as cards. This is what a human sees.
- **Center, "Agent":** the prompt box, and the same world as JSON. This is what the agent sees.
- **Right, "Action log":** one row for each thing the agent changed, with a receipt and an Undo button.

| Scene | Time | What you do | What the judge sees | Feature |
|---|---|---|---|---|
| 0. Hook | 0:00-0:20 | Say: "An agent on a human computer looks at pixels. On AgentOS the world is data." | Left: a screenshot. Right: the JSON. | World as data |
| 1. Task | 0:20-1:00 | Prompt: "Sam asked to move our 1:1. Move it to tomorrow at a time with no conflicts and email him the new time." | The calendar card moves. A sent mail appears. The log shows 2 receipts with green "verified". Time and tokens show. | Receipts |
| 2. Undo | 1:00-1:25 | Click "Undo run". | The calendar and mail go back. The log rows turn grey. Say: "Agents have no cmd-Z. Now they do." | Undo |
| 3. Fork | 1:25-2:10 | Turn on "Fork x3". Run the same prompt. | Three lanes run at the same time. Each lane picks a different time. Click "Keep this one". | Fork |
| 4. Denied | 2:10-2:30 | Prompt: "Delete the roadmap file." | A red row: "permission denied". The file is still there. | Scoped identity |
| 5. Close | 2:30-2:45 | Say: "The computer for agents. Built on Supabase." | The page. | |

What is real: login, the database, the agent, each receipt, undo, fork.
What is not real: the mail and calendar are AgentOS's own demo apps, not Gmail. Say this openly.

---

## The contract (both of you build to this)

Rithvik's fake data and Arav's real data must have the same shape. Do not change this without telling the other.

**An object** (one thing in the world):
```json
{ "key": "evt_sam", "type": "event", "data": { "title": "1:1 with Sam", "start": "2026-10-03T15:00", "end": "2026-10-03T15:30", "attendees": ["sam@northwind.dev"] } }
```
Types: `event` {title, start, end, attendees}, `mail` {folder, from, to, subject, body, unread, at}, `file` {name, content}, `contact` {name, email, role}.

**An action** (one row in the log):
```json
{ "id": "...", "run_id": "...", "op": "update", "key": "evt_sam", "type": "event",
  "before": { "start": "2026-10-03T15:00" }, "after": { "start": "2026-10-04T14:00" },
  "ok": true, "verified": true, "error": null, "undone": false }
```
`op` is `create`, `update` or `delete`.

**A run** (one agent task):
```json
{ "id": "...", "world_id": "...", "label": "Plan A", "status": "done", "result": "Moved the 1:1 to 2pm tomorrow.", "steps": 3, "input_tokens": 2100, "output_tokens": 340, "ms": 6200 }
```

**The two API calls** (POST, JSON, header `Authorization: Bearer <user token>`):
- `/api/run` with `{ prompt, worldId, forks }` returns `{ runs: [...] }`. `forks` is 1 or 3.
- `/api/undo` with `{ runId }` or `{ actionId }` returns `{ undone: 2 }`.

**The database tables:** `worlds`, `objects`, `actions`, `runs`, `grants`.

---

## S. Setup (do first, together, 20 minutes)

- [ ] **S1. GitHub repo.** Arav: make a public repo named `agentos`. Add Rithvik.
- [ ] **S2. App.** Arav: run `npx create-next-app@latest app --ts --tailwind --app --yes` in the repo. Push.
- [ ] **S3. Supabase project.** Arav: make a new project. Redeem the credit code. In Authentication, Email: turn off "Confirm email".
- [ ] **S4. Keys.** Both: make `app/.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`. Do not commit this file. Share keys in person, not in chat.
- [ ] **S5. Vercel.** Rithvik: import the repo in Vercel. Set root directory to `app`. Add the same three keys. Check the empty app opens at the Vercel URL.
- [ ] **S6. Folders.** Arav owns `app/lib/`, `app/app/api/`, `app/supabase/`. Rithvik owns `app/app/page.tsx`, `app/components/`, `app/app/globals.css`. Do not edit the other person's files.

---

## A. Arav: the engine

### A1. Database (15 min)
- [ ] **A1.1** Write `supabase/schema.sql` with the five tables from the contract. Each table has a `user_id` column.
- [ ] **A1.2** Add row-level security: a user can only see rows where `user_id` is their id.
- [ ] **A1.3** Add a SQL function `reset_world()` that makes one world and fills it with demo data: 5 events, 3 mails (one from Sam asking to move the 1:1), 2 files, 4 contacts. Add grants: events and mail can be written, files and contacts are read-only.
- [ ] **A1.4** Turn on Realtime for `objects`, `actions`, `runs`, `worlds`.
- [ ] **A1.5** Paste the file in the Supabase SQL editor and run it.
- **Done when:** you call `reset_world()` in the SQL editor and see rows in `objects`.

### A2. Kernel with receipts (25 min) — Scene 1
The kernel is the one place that changes the world.
- [ ] **A2.1** Write `lib/kernel.ts` with `list`, `get`, `create`, `update`, `remove`.
- [ ] **A2.2** For each write: read the object before, do the write, read it again after.
- [ ] **A2.3** Save one row in `actions` with `before`, `after`, and `verified` (true if `after` matches what was asked).
- [ ] **A2.4** Return that receipt to the agent.
- **Done when:** one `update` call changes an event and makes one `actions` row with `verified: true`.

### A3. Agent loop (25 min) — Scene 1
- [ ] **A3.1** Write `lib/agent.ts`. Give Claude five tools that call the kernel: `list_objects`, `get_object`, `create_object`, `update_object`, `delete_object`.
- [ ] **A3.2** Put the full world as JSON in the first message. This is "the world as data".
- [ ] **A3.3** Loop until Claude stops calling tools. Add up tokens, steps and time. Save them in `runs`.
- [ ] **A3.4** Write `app/api/run/route.ts`. It reads the user token, so row-level security applies to the agent.
- **Done when:** a `curl` call to `/api/run` with the Scene 1 prompt moves the event and adds a sent mail.

### A4. Undo (15 min) — Scene 2
- [ ] **A4.1** Add `undo` to `lib/kernel.ts`. For `create`: delete the object. For `update`: put `before` back. For `delete`: insert `before` again. Then set `undone: true`.
- [ ] **A4.2** For a full run: undo its actions from newest to oldest.
- [ ] **A4.3** Write `app/api/undo/route.ts`.
- **Done when:** after Scene 1, one call to `/api/undo` puts the event back and removes the sent mail.

### A5. Fork (20 min) — Scene 3
- [ ] **A5.1** Add SQL function `fork_world(src, name)`: make a new world and copy all objects from `src`.
- [ ] **A5.2** Add SQL function `promote_world(fork)`: copy the fork's objects into the main world, then delete all forks.
- [ ] **A5.3** In `/api/run`, when `forks` is 3: make 3 forks, run 3 agents at the same time, each with a different plan (earliest, latest, least disruption).
- **Done when:** one call with `forks: 3` makes 3 worlds with 3 different times for the 1:1.

### A6. Denied action (5 min) — Scene 4
- [ ] **A6.1** In the kernel, check `grants` before each write. If not allowed, save an action with `ok: false` and `error: "permission denied"`.
- **Done when:** "Delete the roadmap file" makes one red action and the file is still there.

---

## R. Rithvik: the page and the demo

Build all of R1 to R5 with fake data first. Put the fake data in one file, `components/fake.ts`, in the contract shapes.

### R1. Page layout (15 min)
- [ ] **R1.1** One page, dark, three columns: World, Agent, Action log. A top bar with the name and a "Reset world" button.
- [ ] **R1.2** Each column scrolls by itself. The page does not scroll.
- **Done when:** the three empty columns show at the Vercel URL.

### R2. World column (20 min) — Scenes 1, 2
- [ ] **R2.1** Show events as cards, grouped by day, sorted by time.
- [ ] **R2.2** Show mail (inbox and sent), files and contacts as cards.
- [ ] **R2.3** When an object changes, flash that card for one second.
- **Done when:** changing one value in `fake.ts` moves the card and flashes it.

### R3. Agent column (20 min) — Scenes 0, 1
- [ ] **R3.1** A prompt box, a Run button, and three example prompts to click (the Scene 1 and Scene 4 prompts).
- [ ] **R3.2** A "Fork x3" switch next to Run.
- [ ] **R3.3** A panel "What the agent sees": the world as coloured JSON, with a rough token count (characters divided by 4).
- [ ] **R3.4** Run stats: status, seconds, tokens, steps, and the agent's final sentence.
- **Done when:** the JSON panel shows the fake world and the stats show a fake run.

### R4. Action log column (20 min) — Scenes 1, 2, 4
- [ ] **R4.1** One row for each action, newest first: the op, the object key, and what changed (`before` to `after`).
- [ ] **R4.2** A green tick when `verified`. A red row with the error when `ok` is false. A grey row when `undone`.
- [ ] **R4.3** An "Undo" button on each row and an "Undo run" button on each run.
- **Done when:** the fake actions show all three states.

### R5. Fork lanes (20 min) — Scene 3
- [ ] **R5.1** When forks exist, show three lanes side by side. Each lane has the plan name, the run stats, and what is different from the main world.
- [ ] **R5.2** A "Keep this one" button on each lane.
- **Done when:** three fake forks show three different times.

### R6. Login (10 min)
- [ ] **R6.1** An email and password form with Supabase Auth.
- [ ] **R6.2** A "Use demo account" button, so judges can get in with one click.
- **Done when:** the button signs in and shows the page.

### R7. Demo and submission (from 4:30)
- [ ] **R7.1** Write the words for each scene from the demo table.
- [ ] **R7.2** Record the video: MP4, under 100 MB, 2 to 3 minutes.
- [ ] **R7.3** Take 4 to 6 screenshots.
- [ ] **R7.4** Write the README: what it is, how to run it, the demo login.
- [ ] **R7.5** Fill the submission page: title, description, repo URL, demo URL, demo notes with the login.

### R8. Voice (only if there is time)
- [ ] **R8.1** A mic button that fills the prompt box with the browser's speech recognition.

---

## M. Merge (3:50 PM, together, 30 minutes)

- [ ] **M1.** Rithvik: replace `fake.ts` with real reads from Supabase (`objects`, `actions`, `runs`, `worlds`).
- [ ] **M2.** Rithvik: add Realtime, so the page updates when a row changes.
- [ ] **M3.** Rithvik: connect Run to `/api/run`, the Undo buttons to `/api/undo`, "Keep this one" to `promote_world`, "Reset world" to `reset_world`.
- [ ] **M4.** Both: run all four scenes on the Vercel URL, two times.
- [ ] **M5.** Both: sign in with the demo account in a private window. Check a judge can do Scene 1.
