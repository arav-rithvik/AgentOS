"use client";

import Mac from "./mac/Mac";
import RunPanel from "./RunPanel";
import { useRun } from "./useRun";

export default function Playground() {
  const r = useRun();
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_430px]">
      <div>
        <Label title="Your computer" sub="What you see" />
        <Mac objects={r.objects} live={r.live} />
      </div>
      <div>
        <Label title="AgentOS" sub="The operating system your agent runs on" green />
        <RunPanel lines={r.lines} run={r.run} reset={r.reset} start={r.start} />
      </div>
    </div>
  );
}

function Label({ title, sub, green }: { title: string; sub: string; green?: boolean }) {
  return (
    <div className="mb-4">
      <div className="mono text-[22px] leading-tight tracking-tight sm:text-[26px]" style={{ color: green ? "var(--green)" : "var(--fg)" }}>
        {title}
      </div>
      <div className="mt-1 text-[15px]" style={{ color: "var(--dim)" }}>
        {sub}
      </div>
    </div>
  );
}
