import SupabaseLogo from "./SupabaseLogo";

// How AgentOS runs on Supabase. "Today" = in app/supabase/schema.sql and app/lib right now.
// "Next" = what Supabase launched at Select 2026 and how AgentOS uses it after this demo. Max 6 boxes.

const BOXES: { tag: "Today" | "Next"; k: string; title: string; body: string; code?: string }[] = [
  {
    tag: "Today",
    k: "Postgres",
    title: "The world is a database",
    body: "Every app the agent can use is Postgres tables: 5 job boards, Docs, Calendar, a salon, concerts and flights. The agent reads the whole world in one query. A Postgres function keeps every date relative to today.",
    code: "jobs · docs · events · flights · salon_slots · concerts · bookings",
  },
  {
    tag: "Today",
    k: "action_log + runs",
    title: "Every action is a row",
    body: "Each system call is written with its arguments, its result and how long it took. Each run records its tokens and milliseconds. Nothing is hidden, and the numbers on this page come straight from these rows.",
    code: "action_log(run_id, action, args, receipt, latency_ms)",
  },
  {
    tag: "Today",
    k: "Row Level Security",
    title: "The browser can only look",
    body: "RLS is on for every table. The public key can only read. Only the server, holding the service role key, can write, so nothing on the page can change the agent’s world.",
    code: "create policy read_all … for select to anon",
  },
  {
    tag: "Today",
    k: "Realtime",
    title: "Watch the agent live",
    body: "Every table the agent writes to is published to Supabase Realtime, so any screen can subscribe to an agent while it works: each call, each doc, each booking the moment it lands.",
    code: "alter publication supabase_realtime add table action_log",
  },
  {
    tag: "Next",
    k: "Your App’s MCP Server",
    title: "Your real apps, signed in safely",
    body: "Launched at Select: an MCP server that lets an agent act for a signed-in user, with RLS deciding exactly what it may touch. You sign in once with Supabase Auth, and AgentOS mounts your real apps as data, scoped to you.",
  },
  {
    tag: "Next",
    k: "Supabase Compute",
    title: "A computer for every agent",
    body: "Launched at Select: agent sandboxes that run beside the database. The AgentOS loop moves there, and because the whole OS is one Supabase project, giving a new agent its own computer is creating a new project. That scales to millions of agents.",
  },
];

export default function SupabaseSection() {
  return (
    <section className="mx-auto w-full max-w-[1340px] px-4 pt-28">
      <div className="flex items-center gap-3">
        <SupabaseLogo size={30} />
        <div className="mono text-[22px] leading-tight tracking-tight sm:text-[26px]">Runs on Supabase</div>
      </div>
      <div className="mono mt-2 text-[15px] leading-snug sm:text-[17px]" style={{ color: "var(--green)" }}>
        Built for its new MCP Server and Compute, from yesterday’s Supabase Select.
      </div>
      <p className="mt-3 max-w-[820px] text-[17px] leading-relaxed" style={{ color: "#d6d6d6" }}>
        AgentOS is one Supabase project. The world your agent sees is Postgres. Everything it does is a row. Who can touch what is Row Level Security. Watching it work is Realtime.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-px border sm:grid-cols-2 lg:grid-cols-3" style={{ borderColor: "var(--line-2)", background: "var(--line-2)" }}>
        {BOXES.map((t) => {
          const now = t.tag === "Today";
          return (
            <div key={t.k} className="flex flex-col p-5" style={{ background: now ? "var(--bg)" : "var(--panel)" }}>
              <div className="mono text-[12px] uppercase tracking-[0.12em]" style={{ color: now ? "var(--green)" : "var(--faint)" }}>
                {now ? t.k : `Next · ${t.k}`}
              </div>
              <div className="mt-2 text-[17px] font-semibold">{t.title}</div>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed" style={{ color: "var(--dim)" }}>
                {t.body}
              </p>
              {t.code && (
                <code className="mono mt-4 block border-t pt-3 text-[11.5px]" style={{ borderColor: "var(--line)", color: "#9fb3a8" }}>
                  {t.code}
                </code>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
