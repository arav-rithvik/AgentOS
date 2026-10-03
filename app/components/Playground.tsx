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
const APPS = ["5 job boards", "Docs", "Calendar", "Fade & Co.", "Concerts", "Flights"];

export default function Playground() {
  const r = useRun();
  const run = r.run;
  const running = run?.status === "running";
  const done = run?.status === "done";

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="rounded-[14px] border p-5 sm:p-6" style={{ borderColor: "var(--line-2)", background: "var(--panel)" }}>
          <div className="mono text-[12px] uppercase tracking-[0.14em]" style={{ color: "var(--dim)" }}>
            Your agent’s task
          </div>
          <form
            className="mt-3 flex items-center gap-3 rounded-[12px] border py-2 pl-4 pr-2"
            style={{ borderColor: running ? "var(--green)" : "var(--line-2)", background: "#0a0a0a" }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!running) r.start(TASK);
            }}
          >
            <span className="flex-1 text-[16px] leading-snug sm:text-[17px]">{TASK}</span>
            <button
              disabled={running}
              aria-label="Send"
              className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] text-[18px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: "var(--green)" }}
            >
              ↑
            </button>
          </form>
          <div className="mt-3 min-h-[22px] text-[14px]" style={{ color: done ? "var(--green)" : "var(--dim)" }}>
            {!run && "Press send. Then watch the right side."}
            {running && "AgentOS is running it. Every system call shows up on the right →"}
            {done && `✓ Done in ${(run.ms / 1000).toFixed(1)}s. Now check it yourself on the computer below: Docs → “ML internships - today”.`}
            {run?.status === "error" && <span style={{ color: "#ff6b6b" }}>Something went wrong. Press send to try again.</span>}
          </div>
        </div>

        <div className="rounded-[14px] border p-5 sm:p-6" style={{ borderColor: "var(--line-2)" }}>
          <div className="mono text-[12px] uppercase tracking-[0.14em]" style={{ color: "var(--dim)" }}>
            How to use
          </div>
          <p className="mt-3 text-[16px] leading-snug" style={{ color: "#e6e6e6" }}>
            Send the prompt, watch how fast the operating system goes, and view the final output on your computer.
          </p>
          <div className="mt-4 text-[12px] uppercase tracking-[0.12em]" style={{ color: "var(--faint)" }}>
            Connected apps
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {APPS.map((a) => (
              <span key={a} className="rounded-full border px-2.5 py-1 text-[12.5px]" style={{ borderColor: "var(--line-2)", color: "#d6d6d6" }}>
                {a}
              </span>
            ))}
          </div>
          <div className="mt-3 text-[12.5px] leading-snug" style={{ color: "var(--faint)" }}>
            These are the apps connected to this demo, and AgentOS only runs on them. OAuth to your real accounts isn’t set up yet, and a public page signing in to your accounts wouldn’t be safe for you.
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div>
          <Label title="Your computer" sub="Where you check the result. It’s a replica of a Mac with demo copies of your apps, since a public demo can’t sign in to your real accounts. On your real computer the idea is the same: once your apps are connected, AgentOS runs these same system calls on them." />
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

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mono flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[12px]" style={{ background: "#1c1c1c", color: "var(--green)" }}>
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

function Label({ title, sub, green }: { title: string; sub: string; green?: boolean }) {
  return (
    <div className="mb-4 min-h-[64px]">
      <div className="mono text-[22px] leading-tight tracking-tight sm:text-[26px]" style={{ color: green ? "var(--green)" : "var(--fg)" }}>
        {title}
      </div>
      <div className="mt-1 text-[15px]" style={{ color: "var(--dim)" }}>
        {sub}
      </div>
    </div>
  );
}
