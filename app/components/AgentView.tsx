"use client";

import { useEffect, useRef } from "react";
import type { Line } from "./useRun";

// The agent's computer: no UI at all. The same apps the Mac shows, as the raw text
// the agent reads and writes. It takes over the screen while a run is going.

export default function AgentView({ lines, phase, prompt }: { lines: Line[]; phase: "in" | "on" | "out"; prompt?: string }) {
  const ref = useRef<HTMLPreElement>(null);
  const calls = lines.filter((l) => l.action);
  const pending = lines.some((l) => l.pending);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [calls.length, pending]);

  const text = [
    `$ agentos run ${JSON.stringify(prompt ?? "")}`,
    "",
    ...calls.flatMap((l) => [
      JSON.stringify({ call: l.action!.call, args: l.action!.args }, null, 2),
      `→ ${JSON.stringify(l.action!.receipt, null, 2)}`,
      `  ${l.action!.ms}ms`,
      "",
    ]),
  ].join("\n");

  return (
    <div className={`agent-view absolute inset-0 z-[200] overflow-hidden rounded-[12px] ${phase === "in" ? "glitch-in" : phase === "out" ? "glitch-out" : ""}`}>
      <pre ref={ref} className="scroll-thin h-full overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-[12px] leading-[1.55]" style={{ color: "#d6e4dc" }}>
        {text}
        {(pending || calls.length === 0) && <span className="blink">█</span>}
      </pre>
    </div>
  );
}
