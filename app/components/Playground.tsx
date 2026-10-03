"use client";

import AgentView from "./AgentView";
import Mac from "./mac/Mac";
import { useRun } from "./useRun";

// Left: your computer. You give the task in the AgentOS tab, then check your own apps.
// Right: the agent's computer on AgentOS. No screen, just the system calls, then "done".
export default function Playground() {
  const r = useRun();
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_440px]">
      <div>
        <Label title="Your computer" sub="What you see. Give the task in the AgentOS tab, then check your apps." />
        <Mac objects={r.objects} live={r.live} run={r.run} start={r.start} />
      </div>
      <div>
        <Label title="Your agent’s computer" sub="AgentOS: the operating system your agent runs on. No screen, just system calls." green />
        <AgentView lines={r.lines} run={r.run} />
      </div>
    </div>
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
