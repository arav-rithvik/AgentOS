# Supabase Select 2026 Hackathon: Team AGENTOS

Compiled 2026-10-03 for Rithvik Burki and Arav Dharnikota. Each fact carries a source tag:
- **[official]** read from a Supabase page this session
- **[you]** from your own notes
- **[sponsor]** from the sponsor's own page
- **[search]** from a web search, so confirm before relying on it
- **[unconfirmed]** nobody has verified it

---

## 1. The goal
Win 1st place and have breakfast with the Supabase founders (Paul Copplestone, Ant Wilson). [you]

Winning teams share a **31K credit prize pool** and get **breakfast with the Supabase co-founders**. Everyone who takes part shares 100K+ in credits from Supabase, Claude, Stripe, and Vercel. Food all day and swag are included. [official: Luma page, Supabase tweet and email]

## 1b. The theme: "Build Something Agents Want" [you]
The whole hackathon is organized around this line. The reading that fits it best is that **the user of your product is an AI agent.** Build the thing an agent would choose to call, pay, or run on: a tool, API, data service, or workflow made for agents, with a human supervising.

Why the sponsors fit this reading:
- Supabase launched **Your App's MCP Server** and a **headless, agent-as-primary-interface template**, and bought Turso for databases that agents create.
- Stripe lists **Machine Payments Protocol** (agents pay per call) and the **Link agent wallet**.
- Claude's new features (mid-conversation tool changes) are about agents.
- Stripe's primer features AgentMail and AgentPhone for agents.

**Scoring, four criteria weighted equally** [you; wording from the official rules page]: **innovation and creativity, functionality and completeness, user experience and design, impact and usefulness.** (An earlier note listed "design, impact, innovation, creativity." The rules page combines innovation and creativity into one criterion and adds functionality and completeness, so a project that does not actually run loses a full quarter of the score.)

## 2. Logistics
| Item | Detail |
|---|---|
| Event | Supabase Select 2026 Hackathon, tagline "Build in a weekend, scale to millions" |
| Date | Saturday, Oct 3, 2026 |
| Hours | 8:00 AM to 5:30 PM PDT on the official site. Luma says 9 AM to 5 PM. Arrive at 8. |
| Place | 580 20th Street, San Francisco (YC headquarters). Fully in person. |
| Size | 250 seats from 2,000+ expected applicants |
| Team | **AGENTOS**: Arav Dharnikota (owner), Rithvik Burki. Teams of up to 4, or solo. |
| Deadline | **Submit by 5:30 PM PDT** [you]. The deadline never moves. Feature freeze at **3:00 PM** [you], then demo work. Your submission page showed 6 h 28 m 42 s left in the screenshot. |
| Format | The **top six teams demo live on stage** to the final panel. |

## 3. The judges
Ant Wilson (Supabase co-founder and CTO), Paul Copplestone (Supabase co-founder and CEO), Pratik Gupta (Senior Engineering Leader, Stripe), John Robison (Startup Partnerships, Anthropic), George Fahmy (Member of Technical Staff, Vercel). [official: Luma page]

## 4. How scoring works
**The official criteria, word for word** [official: hackathon-rules section 5]
"Projects will be judged by a panel selected by Supabase. Submissions will be evaluated on the following criteria:"
1. **Innovation and creativity:** how original is the idea, and does it approach the problem in a new way?
2. **Functionality and completeness:** does it do what the team claims? Reward builds that actually run, with real auth and real data, over slideware and mockups.
3. **User experience and design:** is it intuitive, and is the design polished enough to show care for the user?
4. **Impact and usefulness:** does it solve a real problem, with a clear audience and use case?

All four are weighted equally [you]. Prizes go to "the top teams as determined by the judges," and "only projects that comply with these rules are eligible to win."

**The mechanics** [official: docs page]
- Judges score each criterion from **1 to 5**.
- Projects are assigned randomly. **A project may be seen by only one judge.**
- Judges spend "a few minutes" per project. Some may score from a Claude or ChatGPT chat through the platform's MCP server, so write for people and for AI.
- Final winners come from a panel, after finalists are picked by the admins.

**What judges ask for in the submission** [official: docs "Secrets to a great submission"]
- Screenshots that show the product before anything opens.
- A short demo video.
- A **public repository**.
- A **live hosted version** judges can try in the browser.
- **A login and instructions** if the product needs an account.

## 4b. What won last year (Select 2025) [official: hackathon.supabase.com/supabase-select-2025]
- **Overall winner: Repatch**, "AI-generated patch notes from your GitHub repositories, delivered as beautiful newsletters." A finished product with a clear user: GitHub analysis, AI summaries, generated videos, styled email, a subscriber API with an OpenAPI spec, and dev and prod Supabase projects. Winners were picked by **total points across all categories**.
- Last year's categories were innovation and creativity, UX and design, functionality and completeness, impact and usefulness, and technical implementation, plus a bonus "Best Use of Resend." There were 54 submissions.
- Other finalists: WZRD.Studio, Vortal (a dashboard for AI voice companies), Minty, PromptStudio, VariableLab, BetterMail, SequenceSync.
- Past Supabase hackathon blog winners (Launch Week 15) used pgvector, Edge Functions, and realtime, and were praised for "exceptional technical skill and creativity."

What this tells you: the winners were **complete, polished products with a clear user and a sponsor integration**, not tech demos. Total points across all categories rewards balance, so a rough design or a missing demo login costs more than a missing feature.

## 5. Side quests (bonus categories)
Shown on your submission page. They "will not count towards your final score, but you could win prizes for them, too." They are optional and you tick the boxes yourself.
- Best Use of **Vercel**
- Best Use of **Claude**
- Best Use of **Stripe**
- Best Use of **Codex**
- Best Use of **Multimodal AI for Gemini**

Each is a separate prize. One project can enter several, so design for as many as fit naturally.

## 6. Rules to respect
From the official rules page. [official]
- **Original work during the event.** Pre-existing projects are not eligible. Open-source libraries, frameworks, and APIs are allowed. The docs say reusing code, libraries, and skeleton projects from past work is encouraged, so reuse pieces but start the project fresh.
- **Meaningful Supabase use** is required for prizes: database, auth, storage, edge functions, or realtime.
- **No sensitive personal data or health data.**
- **Submission needs** a project description, a demo or code, and run instructions, by the announced deadline.
- **IP:** you keep ownership and grant Supabase a non-exclusive license to use your project for marketing and product development.
- **Eligibility:** the rules say participants must be 18 or the age of majority, and "only projects that comply with these rules are eligible to win." Rithvik turns 16 on Oct 7. Organizers accepted the team, but get written confirmation that you can win prizes. This is still open.

## 7. What each sponsor wants
**Claude** [you]: something at the top of the newest models, something that "couldn't have been made until today."
Newest models and features [search, so confirm on the Anthropic docs before building]:
- Claude Sonnet 5.5, released Sep 28, 2026. $2 per million input tokens and $10 per million output, 30%+ faster than Sonnet 5. New features include per-message effort (beta), mid-conversation system messages, and **mid-conversation tool changes (beta)**.
- Claude Opus 5.5, released Sep 22, 2026. 1M-token context, 128K max output, always-on adaptive thinking, $4 and $20 per million. Tools can be defined inside a mid-conversation system message (beta header `inline-tools-2026-09-15`).
- Claude Fable 5.1, released Sep 1, 2026. 1M context and stronger long-running agents and computer use.
- Idea for "couldn't exist before": use an agent whose tools change during the conversation.

**Stripe** [you, plus sponsor page]: "read shipbysundown.dev fully." I read it. It is a one-page primer **authored by Lovable**, not an official Stripe rubric. It has no judging criteria. Its message is to ship a revenue-ready product in a day by picking one tool, wiring it up, and demoing it. So a working payment flow in the demo is the safe bet.
Tools it lists:
- **Payment Links:** no code, under 60 seconds.
- **Checkout:** hosted payment page, with native WebMCP support so agents can drive it.
- **Elements, Subscriptions, Invoices.**
- **Machine Payments Protocol (MPP):** charge per API call, machines and agents pay programmatically.
- **Link Agent Wallet:** pay on a user's behalf with scoped credentials, spend limits, and user approval (`@stripe/link-sdk`).
- **Stripe Projects:** one-command provisioning of hosting, database, and auth.
- **Stripe MCP and Stripe CLI.**
- Partners: Browser Use, Browserbase, Kernel, AgentMail, AgentPhone, Exa, Firecrawl.

Commands from the page:
```bash
stripe login
stripe sandbox create
stripe projects init
stripe projects add supabase
stripe projects add vercel
stripe payment_links create --line-items price=price_123
npm i -g @stripe/link-cli
npx skills add stripe/link-cli
link-cli spend-request create --schema
```
Note: `stripe projects add supabase` provisions the Supabase side for you.

**DeepMind and Vercel** [you]: voice in the demo.
- **Gemini Live API** [search]: real-time voice with audio, images, and text; barge-in (users can interrupt); function calling; transcripts. Current model names reported: Gemini 3.8 Live (default), Gemini 3.8 Live Extended Thinking. Docs: `ai.google.dev/gemini-api/docs/live-api`.
- **Vercel AI Gateway realtime voice** [sponsor]: one API key, `useRealtime` hook in the AI SDK, quickstart at `vercel.com/docs/ai-gateway/getting-started/realtime`. The quickstart uses `openai/gpt-realtime-2`. A Vercel changelog titled "Gemini 3.8 Live models now available on AI Gateway" means **one voice integration can serve both the DeepMind and Vercel asks.** Check that page's details before building.

**Supabase** [you]: use what launched at Select yesterday, and use Supabase Compute if possible.

## 8. What Supabase launched at Select (usable today)
| Feature | Why it matters for the build |
|---|---|
| **Your App's MCP Server** | An Edge Function MCP so an agent acts for a signed-in user, with row-level security (RLS). `npx shadcn@latest add @supabase/mcp`. Needs CLI 2.117.0+, asymmetric JWT keys, and the Auth OAuth server on. |
| **Supabase Middleware 1.0** | `npm install @supabase/middleware`. `withSupabase({ auth: 'user' })` gives a user-scoped database client. |
| **Supabase MCP for Claude Code** | `claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp"`. New logs-by-SQL tool, confirmation prompts, scoped tokens. `npx plugins add supabase-community/supabase-plugin` adds skills. |
| **Declarative Schemas 2.0** | Edit SQL files in `supabase/schemas/`, `supabase db schema declarative sync -f name --no-apply`. Dashboard edits are silently ignored. |
| Health Check Advisors | Dashboard, Advisors, Health. Run before the demo. |
| Database Connections view | See stuck queries and locks. |
| Headless app template | `supabase.com/library/docs/tanstack/headless-app`, a backend with an agent as the main interface. |

**Supabase Compute** [official: supabase.com/compute]: runs agent sandboxes and persistent services next to your database. It is in **private alpha behind a waitlist**, and the page mentions no hackathon access. Deploy command `supabase compute deploy`. **Ask a Supabase staff member on site today whether hackathon teams get access.** Fallback: Edge Functions.

Skip: OrioleDB (vector indexes only experimental), and Multigres and Pipelines (not open to everyone).

## 9. Credits
- $100 Claude, $100 OpenAI (Codex), $100 Supabase [you].
- Sponsor credit codes arrive by email, one per person. Watch your inbox.
- The submission platform has a data-sharing consent setting, and the docs say "in exchange for sharing, you get free stuff." Read it before agreeing.
- Your Claude-only rule: this plan uses Gemini for voice because you listed DeepMind as a target. Confirm that exception.

## 10. The submission page, transcribed in full (from your two screenshots)
**Page header:** Team **AGENTOS**, "Building at Supabase Select 2026 Hackathon."

**Team members box**
- Arav Dharnikota, tagged **OWNER**
- Rithvik Burki, with edit and delete icons beside the name
- Only one person is the owner, so agree now who presses submit.

**BONUS CATEGORIES box** (amber panel)
- Heading: "Compete in Side Quests (optional)"
- Text: "These categories will not count towards your final score, but you could win prizes for them, too."
- Checkboxes, all unticked so far:
  - Best Use of Vercel
  - Best Use of Claude
  - Best Use of Stripe
  - Best Use of Codex
  - Best Use of Multimodal AI for Gemini

**TECHNICAL DETAILS box**
- "Coding Tools Used (Optional)"
- "Search for the tools you used to build your project."
- Button: **+ ADD A CODING TOOL**
- Tip: list every tool you really used (Claude Code, Codex, Cursor, and so on). It also supports the "Best Use of Codex" claim.

**SUBMISSION EDITOR**
- Banner: "Fields marked with * are required for final submission. You can save drafts with incomplete information."

BASIC INFORMATION
- **Project Title \*** (placeholder "Enter your project title")
- **Description \*** (placeholder "Describe your project…")

PROJECT LINKS
- Repository Type (optional dropdown, "Select repository type (optional)")
- **Repository URL \*** (placeholder `https://github.com/username/project`)
- **Demo URL \*** (placeholder `https://your-project-demo.com`)
- Demo Notes: "Include login information or any instructions on how to test your app." Placeholder: "Any additional instructions or credentials judges need to access your demo (optional)."

MEDIA UPLOAD
- Demo Video: "Upload demo video," **MP4 up to 100MB**
- Project Images (up to 10): "Upload project images," **PNG, JPEG, or WebP up to 5MB each (max 10 images)**

SUBMISSION
- Live countdown: "You have 6 hours, 28 minutes, 42 seconds to update your submission" (first screenshot) and "6 hours, 4 minutes, 28 seconds" (second screenshot, about 24 minutes later). With a 5:30 PM deadline, the second screenshot was taken at about 11:25 AM.
- Buttons: **SAVE DRAFT** and **SUBMIT ENTRY** (green).

**Required to submit:** title, description, repository URL, demo URL. **Optional but scored in practice:** demo notes, demo video, images, coding tools, side quests.

**Fill-in guide**
- *Title:* a name an agent would pick, not a descriptor.
- *Description:* open with the theme sentence ("agents want X"), then who the user is (the agent), what it does, how it uses Supabase, and which sponsors it uses. Write it so both a person and an AI judge can follow it.
- *Repository:* public, with a README that has run instructions (the rules require them).
- *Demo URL:* a live hosted version that works without setup.
- *Demo Notes:* a working login and the exact steps for the demo path.
- *Video:* 60 to 90 seconds, MP4 under 100 MB, the demo path only.
- *Images:* 4 to 6 screenshots that show the product before anything opens.
- *Side quests:* tick only the ones the demo visibly shows.

The platform can also submit from Claude: Settings, MCP Server, add `/api/mcp`.

## 11. Draft strategy (a brainstorm to react to, not a decision)
One project that makes every sponsor's ask true:
1. **Voice-first agent** using Gemini Live through Vercel AI Gateway (covers DeepMind, Vercel, and the Gemini side quest).
2. **Supabase backbone:** the app-MCP server with RLS, auth, and realtime (covers the main track and the "what launched yesterday" ask).
3. **Claude for reasoning,** using a new feature such as mid-conversation tool changes (covers Claude and "couldn't exist before").
4. **Real payment flow** in the demo, such as Stripe Payment Links or the Link agent wallet (covers Stripe and "ship by sundown").
5. **Hosted on Vercel** with a public repo (covers Vercel and the judges' checklist).
6. **Built with Codex** in part, to qualify for that side quest and use the OpenAI credits.

The risk is trying to cover everything. The project must run end to end before any sponsor box counts. Pick the one live demo path and cut anything that does not appear in it.

## 12. Hour plan (from about 11:30 AM; adjust to the live clock)
| Window | Goal |
|---|---|
| By noon | A rough submission saved with title, description, repo URL, and demo URL, so something is on file |
| Now to 3:00 PM | Build. The one demo path must work end to end with real auth and real data. |
| **3:00 PM** | **Feature freeze.** No new features. Fix only what breaks the demo path. |
| 3:00-4:30 | Demo video (MP4, under 100 MB), 4 to 6 screenshots, README with run instructions, a working demo login in Demo Notes |
| 4:30-5:15 | Final submit with side-quest boxes ticked, then rehearse the 2-minute stage demo |
| **5:15 PM** | **Submit.** Leave 15 minutes of buffer before the 5:30 hard deadline. |

## 13. Questions to settle with the organizers today
1. Can a minor team member win prizes, in writing?
2. What is the exact submission deadline?
3. Is Supabase Compute available to hackathon teams?
4. What does "Best Use of Codex" reward, and does it require using Codex for the build?
5. How long is the live stage demo for the top six?

## 14. Known unknowns
- Absolute submission deadline (only the countdown was visible).
- Whether Compute access exists for participants.
- Exact Gemini Live model names and Vercel's Gemini integration details.
- Sponsor-specific rubrics beyond what is listed here.
- Stripe's actual judging criteria. The Ship by Sundown page has none.

## 15. Sources
- hackathon.supabase.com, /hackathon-rules, /docs
- Luma event page, Supabase tweets, Supabase email (your screenshots)
- supabase.com/blog (Select 2026 posts), supabase.com/compute
- shipbysundown.dev
- ai.google.dev/gemini-api/docs/live-api
- vercel.com/docs/ai-gateway/getting-started/realtime
- Web searches on Claude Sonnet 5.5, Opus 5.5, Fable 5.1
