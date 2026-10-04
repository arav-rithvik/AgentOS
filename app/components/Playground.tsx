"use client";

import AgentView from "./AgentView";
import Compare from "./Compare";
import { PRESETS } from "./data";
import Mac from "./mac/Mac";
import { useRun } from "./useRun";

// Top: one task, already written. Press send.
// Right: AgentOS runs it. No screen, just the system calls, then "done".
// Left: your computer. Check the result in your own apps.
const TASK = PRESETS[1].prompt;

export default function Playground() {
  const r = useRun();
  const run = r.run;
  const running = run?.status === "running";
  const done = run?.status === "done";

  return (
    <div>
      <form
        className="flex items-stretch border"
        style={{ borderColor: running ? "var(--green)" : "var(--line-2)", background: "#0a0a0a" }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!running) r.start(TASK);
        }}
      >
        <span className="flex flex-1 items-center px-4 py-3 text-[16px] leading-snug sm:text-[17px]">{TASK}</span>
        <button disabled={running} aria-label="Send" className="mono w-[96px] shrink-0 text-[13px] font-semibold uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90 disabled:opacity-40" style={{ background: "var(--green)" }}>
          {running ? "Running" : "Send ↑"}
        </button>
      </form>
      <div className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--faint)" }}>
        {!run && "Send it, watch the operating system on the right, then check the result on the computer below."}
        {running && <span style={{ color: "var(--dim)" }}>Running on AgentOS. Every system call shows up on the right.</span>}
        {done && <span style={{ color: "var(--green)" }}>✓ Done in {(run.ms / 1000).toFixed(1)}s. Check it on the computer below.</span>}
        {run?.status === "error" && <span style={{ color: "#ff6b6b" }}>Something went wrong. Send it again.</span>}{" "}
        The computer is a Mac replica with demo copies of your apps, since a public demo can’t sign in to your real accounts.
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div>
          <Label title="Your computer" sub="Check the result here, in your own apps." />
          <Mac objects={r.objects} live={r.live} run={run} />
        </div>
        <div>
          <Label title="Your agent’s operating system" sub="AgentOS: the operating system your agent runs on. No screen, just system calls." green />
          <AgentView lines={r.lines} run={run} />
        </div>
      </div>

      <Compare run={run} calls={r.lines.filter((l) => l.action).length} />
    </div>
  );
}

function Label({ title, sub, green }: { title: string; sub: string; green?: boolean }) {
  return (
    <div className="mb-3">
      <div className="mono text-[22px] leading-tight tracking-tight sm:text-[26px]" style={{ color: green ? "var(--green)" : "var(--fg)" }}>
        {title}
      </div>
      <div className="mt-1 text-[15px]" style={{ color: "var(--dim)" }}>
        {sub}
      </div>
    </div>
  );
}
