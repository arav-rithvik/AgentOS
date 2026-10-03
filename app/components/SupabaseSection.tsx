import SupabaseLogo from "./SupabaseLogo";

// How AgentOS runs on Supabase. "Today" = in app/supabase/schema.sql and app/lib right now.
// "Next" = what Supabase launched at Select 2026 and how AgentOS uses it after this demo.

const TODAY: { k: string; title: string; body: string; code: string }[] = [
  {
    k: "Postgres",
    title: "The world is a database",
    body: "Every app the agent can use is a set of Postgres tables: 5 job boards, Docs, Calendar, a salon, concerts and flights. The agent reads the whole world in one query instead of scrolling through pages.",
    code: "jobs · docs · events · flights · salon_slots · concerts · bookings",
  },
  {
    k: "action_log",
    title: "Every action is a row",
    body: "Each system call the agent makes is written to Postgres with its arguments, its result and how long it took. Nothing the agent does is hidden, and every run can be replayed and audited.",
    code: "action_log(run_id, action, args, receipt, latency_ms)",
  },
  {
    k: "Row Level Security",
    title: "The browser can only look",
    body: "RLS is on for every table. The public key can only read. Only the server, holding the service role key, can write, so nothing on the page can change the agent’s world.",
    code: "create policy read_all … for select to anon",
  },
  {
    k: "Realtime",
    title: "Watch the agent live",
    body: "Every table the agent writes to is published to Supabase Realtime, so any screen can subscribe to an agent while it works: each call, each doc, each booking the moment it lands.",
    code: "alter publication supabase_realtime add table action_log",
  },
  {
    k: "Database functions",
    title: "The world keeps its own clock",
    body: "A Postgres function runs at the start of every run and rebuilds the calendar relative to today once a day, so “due this week” is always true. The OS keeps itself fresh without a cron server.",
    code: "select ensure_fresh_events()",
  },
  {
    k: "runs",
    title: "Every run is measured",
    body: "Each run is one row: status, model turns, input and output tokens, and milliseconds. The numbers on this page come straight from it, exactly as measured.",
    code: "runs(status, steps, input_tokens, output_tokens, ms)",
  },
];

const NEXT: { k: string; title: string; body: string }[] = [
  {
    k: "Your App’s MCP Server",
    title: "Your real apps, signed in safely",
    body: "Launched at Select: an MCP server that lets an agent act for a signed-in user, with RLS deciding exactly what it may touch. This is how AgentOS mounts your real accounts: you sign in once with Supabase Auth, and the agent gets your apps as data, scoped to you.",
  },
  {
    k: "Supabase Compute",
    title: "The agent lives next to its data",
    body: "Launched at Select: agent sandboxes and long-running services that run beside the database. The AgentOS loop moves there, so every system call is a hop inside one Supabase project.",
  },
  {
    k: "One project per agent",
    title: "A computer for every agent",
    body: "Because the whole OS is one Supabase project (world, permissions, log, live feed), giving a new agent its own computer is creating a new project. That is how this scales to millions of agents.",
  },
];

export default function SupabaseSection() {
  return (
    <section className="mx-auto w-full max-w-[1340px] px-4 pt-28">
      <div className="flex items-center gap-3">
        <SupabaseLogo size={30} />
        <div className="mono text-[22px] leading-tight tracking-tight sm:text-[26px]">Runs on Supabase</div>
      </div>
      <p className="mt-3 max-w-[820px] text-[17px] leading-relaxed" style={{ color: "#d6d6d6" }}>
        AgentOS is one Supabase project. The world your agent sees is Postgres. Everything it does is a row. Who can touch what is Row Level Security. Watching it work is Realtime.
      </p>

      <div className="mono mt-8 text-[12px] uppercase tracking-[0.14em]" style={{ color: "var(--green)" }}>
        Today · in this demo
      </div>
      <div className="mt-3 grid grid-cols-1 gap-px border sm:grid-cols-2 lg:grid-cols-3" style={{ borderColor: "var(--line-2)", background: "var(--line-2)" }}>
        {TODAY.map((t) => (
          <div key={t.k} className="flex flex-col p-5" style={{ background: "var(--bg, #000)" }}>
            <div className="mono text-[12px] uppercase tracking-[0.12em]" style={{ color: "var(--green)" }}>
              {t.k}
            </div>
            <div className="mt-2 text-[17px] font-semibold">{t.title}</div>
            <p className="mt-2 flex-1 text-[14px] leading-relaxed" style={{ color: "var(--dim)" }}>
              {t.body}
            </p>
            <code className="mono mt-4 block border-t pt-3 text-[11.5px]" style={{ borderColor: "var(--line)", color: "#9fb3a8" }}>
              {t.code}
            </code>
          </div>
        ))}
      </div>

      <div className="mono mt-10 text-[12px] uppercase tracking-[0.14em]" style={{ color: "var(--dim)" }}>
        Next · built on what Supabase launched at Select 2026
      </div>
      <div className="mt-3 grid grid-cols-1 gap-px border lg:grid-cols-3" style={{ borderColor: "var(--line-2)", background: "var(--line-2)" }}>
        {NEXT.map((t) => (
          <div key={t.k} className="p-5" style={{ background: "var(--panel)" }}>
            <div className="mono text-[12px] uppercase tracking-[0.12em]" style={{ color: "var(--faint)" }}>
              {t.k}
            </div>
            <div className="mt-2 text-[17px] font-semibold">{t.title}</div>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--dim)" }}>
              {t.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
