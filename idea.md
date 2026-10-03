# AgentOS - base idea

Target: Supabase Select 2026 Hackathon (Grand Prize). Submissions due 5:30 PM PDT.
Note: you can only win one prize. Aim for Grand Prize, do not optimize for a sponsor prize.

## One-liner
The computer for agents. An operating system whose native interface is structured state, not pixels.

Pitch line: every agent today is a person feeling around a dark room by touching pixels. AgentOS turns the lights on and hands the agent the room as data.

## Problem
- Operating systems (Linux, macOS, Windows) are built for humans.
- Computer-use agents (Grok Bot, Muse, Instinct and others) first used screenshots and pixel matching, now use the accessibility tree.
- Both are workarounds. The OS itself is not designed for agents, so agents burn tokens, guess at coordinates, and break when a UI shifts.

## Why now
1. Computer-use agents only went mainstream this year, so the pain is only now visible at scale.
2. MCP just standardized agent-to-tool calls, so "everything is a tool call" is viable.
3. Secure delegated auth (Supabase agent OAuth, shipped yesterday) was the missing piece. An agent OS with no safe way into a user's accounts is a toy.

## The product
- Every option available to the agent is communicated as JSON (typed objects, not rendered UI).
- Mail is message objects, calendar is event objects: typed and queryable.
- A selection layer lets the agent choose among options (voice brain dump mentioned "something like Jev" - unclear, see open questions).
- An LLM (Claude) drives it.
- Supabase is the backing layer, with agent OAuth for scoped access to real accounts.

## What agents want from an agent-native OS (target-user evidence)
Source: the agent's own account of daily operation.
1. The world as data, not pixels. UI tasks mean guessing at coordinates on a screenshot. That is most of token burn and most failure modes.
2. Receipts. After acting, the agent must re-read the world and infer whether it worked. Every call should return intended vs actual change. Kills the "did that send?" class of bugs.
3. Undo. Agents have no cmd-Z. Snapshot the world, act, roll back. With a checkpoint underneath, agents act far more boldly.
4. Forking. Spin up N copies of the environment, try N approaches in parallel, keep the one that works.
5. Scoped identity. No raw passwords. Revocable, auditable grants per service (maps directly to Supabase OAuth).

Key insight: the killer of computer use is reliability, not speed. Structured state lets the agent verify its own actions.

## Differentiators
- vs MCP: MCP wraps existing human apps one at a time, so the agent is limited to whatever someone wrote a server for. AgentOS is the whole environment as structured state.
- vs sandboxes: never use the word "sandbox". Position as "the computer for agents".
- vs screenshot / accessibility-tree computer use: no pixel matching, far fewer tokens, verifiable actions.
- Unique angle few will demo: OS-level action log with audit and undo.

## Demo plan
One hero task, full loop:
1. Voice in (DeepMind voice credits).
2. OAuth into a real account via Supabase agent OAuth.
3. Multi-step execution through structured state.
4. Eval numbers on screen (time and tokens).
Do it live. Record a backup video first.
Stretch (about one hour): action log with undo.

## Eval metrics
- Task completion time, AgentOS vs screenshot-loop baseline.
- Token count, same task, both approaches. This is the number judges cannot argue with (screenshot loops are claimed to burn 10-100x more; measure it, do not assert it).
- Success rate over repeated runs, to counter "5 seconds is cherry-picked".
- Optional: UI-shift robustness (change layout, show baseline breaks, AgentOS does not).

## Judging angles and expected attacks
1. "This is just a sandbox / MCP already does this." Answer: see Differentiators.
2. "5 seconds is cherry-picked." Answer: live demo, plus tokens alongside time, plus repeated runs.
3. "Why not 6 months ago?" Answer: see Why now.
Fit: the prompt is roughly "make something agents want", and this is what agents run on. Demoing Supabase's newest feature (agent OAuth) back to them helps.
TODO: paste the official judging criteria from Supabase-Select-2026-Hackathon.md here and map each criterion to a feature. (Not available to the author of this file.)

## Resources available
- Anthropic: $100 API credits
- OpenAI: $100 API credits (redeem via the link Arav has)
- Vercel: $30 AI Gateway credits
- Stripe: info link Arav has
- Supabase: $100 credits
- DeepMind: voice credits
Redemption codes are in Arav's original message; keep them out of the repo.

## Open questions
- Exact scope of the MVP: which objects (mail, calendar, files?) are real vs mocked?
- What is "Jev" in the voice dump (likely a transcription error)? What picks options?
- Which hero task is the most legible in 2 minutes?
- Which baseline do we compare against (Claude computer use? accessibility-tree agent)?
- Is the undo/action log in scope given the 5:30 PM deadline?
- Who is on the team and present in the room?
- Judging criteria mapping (see TODO above).
