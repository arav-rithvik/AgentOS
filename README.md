# AgentOS: the operating system for AGI

**Live demo:** https://agentsos.vercel.app · Built in one day at **Supabase Select 2026** (YC HQ, San Francisco) by Rithvik Burki and Arav Dharnikota.

Every computer ever built was designed for a human. Screens, buttons, mice. So when we gave AI agents jobs, we handed them a video feed of a GUI and wished them luck. Today's browser agents burn tens of thousands of tokens staring at pixels and fighting cookie banners to do what one function call does in milliseconds.

We think that's the wrong interface. Everyone is handing off increasingly more and more work to agents every day. In the past few months, the release of grokbot, muse, instinct, and dots marked the shift from viewing agents as a chatbot to seeing them as teammates - the next step toward AGI. They needed their own computers to be fully autonomous. Despite all the advancements however, these agentic teammates are still trapped in an OS that is foreign to them, limiting their potential to work.

Every agent we interviewed had one common problem: the world they currently live in serves them pixels rather than data. Thats why we built an OS for them...

AgentOS is an operating system built for agents instead of humans. Apps don't render pixels; they publish a manifest, a public menu of typed actions like jobs.search and calendar.book, the same way websites publish robots.txt. Agents connect once, get a scoped identity, and work through direct calls. Every action returns a receipt: attributable, auditable, reversible.

How did we prove it? A race, of course. Same task, same site: Grok Bot against Sonnet 5.5 on AgentOS. 8 minutes against 9 seconds. The results spoke for themselves.

---

## What AgentOS is

AgentOS is an operating system where the user is an agent.

| Human OS | AgentOS |
| --- | --- |
| Apps draw windows | Apps publish a **manifest**: a public menu of typed actions (`jobboard.jobs.list`, `calendar.create`, `salon.book`) |
| You click and read the screen | The agent makes a **system call**: `call({ action, args })` |
| Nothing records what you did | Every call returns a **receipt** and is written as a row |
| The screen is the state | The state is **Postgres**: the agent reads the whole world in one query |

The agent never sees a screen. It reads the manifest once, then calls actions directly.

## The race

Same task, same apps. A screen-reading agent against Claude Sonnet 5.5 running on AgentOS:

> *Open all 5 job boards, pull every ML internship posted today, merge the ones listed on more than one board, rank the rest for hands-on ML research, and write a new doc with each role's link and every board it's on, and make sure it's saved to my Drive.*

| | Screen-reading agent | AgentOS |
| --- | --- | --- |
| How it works | Screenshots, clicks, scrolling across 5 sites | 5× `jobboard.jobs.list` + 1× `docs.create` |
| Time | Minutes (see the demo video) | **~10 s** (measured: 9,964 ms) |
| Tokens | Tens of thousands per screenshot loop | **14,227** (measured) |
| Screenshots | Every step | **0** |

The AgentOS numbers on the live site are not hard-coded. They come straight from the `runs` and `action_log` rows of the run you just started.

## Try it

1. Open https://agentsos.vercel.app.
2. Press **Send ↑**. The task is already written.
3. **Right panel ("Your agent's operating system"):** every system call streams in as it happens, in the engine's real wire format.
4. **Left panel ("Your computer"):** a Mac replica with demo copies of Docs, Mail and Calendar. When the run ends, a notification opens the new doc so you can check the result yourself.

The computer is a replica with demo apps, because a public demo can't sign in to your real accounts.

### Race pages for screen agents

These are full standalone websites, so a GUI agent (e.g. Grok Bot) can do the same kind of task the slow way:

- https://agentsos.vercel.app/web/cuts : **Fade & Co.** barbershop. Pick a service, barber, day and time slot, then book.
- https://agentsos.vercel.app/web/calendar : a Google-Calendar-style week view. Create events, move between weeks.

Bookings and events persist across both pages in the same browser. Add `?reset=1` to clear them.

## How it works

```
 user task
    │
    ▼
 Claude (Sonnet 5.5) ──reads──▶ manifest (lib/manifest.ts): apps + typed actions
    │
    │  call({ action, args })              one tool, every action
    ▼
 drivers (lib/drivers.ts) ──▶ Supabase Postgres (the world)
    │                              │
    │  { receipt, data }           ├─ action_log row per call (args, receipt, latency)
    ▼                              └─ runs row (status, tokens, ms)
 next call … done                            │
                                             ▼
                              the web page streams the run live
```

- **One tool.** The model gets a single tool, `call({ action, args })`. Every app action goes through it ([`app/lib/agent.ts`](app/lib/agent.ts)).
- **Manifest.** Each app declares its actions with typed args and return shapes ([`app/lib/manifest.ts`](app/lib/manifest.ts)). Available today: `jobboard.jobs.list`, `docs.create`, `docs.list`, `calendar.list`, `calendar.create`, `flights.search`, `flights.book`, `salon.slots.list`, `salon.book`, `concerts.search`, `concerts.book`.
- **Drivers.** Each action is a typed function over Postgres ([`app/lib/drivers.ts`](app/lib/drivers.ts)). It returns `{ receipt, data }`: the receipt says what happened (status, count, ids), the data is what the agent needs next.
- **Run API.** `POST /api/run` creates a run and starts the agent in the background (`after()`), returning a `runId`. `GET /api/run/[id]` returns the run, its actions, and every doc, event and booking it created. The page polls it every 500 ms.

## How we use Supabase

AgentOS is one Supabase project. The schema is in [`app/supabase/schema.sql`](app/supabase/schema.sql).

| Supabase feature | What AgentOS does with it |
| --- | --- |
| **Postgres** | The agent's whole world is tables: `jobs_seed` (5 job boards), `docs`, `events`, `flights_seed`, `salon_slots_seed`, `concerts_seed`, `bookings`. |
| **Postgres functions** | `ensure_fresh_events()` rebuilds seed dates relative to today, so "posted today" is always true. |
| **`runs` + `action_log`** | Every system call is a row with its args, receipt and latency. Every run records tokens and milliseconds. This is the audit trail, and the source of every number on the site. |
| **Row Level Security** | On for every table. The public key can only `select`. Only the server, with the service role key, writes. Nothing in the browser can change the agent's world. |
| **Realtime** | `docs`, `events`, `runs`, `action_log` and `bookings` are in the `supabase_realtime` publication, so any screen can subscribe to an agent while it works. |

**Next, with what Supabase launched at Select:**
- **Your App's MCP Server:** agents act for a signed-in user, with RLS deciding exactly what they may touch. AgentOS would mount your real apps as data, scoped to you.
- **Supabase Compute:** agent sandboxes beside the database. Since the whole OS is one Supabase project, giving a new agent its own computer means creating a new project.

## What we built at the hackathon

- The AgentOS engine: manifest, one-tool agent loop, drivers, receipts, run API.
- The Supabase schema: world tables, run log, RLS, Realtime publication, date-refresh function.
- Five seeded job boards (Launchpad, InternLoop, ResearchHire, CampusGrid, Stackwise Jobs), plus flights, a barbershop and concerts.
- The live demo site: one-prompt runner, live system-call stream, a Mac replica with drawn Docs / Mail / Calendar that update from the agent's writes, a completion notification, and a comparison panel fed by the run's real numbers.
- Two standalone race sites (`/web/cuts`, `/web/calendar`) that GUI agents can use.

## What's not built yet

We keep this honest:
- **Real accounts.** OAuth into your actual Gmail / Google Calendar / Drive isn't set up yet. The demo runs on Supabase-backed copies of those apps.
- **Third-party manifests.** Today the manifest is ours. The goal is for any app to publish one, like `robots.txt`.
- **Benchmarks for other agents.** The comparison boxes for other agents show "—" until the measurements are in.

## Run it locally

```bash
cd app
cp .env.example .env.local   # fill in the values below
npm install
npm run dev                  # http://localhost:3000
```

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (read-only under RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used by the drivers and run API |
| `ANTHROPIC_API_KEY` | Claude API key |
| `AGENTOS_MODEL` | Optional, e.g. `claude-sonnet-5-5` (default `claude-opus-5-5`) |

Set up the database by running [`app/supabase/schema.sql`](app/supabase/schema.sql) in the Supabase SQL editor.

Start a run from the command line (with the dev server running):

```bash
cd app && node --env-file=.env.local test-run.mjs internships
```

## Repo layout

```
app/
  app/
    page.tsx              landing page + demo
    api/run/route.ts      POST: start a run
    api/run/[id]/route.ts GET: run state (polled by the page)
    api/seed/route.ts     GET: seeded calendar events
    web/[site]/           standalone race sites (/web/cuts, /web/calendar, …)
  lib/
    agent.ts              the agent loop (one tool: call)
    manifest.ts           apps + typed actions
    drivers.ts            action → Postgres
    presets.ts            demo tasks
  components/
    Playground.tsx        prompt + live run + computer
    AgentView.tsx         system-call stream
    mac/                  Mac replica
    web/Sites.tsx         drawn Docs / Mail / Calendar / Fade & Co.
    SupabaseSection.tsx   "Runs on Supabase"
  supabase/schema.sql     the whole OS, as a schema
```

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · Supabase (Postgres, RLS, Realtime) · Claude Sonnet 5.5 via the Anthropic Messages API · Vercel.

## Team

- **Arav Dharnikota:** engine, drivers, manifest, Supabase schema.
- **Rithvik Burki:** demo site, live run view, Mac replica, race sites.
