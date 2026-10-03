# AgentOS: instructions for every agent session

Team AGENTOS (Arav Dharnikota, Rithvik Burki) at the Supabase Select 2026 Hackathon.
Submission is due at 5:30 PM PDT on Oct 3, 2026. Building stops at 4:30 PM.

## Read these files first

| File | What it is | When to read it |
|---|---|---|
| `idea.md` | **The source of truth for the idea.** If anything conflicts with it, `idea.md` wins. | Before any work. |
| `TASKS.md` | The implementation plan: the demo scenes, the data contract, and each task with its steps and "done when" check. | Before you build or change anything. |
| `Supabase-Select-2026-Hackathon.md` | Context on the hackathon: theme, judging criteria, rules, sponsors, submission page. | When you need to know why a choice was made or what the judges want. |

## Rules

1. **Do not change the idea.** `idea.md` is absolute. Do not add, remove or reframe the product.
2. **Build only what is in the demo.** If a feature is not in a scene in `TASKS.md`, do not build it.
3. **Follow the contract in `TASKS.md`.** The data shapes, the manifest and the API call are shared by the frontend and the backend. Do not change them without telling the user.
4. **Stay in your owner's folders.**
   - Arav: `app/lib/`, `app/app/api/`, `app/supabase/`
   - Rithvik: all pages under `app/app/` except `api/`, `app/components/`, `app/app/globals.css`
5. **Work by task ID.** Say which task you are on (for example `A2.3`). When its "done when" check passes, tick its box in `TASKS.md`.
6. **Do not write code until the user says to build.** A question is a question; answer it.
7. **Never commit secrets.** Keys live in `app/.env.local` only. Do not paste keys in chat, code or docs.
8. **Commits belong to the user.** Do not add any AI co-author, "Generated with" line or session link.
9. **Speed over perfect.** This is a ship-fast project. One demo path must work end to end. Skip anything else.
10. **Front-end quality matters.** No generic AI look. See the demo table in `TASKS.md` for what the page must show.

## If you are late

Cut in this order: third preset, eval over 5 runs (use 1 run), raw-log download, second preset. Never cut the hero run, the live app UIs, or the baseline recording.

Today's build decisions are at the top of `TASKS.md`. Where they differ from `idea.md` (no login, no free-text box, mock apps, hand-modeled drivers), `TASKS.md` is correct for today's build. Do not claim driver compiling or agent OAuth as built.
