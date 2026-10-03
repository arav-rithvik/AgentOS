"use client";

import { useEffect, useState } from "react";
import AgentView from "./AgentView";
import Mac from "./mac/Mac";
import RunPanel from "./RunPanel";
import { useRun } from "./useRun";

export default function Playground() {
  const r = useRun();
  const running = r.run?.status === "running";
  // off -> in (glitch) -> on (agent's computer) -> out (glitch back) -> off (your Mac, with the changes)
  const [phase, setPhase] = useState<"off" | "in" | "on" | "out">("off");
  useEffect(() => {
    if (running) {
      setPhase("in");
      const t = setTimeout(() => setPhase("on"), 450);
      return () => clearTimeout(t);
    }
    setPhase((p) => (p === "off" ? p : "out"));
    const t = setTimeout(() => setPhase("off"), 1300);
    return () => clearTimeout(t);
  }, [running]);
  const agent = phase !== "off";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_430px]">
      <div>
        <Label title={agent ? "Your agent’s computer" : "Your computer"} sub={agent ? "What your agent sees: data, not pixels" : "What you see"} green={agent} />
        <div className={`relative ${phase === "in" ? "glitch-shake" : phase === "out" ? "glitch-shake late" : ""}`}>
          <Mac objects={r.objects} live={r.live} />
          {agent && <AgentView lines={r.lines} prompt={r.run?.prompt} phase={phase === "out" ? "out" : phase === "in" ? "in" : "on"} />}
        </div>
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
