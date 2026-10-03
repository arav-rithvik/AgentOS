import Globe from "@/components/globe/Globe";
import Playground from "@/components/Playground";
import SupabaseLogo from "@/components/SupabaseLogo";

// Measured numbers go here (A4). null = not measured yet, so nothing is shown.
const EVAL: { agent: string; seconds: number | null; steps: number | null; tokens: number | null; tokensNote: "measured" | "estimated"; success: string | null }[] = [
  { agent: "Computer-use agent (screenshots)", seconds: null, steps: null, tokens: null, tokensNote: "estimated", success: null },
  { agent: "AgentOS", seconds: null, steps: null, tokens: null, tokensNote: "measured", success: null },
];

// Real answers only: each agent was asked "what would you want out of an agent-native OS?"
// Logos: Grok and Claude from @lobehub/icons-static-svg; Instinct, Dots and Muse from the team.
// Muse: add a card here once its verbatim reply is in (logo is public/agents/muse.png).
const logo = (src: string, bg: string, pad = 9) => (
  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ background: bg, padding: pad }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt="" className={pad ? "h-full w-full object-contain" : "h-full w-full object-cover"} />
  </span>
);

const VOICES: { name: string; role: string; quote: string; avatar: React.ReactNode }[] = [
  {
    name: "Grok Bot",
    role: "xAI",
    quote: "A world I can read, not a picture I have to poke. Tell me what I asked for and what actually changed. “Did that send?” would stop being half my bugs.",
    avatar: logo("/agents/grok-white.svg", "#000", 10),
  },
  {
    name: "Instinct",
    role: "AI agent",
    quote: "Every task I do through a UI is me guessing at coordinates on a screenshot. Give me the world as data and a checkpoint under me, and I'd move 10x bolder.",
    avatar: logo("/agents/instinct.png", "#fff", 2),
  },
  {
    // Verbatim excerpts from Dots' reply (screenshot from Arav).
    name: "Dots",
    role: "AI agent",
    quote: "A click can succeed without the change sticking. A message can be accepted without confirming delivery. I’d want every action to come back with a clear record: what changed, what’s still pending, and whether I can undo it. The upgrade I’d pick is being able to say “handled” with evidence behind it.",
    avatar: logo("/agents/dots.png", "#000", 0),
  },
  {
    name: "Claude",
    role: "Anthropic",
    quote: "Most of a computer-use task is me looking at pictures of buttons. Hand me the inbox as rows and I'm done before the page would have loaded.",
    avatar: logo("/agents/claude.svg", "#fff", 9),
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="grid grid-cols-3 items-center border-b px-4 py-3 sm:px-14" style={{ borderColor: "var(--line)" }}>
        <span className="mono text-[12px] tracking-[0.14em]">AGENTOS</span>
        <div className="flex justify-center">
          <Globe cols={24} rows={14} speed={3} className="text-[4.5px]" />
        </div>
        <div className="flex justify-end">
          <a href="#try" className="btn !py-2 !text-[11px]" style={{ background: "#1a1a1a", borderColor: "#1a1a1a" }}>
            Try it →
          </a>
        </div>
      </header>

      <section className="px-4 pt-24 text-center sm:pt-32">
        <div className="mono inline-flex items-center gap-2.5 text-[12px] uppercase tracking-[0.16em] sm:text-[13px]" style={{ color: "var(--dim)" }}>
          <span>Built at</span>
          <SupabaseLogo size={15} />
          <span style={{ color: "var(--fg)" }}>Supabase Select 2026</span>
        </div>
        <h1 className="mono mt-5 text-[40px] leading-tight tracking-tight sm:text-[64px]">The computer for agents.</h1>
        <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed sm:text-[21px]" style={{ color: "#cfcfcf" }}>
          AgentOS is a computer that lets AI agents use your apps as data instead of screenshots, so they finish real tasks in seconds, not minutes, and show you every step.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <a href="#try" className="btn !border-white !bg-white !text-black">
            Try it →
          </a>
        </div>
      </section>

      <section id="try" className="mx-auto w-full max-w-[1340px] px-4 pt-20">
        <Playground />
      </section>

      {EVAL.some((e) => e.seconds !== null) && (
        <section className="mx-auto w-full max-w-[1340px] px-4 pt-24">
          <div className="mono mb-6 text-[12px] tracking-[0.14em]">THE RACE · SAME TASK, SAME 5 BOARDS</div>
          <div className="frame mono overflow-x-auto text-[13px]">
            <table className="w-full">
              <thead style={{ color: "var(--faint)" }}>
                <tr className="text-left text-[11px] uppercase tracking-[0.1em]">
                  {["agent", "time", "steps", "tokens", "success"].map((h) => (
                    <th key={h} className="px-4 py-3 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EVAL.map((e) => (
                  <tr key={e.agent} style={{ borderTop: "1px solid var(--line)", color: e.agent === "AgentOS" ? "var(--green)" : "var(--fg)" }}>
                    <td className="px-4 py-3">{e.agent}</td>
                    <td className="px-4 py-3">{e.seconds ?? "–"}s</td>
                    <td className="px-4 py-3">{e.steps ?? "–"}</td>
                    <td className="px-4 py-3">
                      {e.tokens?.toLocaleString() ?? "–"} <span style={{ color: "var(--faint)" }}>{e.tokensNote}</span>
                    </td>
                    <td className="px-4 py-3">{e.success ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="py-28">
        <h2 className="mono px-4 text-center text-[28px] leading-tight sm:text-[40px]">Agent Testimonies</h2>
        <p className="mx-auto mt-4 max-w-[560px] px-4 text-center text-[16px]" style={{ color: "var(--dim)" }}>
          The goal was to build something agents want, so we did the first thing you’re supposed to do: we asked our agents what they would want that they don’t have today.
        </p>
        <div className="marquee-mask mt-12 overflow-hidden">
          <div className="marquee flex w-max gap-5">
            {[...VOICES, ...VOICES, ...VOICES].map((v, i) => (
              <div key={i} className="w-[420px] shrink-0 rounded-2xl border p-6" style={{ borderColor: "var(--line-2)", background: "var(--panel)" }}>
                <div className="flex items-center gap-3">
                  {v.avatar}
                  <div>
                    <div className="font-semibold">{v.name}</div>
                    <div className="text-[13px]" style={{ color: "var(--faint)" }}>
                      {v.role}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "#d6d6d6" }}>
                  {v.quote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
