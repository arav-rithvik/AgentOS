# AgentOS: demo plan and task split

Rule: if it is not in the demo, do not build it.

**The one thing we show:** on AgentOS the world is queryable data, not pixels. An agent reads and changes it directly.

Not in this build: undo, fork, scoped identity. They are on the roadmap only (see `idea.md`).

## Clock

| Time | Goal |
|---|---|
| 2:35 PM | Setup (S) done. Empty app is live on Vercel. |
| 3:30 PM | Arav's engine works alone. Rithvik's page works alone with fake data. |
| 4:00 PM | Merged (M). Real data on the page. Scenes 1 and 2 work. |
| 4:20 PM | Baseline recorded and the numbers are on the page (Scene 3). |
| 4:30 PM | **Stop building.** Fix only what breaks the demo. |
| 5:00 PM | Video recorded. |
| 5:15 PM | **Submit.** |

If you are late, cut in this order: voice (R8), Scene 1. Never cut Scene 2 or Scene 3.

---

## The demo (2 to 3 minutes)

One web page, three columns:

- **Left, "World":** the calendar, mail and files as cards. This is what a human sees.
- **Center, "Agent":** the prompt box, and the same world as JSON. This is what the agent sees.
- **Right, "Activity":** each query the agent ran and each change it made.

| Scene | Time | What you do | What the judge sees |
|---|---|---|---|
| 0. Hook | 0:00-0:20 | Say: "Every agent today feels around a dark room by touching pixels. AgentOS turns the lights on." | Left: a screenshot of a desktop. Right: the same world as JSON, with its token count. |
| 1. Ask | 0:20-0:50 | Prompt: "What is on my calendar tomorrow, and which emails need a reply?" | The Activity column shows 2 queries. The answer comes back in seconds. Time and tokens show. |
| 2. Act | 0:50-1:30 | Prompt: "Sam asked to move our 1:1. Move it to tomorrow at a time with no conflicts and email him the new time." | The calendar card moves. A sent mail appears. The Activity column shows each change, with the old and new value. |
| 3. Race | 1:30-2:20 | Play the recording of a pixel agent doing the Scene 2 task on the same page, sped up, with a timer. | Two bars: time and steps for the pixel agent against AgentOS. AgentOS tokens show as measured. |
| 4. Close | 2:20-2:40 | Say: "The computer for agents. Built on Supabase." | The page. |

What is real: login, the database, the agent, each query and each change.
What is not real: the mail and calendar are AgentOS's own demo apps, not Gmail. Say this openly.

**Scene 3 must use measured numbers.** Time the pixel agent with a clock. Count its steps. Do not make up a token number for it.

---

## The contract (both of you build to this)

Rithvik's fake data and Arav's real data must have the same shape. Do not change this without telling the other.

**An object** (one thing in the world):
```json
{ "key": "evt_sam", "type": "event", "data": { "title": "1:1 with Sam", "start": "2026-10-03T15:00", "end": "2026-10-03T15:30", "attendees": ["sam@northwind.dev"] } }
```
Types: `event` {title, start, end, attendees}, `mail` {folder, from, to, subject, body, unread, at}, `file` {name, content}, `contact` {name, email, role}.

**An activity row** (one thing the agent did):
```json
{ "id": "...", "run_id": "...", "op": "update", "key": "evt_sam", "type": "event",
  "query": null,
  "before": { "start": "2026-10-03T15:00" }, "after": { "start": "2026-10-04T14:00" },
  "ok": true, "error": null }
```
`op` is `query`, `create`, `update` or `delete`. For a `query`, the `query` field has the filter (for example `{ "type": "event", "where": { "start": "2026-10-04" } }`) and `after` has `{ "count": 3 }`.

**A run** (one agent task):
```json
{ "id": "...", "status": "done", "result": "Moved the 1:1 to 2pm tomorrow.", "steps": 3, "input_tokens": 2100, "output_tokens": 340, "ms": 6200 }
```

**The one API call** (POST, JSON, header `Authorization: Bearer <user token>`):
- `/api/run` with `{ prompt, worldId }` returns `{ run: {...} }`.

**The database tables:** `worlds`, `objects`, `actions`, `runs`.

---

## S. Setup (do first, together, 20 minutes)

- [x] **S1. GitHub repo.** Done: `arav-rithvik/AgentOS`.
- [ ] **S2. App.** Arav: run `npx create-next-app@latest app --ts --tailwind --app --yes` in the repo. Push.
- [ ] **S3. Supabase project.** Arav: make a new project. Redeem the credit code. In Authentication, Email: turn off "Confirm email".
- [ ] **S4. Keys.** Both: make `app/.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`. Do not commit this file. Share keys in person, not in chat.
- [ ] **S5. Vercel.** Rithvik: import the repo in Vercel. Set root directory to `app`. Add the same three keys. Check the empty app opens at the Vercel URL.
- [ ] **S6. Folders.** Arav owns `app/lib/`, `app/app/api/`, `app/supabase/`. Rithvik owns `app/app/page.tsx`, `app/components/`, `app/app/globals.css`. Do not edit the other person's files.

---

## A. Arav: the engine

### A1. Database (15 min)
- [ ] **A1.1** Write `supabase/schema.sql` with the four tables from the contract. Each table has a `user_id` column.
- [ ] **A1.2** Add row-level security: a user can only see rows where `user_id` is their id.
- [ ] **A1.3** Add a SQL function `reset_world()` that makes one world and fills it with demo data: 5 events, 3 mails (one from Sam asking to move the 1:1), 2 files, 4 contacts.
- [ ] **A1.4** Turn on Realtime for `objects`, `actions`, `runs`.
- [ ] **A1.5** Paste the file in the Supabase SQL editor and run it.
- **Done when:** you call `reset_world()` in the SQL editor and see rows in `objects`.

### A2. Kernel (25 min) — Scenes 1, 2
The kernel is the one place that reads and changes the world.
- [ ] **A2.1** Write `lib/kernel.ts` with `query`, `get`, `create`, `update`, `remove`.
- [ ] **A2.2** `query(type, where)` filters objects by type and by field values. This is the "queryable data".
- [ ] **A2.3** Each call saves one row in `actions`: the op, the key, and `before` and `after` for a change.
- **Done when:** one `query` call returns tomorrow's events, and one `update` call changes an event and makes one `actions` row.

### A3. Agent loop (30 min) — Scenes 1, 2
- [ ] **A3.1** Write `lib/agent.ts`. Give Claude five tools that call the kernel: `query_objects`, `get_object`, `create_object`, `update_object`, `delete_object`.
- [ ] **A3.2** Tell Claude the object types and fields in the system prompt, so it can query without looking first.
- [ ] **A3.3** Loop until Claude stops calling tools. Add up tokens, steps and time. Save them in `runs`.
- [ ] **A3.4** Write `app/api/run/route.ts`. It reads the user token, so row-level security applies to the agent.
- **Done when:** a `curl` call to `/api/run` with the Scene 1 prompt gives the correct answer, and the Scene 2 prompt moves the event and adds a sent mail.

### A4. The baseline for Scene 3 (20 min, after the merge)
- [ ] **A4.1** Open the live page in a browser. Use a computer-use agent (Grok Bot, or Claude in Chrome) with the Scene 2 prompt. It must do the task by clicking the page.
- [ ] **A4.2** Record the screen. Time it with a clock. Count its steps.
- [ ] **A4.3** Run the same prompt on AgentOS three times. Write down time, steps and tokens for each run.
- [ ] **A4.4** Give Rithvik the numbers for the compare bars.
- **Done when:** you have a recording and one row of numbers for each side.

Note: for A4.1 the World column needs working edit controls (see R2.4), or the pixel agent has nothing to click.

---

## R. Rithvik: the page and the demo

Build R1 to R5 with fake data first. Put the fake data in one file, `components/fake.ts`, in the contract shapes.

### R1. Page layout (15 min)
- [ ] **R1.1** One page, dark, three columns: World, Agent, Activity. A top bar with the name and a "Reset world" button.
- [ ] **R1.2** Each column scrolls by itself. The page does not scroll.
- **Done when:** the three empty columns show at the Vercel URL.

### R2. World column (25 min) — Scenes 0, 2, 3
- [ ] **R2.1** Show events as cards, grouped by day, sorted by time.
- [ ] **R2.2** Show mail (inbox and sent), files and contacts as cards.
- [ ] **R2.3** When an object changes, flash that card for one second.
- [ ] **R2.4** Add simple human controls: click an event to edit its time, and a "Compose" form to send a mail. The pixel agent in Scene 3 uses these.
- **Done when:** changing one value in `fake.ts` moves the card and flashes it.

### R3. Agent column (25 min) — Scenes 0, 1, 2
- [ ] **R3.1** A prompt box, a Run button, and the two example prompts to click (Scene 1 and Scene 2).
- [ ] **R3.2** A panel "What the agent sees": the world as coloured JSON, with a rough token count (characters divided by 4).
- [ ] **R3.3** Run stats: status, seconds, tokens, steps, and the agent's answer.
- **Done when:** the JSON panel shows the fake world and the stats show a fake run.

### R4. Activity column (15 min) — Scenes 1, 2
- [ ] **R4.1** One row for each activity, newest first.
- [ ] **R4.2** For a `query`: show the filter and the count. For a change: show the key and what changed (`before` to `after`).
- [ ] **R4.3** A red row with the error when `ok` is false.
- **Done when:** the fake rows show a query, an update and a create.

### R5. Compare panel (15 min) — Scenes 0, 3
- [ ] **R5.1** A panel "Pixels vs data": two bars for time and two bars for steps. Read the numbers from one small object, so Arav's measured numbers go in fast.
- [ ] **R5.2** Next to it: a screenshot image with its token cost, against the JSON with its token count.
- **Done when:** the bars show placeholder numbers that are clearly marked as placeholders.

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

## M. Merge (3:30 PM, together, 30 minutes)

- [ ] **M1.** Rithvik: replace `fake.ts` with real reads from Supabase (`objects`, `actions`, `runs`).
- [ ] **M2.** Rithvik: add Realtime, so the page updates when a row changes.
- [ ] **M3.** Rithvik: connect Run to `/api/run`, "Reset world" to `reset_world`, and the R2.4 edit controls to Supabase writes.
- [ ] **M4.** Both: run Scenes 1 and 2 on the Vercel URL, two times.
- [ ] **M5.** Both: sign in with the demo account in a private window. Check a judge can do Scene 2.
