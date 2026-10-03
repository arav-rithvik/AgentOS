# AgentOS: where we are, and what's next (Sat Oct 3, ~4:45 PM)

**One line:** AgentOS is the computer for agents. It is an operating system, not an agent. The agent's tool calls are its system calls, and the agent never looks at a screen.

**Live:** https://agentsos.vercel.app (keep this URL)
**Branch:** `rithvik/ui`. Everything from the judge site is here, on top of Arav's engine from `main`.

---

## What the judge sees

1. **Left, "Your computer":** a copy of Rithvik's Mac with only Chrome in the dock.
   - The first tab is AgentOS (agentsos.vercel.app). The judge types a task there, or picks a preset.
   - The other tabs are Mail, Calendar, and Fade & Co.
2. **Right, "Your agent's computer":** no screen and no chat.
   - Only the system calls, in the engine's real wire format: `call {"action","args"}` then `→ {status, count, result_id, data}`.
   - It ends with `✓ done · N calls · Xs · tokens · 0 screenshots`.
3. **Proof:** the judge does not have to trust the agent.
   - They open Fade & Co., sign in (the details are already filled in), and go to Appointments. The booking is there.
   - Calendar shows the new events.
4. **Below that:** the "Agent Testimonies" marquee. These are real replies from Grok, Instinct, Dots, and Claude.
   - The comparison boxes and the preview eval table were removed on purpose. We had no measured numbers, so we show none.

## How it works (the short version)

- **Engine (Arav):** `lib/agent.ts`, `lib/drivers.ts`, `lib/manifest.ts`, and `app/api/run`.
  - The model gets ONE tool, `call({action, args})`.
  - Each call returns `{receipt, data}` and is written to `action_log`.
- **Live view (Rithvik):** `components/useRun.ts`.
  - It POSTs `/api/run`, then subscribes to Supabase Realtime for `action_log`, `runs`, `events`, `docs`, and `bookings`, filtered by `run_id`.
  - With no Supabase keys, it plays a scripted offline run that uses the same action names, so the page never shows an empty state.
- **Real Chrome (optional):** `app/api/browser/*`.
  - A Steel cloud browser is streamed into the drawn Chrome window. With no `STEEL_API_KEY`, it falls back to the drawn sites.
- **Verified locally:** a real weekend run.
  - It finished `done` in 15.8s, with 10 system calls, all ok.
  - Token count: 13,945 in / 1,364 out.
  - Calls: salon, concerts, and flights search + book, then 3× calendar.create.

## Vercel env (production)

These are set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `AGENTOS_MODEL=claude-sonnet-5-5`, and `STEEL_API_KEY`.

Never commit keys. They live only in `app/.env.local` and in Vercel.

---

## Arav: what would help most (in this order)

These are suggestions. If your agent sees a better order or a better fix, do that. You know the engine better than we do. The only hard rules are in the box at the bottom.

1. **Run the hero task on prod once and watch it end to end.** This is the demo, and it matters most.
   - Go to agentsos.vercel.app, then the AgentOS tab, then pick the Weekend plan.
   - The right panel should stream calls, then show `✓ done`.
   - Then open Fade & Co., sign in, and check that Appointments shows the booking.
   - If anything breaks, fix the engine side first.
2. **Bookings → Fade & Co.** Make sure `salon.book` writes a `bookings` row that the site can show: barber, time, service, and price.
   - The site turns that row into the confirmation card under Appointments (see the `bookings` handler in `components/useRun.ts`).
   - If the shape doesn't match, change whichever side is simpler.
3. **The job board names don't match.**
   - The engine seeds Launchpad, InternLoop, ResearchHire, CampusGrid, and Stackwise Jobs.
   - The site's `components/data.ts` uses other names (Northwind and others).
   - Pick one set and make both sides use it. The engine's names are fine.
4. **Protect the API key on prod.** Add a simple guard to `/api/run`, such as one run at a time per IP or a cap of N runs per minute. Judges and random visitors will both hit it.
5. **If there's time:** make the internship preset as reliable as the weekend one, then the study-blocks preset.

> **Hard rules (please keep):**
> - Call it an OS, never an agent or assistant.
> - Every number on the page must be measured.
> - Every testimonial must be a real reply.
> - No keys in git.
> - Keep the URL agentsos.vercel.app.

## Rithvik next

- Fix the double Chrome bar when the Steel stream is on.
- Check the deployed flow in a browser.
- Record the demo video.
- Submit by 5:30 PM.
