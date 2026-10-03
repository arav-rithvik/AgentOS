"use client";

import { BENCHMARK } from "./benchmark";
import type { Run } from "./data";

// Same task, every agent. AgentOS's numbers are this run's, exactly as measured. The rest come from the benchmark.

const n = (v: number | null | undefined, unit = "") => (v === null || v === undefined ? "—" : `${v.toLocaleString("en-US")}${unit}`);

export default function Compare({ run, calls }: { run: Run | null; calls: number }) {
  const done = run?.status === "done";
  const ours = { ms: done ? run.ms : null, tokens: done ? run.input_tokens + run.output_tokens : null, actions: done ? calls : null, screenshots: done ? 0 : null };
  const pending = BENCHMARK.every((b) => b.ms === null);

  return (
    <div className="mt-14">
      <div className="mono text-[22px] leading-tight tracking-tight sm:text-[26px]">The comparison</div>
      <div className="mt-1 text-[15px]" style={{ color: "var(--dim)" }}>
        Same task, every agent. Exact numbers, nothing rounded.{!done && " Press send to fill in AgentOS’s box with this run."}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Box name="AgentOS" by="This run, live" logo={null} vals={ours} hot />
        {BENCHMARK.map((b) => (
          <Box key={b.name} name={b.name} by={b.by} logo={b} vals={b} />
        ))}
      </div>
      {pending && (
        <div className="mt-3 text-[13px]" style={{ color: "var(--faint)" }}>
          Other agents’ numbers are being measured on the same task now.
        </div>
      )}
    </div>
  );
}

function Box({ name, by, logo, vals, hot }: { name: string; by: string; logo: { logo: string; bg: string; pad: number } | null; vals: { ms: number | null; tokens: number | null; actions: number | null; screenshots: number | null }; hot?: boolean }) {
  return (
    <div className="rounded-[14px] border p-4" style={{ borderColor: hot ? "var(--green)" : "var(--line-2)", background: "var(--panel)" }}>
      <div className="flex items-center gap-2.5">
        {logo ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ background: logo.bg, padding: logo.pad * 0.7 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.logo} alt="" className={logo.pad ? "h-full w-full object-contain" : "h-full w-full object-cover"} />
          </span>
        ) : (
          <span className="mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-black" style={{ background: "var(--green)" }}>
            OS
          </span>
        )}
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold" style={{ color: hot ? "var(--green)" : "var(--fg)" }}>
            {name}
          </div>
          <div className="truncate text-[12px]" style={{ color: "var(--faint)" }}>
            {by}
          </div>
        </div>
      </div>
      <dl className="mono mt-4 space-y-2.5 text-[13px]">
        <Row k="Time" v={n(vals.ms, " ms")} />
        <Row k="Tokens" v={n(vals.tokens)} />
        <Row k="Actions" v={n(vals.actions)} />
        <Row k="Screenshots" v={n(vals.screenshots)} />
      </dl>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-t pt-2.5" style={{ borderColor: "var(--line)" }}>
      <dt style={{ color: "var(--faint)" }}>{k}</dt>
      <dd className="text-right" style={{ color: v === "—" ? "var(--faint)" : "var(--fg)" }}>
        {v}
      </dd>
    </div>
  );
}
