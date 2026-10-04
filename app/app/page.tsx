import Globe from "@/components/globe/Globe";
import Playground from "@/components/Playground";
import SupabaseLogo from "@/components/SupabaseLogo";
import SupabaseSection from "@/components/SupabaseSection";

// Real answers only: each agent was asked "what would you want out of an agent-native OS?"
// Logos: Grok and Claude from @lobehub/icons-static-svg; Instinct, Dots and Muse from the team.
// Muse: add a card here once its verbatim reply is in (logo is public/agents/muse.png).
const logo = (src: string, bg: string, pad = 9) => (
  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden" style={{ background: bg, padding: pad }}>
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
        <h1 className="mono mt-5 text-[40px] leading-tight tracking-tight sm:text-[64px]">The OS for agents.</h1>
        <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed sm:text-[21px]" style={{ color: "#cfcfcf" }}>
          AgentOS is an operating system that lets AI agents use your apps as data instead of screenshots, so they finish real tasks in seconds, not minutes, and show you every step.
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

      <SupabaseSection />

      <section className="pt-28 pb-14">
        <h2 className="mono px-4 text-center text-[28px] leading-tight sm:text-[40px]">Agent Testimonies</h2>
        <p className="mx-auto mt-4 max-w-[560px] px-4 text-center text-[16px]" style={{ color: "var(--dim)" }}>
          The goal was to build something agents want, so we did the first thing you’re supposed to do: we asked our agents what they would want that they don’t have today.
        </p>
        <div className="marquee-mask mt-12 overflow-hidden">
          <div className="marquee flex w-max gap-5">
            {[...VOICES, ...VOICES, ...VOICES].map((v, i) => (
              <div key={i} className="w-[420px] shrink-0 border p-6" style={{ borderColor: "var(--line-2)", background: "var(--panel)" }}>
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

      <footer className="border-t px-4 py-10 sm:px-14" style={{ borderColor: "var(--line)" }}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Globe cols={14} rows={8} speed={3} className="text-[4px]" />
            <div>
              <div className="mono text-[12px] tracking-[0.14em]">AGENTOS</div>
              <div className="mt-1 text-[14px]" style={{ color: "var(--dim)" }}>
                The OS for agents.
              </div>
            </div>
          </div>
          <div className="text-[13px] sm:text-right" style={{ color: "var(--faint)" }}>
            <div className="mono inline-flex items-center gap-2 uppercase tracking-[0.12em]">
              <span>Built at</span>
              <SupabaseLogo size={12} />
              <span style={{ color: "var(--dim)" }}>Supabase Select 2026</span>
            </div>
            <div className="mt-1.5">By Rithvik and Arav · Demo environment: tasks run on pre-connected demo apps.</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
