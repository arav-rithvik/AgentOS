# AgentOS: task split for the judge demo site

Rule: if it is not in the demo, do not build it.

**What the judge does:** opens the page, clicks a preset task, and watches AgentOS beat a recorded computer-use baseline. No login. No free-text box. Preset tasks only.

**Acceptance test:** the judge clicks the hero task. The feed streams, the counters tick, the mock app UIs update live, the ranked doc appears, a receipt opens on click, the eval numbers show. The AgentOS side finishes in under 15 seconds.

## Decisions for today's build

- **3 mock apps:** JobBoard (5 boards), Docs, Calendar. Seeded data. Hand-modeled drivers.
- **Auth:** none. Label in the UI: "Demo accounts pre-connected. Production auth: Supabase agent OAuth."
- **Baseline:** a computer-use agent, recorded one time on the mock app pages.
- **Footer:** "Demo environment. Task scope limited to pre-connected apps."
- **Cut:** undo, fork, free text, voice, UI-shift gag, driver compiling.

## Clock (written at 2:55 PM)

| Time | Goal |
|---|---|
| 3:10 PM | Setup (S) done. Empty app is live on Vercel. |
| 3:50 PM | Arav: `/api/run` does the hero task. Rithvik: mock apps and demo page work with fake data. |
| 4:05 PM | Merged (M). The hero task runs live on the Vercel URL. |
| 4:25 PM | Baseline recorded. Eval table has real numbers. |
| 4:30 PM | **Stop building.** Fix only what breaks the demo. |
| 5:00 PM | Race video recorded and embedded. |
| 5:15 PM | **Submit.** |

If you are late, cut in this order: third preset, eval over 5 runs (use 1 run), raw-log download, second preset. Never cut the hero run, the live app UIs, or the baseline recording.

---

## The page (Rithvik builds, top to bottom)

1. **Header:** "AgentOS - the computer for agents" and the 90-second race video.
2. **3 preset buttons.**
   - Hero: "Find today's ML internships across 5 boards and write me a ranked doc."
   - Second: "Block study time for everything due this week."
   - Third: only if built.
3. **Split view, on run.**
   - LEFT: the recorded baseline, with its token and time totals.
   - RIGHT: the live AgentOS run:
     (a) action feed in plain English, one line for each typed call, a check when its receipt lands. Click a line to open the receipt JSON.
     (b) live token and time counter.
     (c) the three mock app UIs, updating live.
4. **Eval table:** each preset x both agents: tokens, wall time, steps, success rate, failures included, raw logs to download.
5. **Footer.**

---

## The contract (both of you build to this, do not change it alone)

### Tables

```
jobs(id, board, title, company, location, url, posted_at)
docs(id, run_id, title, body, created_at)
events(id, run_id, title, starts_at, duration_min, kind)
action_log(id, run_id, ts, app, action, args, receipt, tokens, latency_ms)
runs(id, preset, prompt, status, summary, steps, input_tokens, output_tokens, ms, created_at)
```

Four additions to Rithvik's list, and why:
- **`runs` table.** The token and time counter and the eval table need one row for each run.
- **`run_id` on `docs` and `events`.** Two judges can run at the same time. Each page shows only rows for its own run. A null `run_id` means seeded data.
- **`kind` on `events`.** `deadline` for seeded things that are due, `block` for study blocks the agent adds. The second preset needs things that are due, and no other app has them.
- **`board` is `a` to `e`.**

Security: row-level security is on. The browser key can only read. Only the server writes, with the service role key.

Realtime is on for `docs`, `events`, `action_log`, `runs`.

### Drivers (the manifest)

```
jobboard.jobs.list({ board, query, posted })  -> [{ id, title, company, location, url, posted, board }]
docs.create({ title, body })                  -> { id, url }
docs.list()                                   -> [{ id, title, url }]
calendar.list({ kind })                       -> [{ id, title, start, durationMin, kind }]
calendar.create({ title, start, durationMin }) -> { id }
```

Two additions, and why:
- **`board` arg on `jobs.list`.** The agent sends 5 calls at once, one for each board. This is the "5 in parallel" moment.
- **`calendar.list` and `docs.list`.** The second preset must read what is due before it adds blocks.

`posted` is `"today"` or `"any"`.

### Receipt (the `receipt` column, and what a driver returns)

```json
{ "action": "jobboard.jobs.list", "args": { "board": "a", "query": "ML intern", "posted": "today" },
  "result_id": null, "count": 5, "status": "ok",
  "started_at": "2026-10-03T22:01:04.120Z", "finished_at": "2026-10-03T22:01:04.158Z" }
```
`result_id` is the new row's id for a create. `count` is the number of rows for a list. `status` is `ok` or `error`.

### API (POST, JSON)

- `/api/run` with `{ preset: "internships" | "study" }` returns `{ runId }` **at once**, then the run goes on in the background. The page follows it with Realtime on `runs` and `action_log` where `run_id` matches.

### Pages

`/` (demo page), `/apps/jobboard`, `/apps/docs`, `/apps/calendar`. The three app UIs are also components inside the demo page. The app pages take `?run=<runId>` to show one run's rows.

### Env vars

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `ANTHROPIC_API_KEY`, `AGENTOS_MODEL` (optional).

---

## S. Setup (together, 15 minutes)

- [x] **S1. GitHub repo.** Done: `arav-rithvik/AgentOS`.
- [ ] **S2. App.** Arav: run `npx create-next-app@latest app --ts --tailwind --app --yes` in the repo. Push.
- [ ] **S3. Supabase project.** Arav: make a new project.
- [ ] **S4. Keys.** Both: make `app/.env.local` with the env vars above. Do not commit it.
- [ ] **S5. Vercel.** Rithvik: import the repo. Root directory `app`. Add the env vars. Check the URL opens.
- [ ] **S6. Folders.** Arav owns `app/lib/`, `app/app/api/`, `app/supabase/`. Rithvik owns all pages and `app/components/`.

---

## A. Arav: the computer and the agent

### A1. Tables and seed data (10 min)
- [ ] **A1.1** Write `supabase/schema.sql` with the five tables from the contract.
- [ ] **A1.2** Turn on row-level security. Add one policy for each table: anyone can read. No write policy.
- [ ] **A1.3** Seed `jobs`: 5 boards, 20+ ML internship postings with real-looking companies. About half posted today, half older. Put 5 or 6 of the same job (same company and title) on two boards, so dedupe has work to do.
- [ ] **A1.4** Seed `events`: 4 rows with `kind = 'deadline'` this week (for example "Bio lab report due"), and 2 normal events.
- [ ] **A1.5** Turn on Realtime for `docs`, `events`, `action_log`, `runs`. Run the file in the Supabase SQL editor.
- **Done when:** `select count(*) from jobs` is 20 or more.

### A2. Drivers with receipts (15 min)
- [ ] **A2.1** Write `lib/manifest.ts`: the five driver actions, with their args, as one object.
- [ ] **A2.2** Write `lib/drivers.ts`: one function `call(runId, action, args)`. It runs the correct database read or write with the service role key.
- [ ] **A2.3** Each `call` builds the receipt from the contract and inserts one `action_log` row with `latency_ms`.
- [ ] **A2.4** A create sets `run_id` on the new row.
- **Done when:** `call(runId, "jobboard.jobs.list", { board: "a", posted: "today" })` returns jobs and makes one `action_log` row.

### A3. Agent loop (20 min)
- [ ] **A3.1** Write `lib/agent.ts`. Put the manifest in the system prompt. Give Claude one tool: `call(action, args)`.
- [ ] **A3.2** Tell Claude to send independent calls in the same turn. Run those calls in parallel on the server.
- [ ] **A3.3** After each model turn, update the `runs` row: steps, input tokens, output tokens, ms. Put that turn's tokens on its `action_log` rows.
- [ ] **A3.4** At the end, set `status` to `done` and `summary` to one line (for example "23 roles on 5 boards, 17 after dedupe, ranked doc written").
- [ ] **A3.5** Write `app/api/run/route.ts`: map the preset to its prompt, insert the `runs` row, return `{ runId }` at once, and finish the run in the background.
- **Done when:** a `curl` call with `{ "preset": "internships" }` makes 5 `jobs.list` rows, 1 `docs.create` row, a ranked and deduped doc, and it takes under 15 seconds.

If it is over 15 seconds: set `AGENTOS_MODEL=claude-sonnet-5-5` and measure again.

### A4. Baseline and eval numbers (20 min, after the merge)
- [ ] **A4.1** Give the hero prompt to a computer-use agent on the live mock app pages. Record the screen.
- [ ] **A4.2** Write down: seconds, count of screenshots, and if it finished.
- [ ] **A4.3** Run each preset on AgentOS 5 times. The `runs` table has the numbers.
- [ ] **A4.4** Write `app/public/baseline.json` with the baseline numbers. Mark tokens as "estimated" if they come from the screenshot count.
- [ ] **A4.5** Give Rithvik the recording.
- **Done when:** the eval table shows real numbers for both agents.

---

## R. Rithvik: the site and the demo

Build with fake data first, in `components/fake.ts`, in the contract shapes. Give your session this file and tell it: "Build only the R tasks. Do not build the tables, drivers, agent loop or API."

### R1. Mock app UIs (20 min)
- [ ] **R1.1** JobBoard: 5 boards as tabs or columns, each with its own name and colour. A list of postings.
- [ ] **R1.2** Docs: a list of docs, and one open doc with title and body. A "New doc" form, so the baseline agent can write a doc by clicking.
- [ ] **R1.3** Calendar: a week view with events. Deadlines and study blocks look different. An "Add event" form.
- [ ] **R1.4** Each UI is a component, used inside `/` and on its own page under `/apps/`.
- [ ] **R1.5** The label: "Demo accounts pre-connected. Production auth: Supabase agent OAuth."
- **Done when:** the three UIs show fake data at the Vercel URL.

### R2. Demo page (30 min)
- [ ] **R2.1** Header with the title and a slot for the race video.
- [ ] **R2.2** The 3 preset buttons.
- [ ] **R2.3** Split view. Left: the baseline recording with its totals from `baseline.json`.
- [ ] **R2.4** Right (a): the action feed. Turn each `action_log` row into a sentence ("Searched board A", "Found 5 roles", "Wrote ranked doc"). Show a check when `receipt.status` is `ok`. Click to open the receipt JSON.
- [ ] **R2.5** Right (b): the token and time counter, from the `runs` row. The timer ticks in the browser while `status` is `running`.
- [ ] **R2.6** Right (c): the three mock app UIs, small, side by side.
- [ ] **R2.7** Footer text.
- **Done when:** the page plays a fake run from `fake.ts`.

### R3. Eval table (10 min)
- [ ] **R3.1** Rows: each preset x both agents. Columns: tokens, wall time, steps, success rate.
- [ ] **R3.2** AgentOS numbers come from the `runs` table. Baseline numbers come from `baseline.json`.
- [ ] **R3.3** A "Download raw logs" link that gives the `action_log` rows as JSON.
- **Done when:** the table shows fake numbers, marked as fake.

### R4. Video and submission (from 4:30)
- [ ] **R4.1** Record the 90-second race video. Embed it in the header.
- [ ] **R4.2** 4 to 6 screenshots.
- [ ] **R4.3** README: what it is, how to run it, what is hand-modeled.
- [ ] **R4.4** Submission page: title, description, repo URL, demo URL, demo notes.

---

## M. Merge (3:50 PM, together, 15 minutes)

- [ ] **M1.** Rithvik: replace `fake.ts` with reads from Supabase. `jobs` is read one time. `docs`, `events`, `action_log` and `runs` use Realtime, filtered by the current `runId`.
- [ ] **M2.** Rithvik: connect the preset buttons to `/api/run`.
- [ ] **M3.** Both: run the acceptance test on the Vercel URL, two times.
- [ ] **M4.** Both: run it in a private window, and in two windows at the same time.
- [ ] **M5.** Arav: make the repo public. First remove line 91 of `Supabase-Select-2026-Hackathon.md` (it has private details).
