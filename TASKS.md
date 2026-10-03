# AgentOS: demo plan and task split (for idea.md v3)

Rule: if it is not in the demo, do not build it.

**The one thing we show:** the pixels-vs-data race. A pixel agent and AgentOS do the same task, with time, steps and tokens on screen.

**Hero task:** "Check these 5 job boards for new ML internships posted today, dedupe them, rank them, drop the list in a doc."

## Decisions for today's build (answers to the open questions in idea.md)

- **Boards:** 5 mock job boards that we host. Not real sites. Hand-modeled drivers.
- **Driver compiling:** not built. Say "hand-modeled today, compiled by the OS next".
- **Auth:** the user signs in with Supabase Auth. The mock boards need no login. Do not claim agent-OAuth into the boards.
- **Baseline:** an existing computer-use agent, recorded once on our mock board pages. Time and steps are measured with a clock. Tokens are computed from the count of screenshots and marked "estimated".
- **Undo, fork, UI-shift gag, voice:** cut unless everything else is done by 4:10 PM.

## Clock (written at 2:50 PM)

| Time | Goal |
|---|---|
| 3:05 PM | Setup (S) done. Empty app is live on Vercel. |
| 3:40 PM | Arav: `/api/run` does the hero task. Rithvik: pages work with fake data. |
| 4:00 PM | Merged (M). The judge page runs the hero task live. |
| 4:20 PM | Baseline recorded. Numbers on the page. |
| 4:30 PM | **Stop building.** Fix only what breaks the demo. |
| 5:00 PM | Video recorded. |
| 5:15 PM | **Submit.** |

If you are late, cut in this order: eval table over 5 runs (use 1 run), receipts click-through, calendar app, free-text box. Never cut the live hero run or the baseline recording.

---

## The video (2 to 3 minutes)

| Scene | Time | What the judge sees |
|---|---|---|
| 0. Cold open | 0:00-0:20 | The pixel agent, slow, taking screenshots of a job board. A timer runs. |
| 1. The idea | 0:20-0:40 | One job board as a page, next to the same board as JSON. "No screen exists in this loop." |
| 2. The race | 0:40-1:50 | Left: the pixel agent recording, sped up. Right: AgentOS live. The log streams typed calls: 5 `jobs.list` at once, then `docs.create`. Token counters on both sides. |
| 3. The result | 1:50-2:15 | The doc opens with the ranked list. Click one log row to show its receipt. |
| 4. Close | 2:15-2:30 | "Browser agents are better tourists on the web. We're the country." |

---

## The contract (both of you build to this)

**The manifest** (what the agent reads at the start):
```json
{ "apps": {
  "board_a": { "name": "Northwind Jobs", "actions": { "jobs.list": { "args": { "query": "string?", "posted": "today|any" } } } },
  "board_b": "...same shape, 5 boards: board_a to board_e...",
  "docs":     { "actions": { "docs.list": {}, "docs.create": { "args": { "title": "string", "body": "string" } } } },
  "calendar": { "actions": { "events.list": {}, "events.create": { "args": { "title": "string", "start": "string", "end": "string" } } } }
} }
```

**An object** (one row in the `objects` table):
```json
{ "app": "board_a", "type": "job", "key": "job_a1",
  "data": { "title": "ML Research Intern", "company": "Halcyon Labs", "location": "SF", "url": "/boards/a#job_a1", "posted": "2026-10-03" } }
```
Other types: `doc` {title, body}, `event` {title, start, end}.

**An action** (one row in the log, one typed call):
```json
{ "id": "...", "run_id": "...", "call": "board_a.jobs.list", "args": { "query": "ML intern", "posted": "today" },
  "receipt": { "ok": true, "count": 4 }, "ms": 38 }
```
For `docs.create` the receipt is `{ "ok": true, "id": "doc_x1", "link": "/docs/doc_x1" }`.

**A run:**
```json
{ "id": "...", "prompt": "...", "status": "running|done|error", "result": "...", "steps": 3, "input_tokens": 2100, "output_tokens": 340, "ms": 6200 }
```
The run row is updated after each step, so the token counter can tick.

**The one API call** (POST, JSON, header `Authorization: Bearer <user token>`):
- `/api/run` with `{ prompt }` returns `{ run: {...} }`.

**Tables:** `objects`, `actions`, `runs`. Each has `user_id` and row-level security. Realtime is on for all three.

**Pages:** `/` (judge page), `/boards/a` to `/boards/e`, `/docs`, `/docs/[id]`, `/calendar`.

---

## S. Setup (together, 15 minutes)

- [x] **S1. GitHub repo.** Done: `arav-rithvik/AgentOS`.
- [ ] **S2. App.** Arav: run `npx create-next-app@latest app --ts --tailwind --app --yes` in the repo. Push.
- [ ] **S3. Supabase project.** Arav: make a new project. In Authentication, Email: turn off "Confirm email".
- [ ] **S4. Keys.** Both: make `app/.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`. Do not commit it.
- [ ] **S5. Vercel.** Rithvik: import the repo. Root directory `app`. Add the three keys. Check the URL opens.
- [ ] **S6. Folders.** Arav owns `app/lib/`, `app/app/api/`, `app/supabase/`. Rithvik owns all pages and `app/components/`.

---

## A. Arav: the engine

### A1. Database and demo data (10 min)
- [ ] **A1.1** Write `supabase/schema.sql`: tables `objects`, `actions`, `runs`, with `user_id` and row-level security.
- [ ] **A1.2** Add a SQL function `reset_world()` that fills the world for the signed-in user: 5 boards with about 6 jobs each. Some jobs are posted today, some are old. Put 3 or 4 of the same job on more than one board, so dedupe has work to do. Add 2 calendar events.
- [ ] **A1.3** Turn on Realtime for the three tables. Run the file in the Supabase SQL editor.
- **Done when:** `reset_world()` puts about 32 rows in `objects`.

### A2. Drivers and manifest (15 min)
- [ ] **A2.1** Write `lib/manifest.ts`: the manifest object from the contract.
- [ ] **A2.2** Write `lib/drivers.ts`: one function `call(app, action, args)`. `jobs.list` reads jobs for that board and filters by `query` and `posted`. `docs.create` inserts a doc. `events.list` and `events.create` do the same for the calendar.
- [ ] **A2.3** Each `call` saves one row in `actions` with the args, the receipt and the time in ms. It returns the receipt and the data.
- **Done when:** `call("board_a", "jobs.list", { posted: "today" })` returns jobs and makes one `actions` row.

### A3. Agent loop (20 min)
- [ ] **A3.1** Write `lib/agent.ts`. Put the manifest in the system prompt. Give Claude one tool: `call(app, action, args)`.
- [ ] **A3.2** Tell Claude to make independent calls in the same turn, so the 5 board queries go out at once. Run those calls in parallel on the server.
- [ ] **A3.3** Loop until Claude stops calling tools. After each step, update the `runs` row with tokens, steps and time.
- [ ] **A3.4** Write `app/api/run/route.ts`. It reads the user token, so row-level security applies to the agent.
- **Done when:** a `curl` call with the hero prompt makes 5 `jobs.list` actions, 1 `docs.create` action, and a doc with a ranked, deduped list.

### A4. Baseline and numbers (20 min, after the merge)
- [ ] **A4.1** Open the live mock board pages. Give the hero prompt to a computer-use agent. Record the screen.
- [ ] **A4.2** Write down: seconds, count of screenshots or steps, and if it finished.
- [ ] **A4.3** Run the hero prompt on AgentOS 3 times. Write down seconds, steps, tokens and success for each.
- [ ] **A4.4** Give Rithvik the numbers and the recording.
- **Done when:** the eval table has real numbers for both sides.

---

## R. Rithvik: the pages and the demo

Build with fake data first, in `components/fake.ts`, in the contract shapes.

### R1. Mock apps (20 min)
- [ ] **R1.1** `/boards/[id]`: a job board page that lists that board's jobs, with a search box. Give each of the 5 boards a different name and colour, so they look like 5 sites.
- [ ] **R1.2** `/docs` and `/docs/[id]`: a list of docs and one doc. `/docs` also has a "New doc" form, so the pixel agent can write a doc.
- [ ] **R1.3** `/calendar`: a simple list of events. Cut this first if late.
- **Done when:** each page shows fake data at the Vercel URL.

### R2. Judge page (35 min)
- [ ] **R2.1** Top: the one-liner and a slot for the race video.
- [ ] **R2.2** Playground: 3 preset tasks and a free-text box, with the hint "Try anything that fits: jobs, boards, docs." A Run button.
- [ ] **R2.3** Split screen. Left: the baseline recording, with its timer and token count. Right: the live AgentOS log, one line for each typed call, with a live token counter and timer.
- [ ] **R2.4** Click a log line to show its receipt.
- [ ] **R2.5** Bottom: the eval table. Rows: task, agent, tokens, seconds, steps, success. Mark each number as "measured" or "estimated".
- **Done when:** the page plays a fake run from `fake.ts`.

### R3. Login (10 min)
- [ ] **R3.1** A "Use demo account" button that signs in with Supabase Auth, then calls `reset_world()` if the world is empty.
- **Done when:** one click shows the judge page.

### R4. Demo and submission (from 4:30)
- [ ] **R4.1** Record the video: MP4, under 100 MB, 2 to 3 minutes, from the video table.
- [ ] **R4.2** 4 to 6 screenshots.
- [ ] **R4.3** README: what it is, how to run it, the demo login, what is hand-modeled.
- [ ] **R4.4** Submission page: title, description, repo URL, demo URL, demo notes.

---

## M. Merge (3:40 PM, together, 20 minutes)

- [ ] **M1.** Rithvik: replace `fake.ts` with reads from Supabase (`objects`, `actions`, `runs`) and add Realtime on `actions` and `runs`.
- [ ] **M2.** Rithvik: connect Run to `/api/run`.
- [ ] **M3.** Both: run the hero task on the Vercel URL, two times.
- [ ] **M4.** Both: open a private window, use the demo account, run a preset. A judge must be able to do this.
- [ ] **M5.** Arav: make the repo public. First remove line 91 of `Supabase-Select-2026-Hackathon.md` (it has private details).
