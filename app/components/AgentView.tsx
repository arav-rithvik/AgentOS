"use client";

import { useEffect, useRef } from "react";
import { manifest } from "@/lib/manifest";
import type { Line } from "./useRun";

// The agent's computer: no UI. Exactly what the engine (lib/agent.ts) sends and gets back:
// the manifest in the system prompt, the user's task, then each turn's `call` tool_use
// blocks ({ action, args }) and their tool_result ({ receipt, data }).

const MANIFEST = Object.entries(manifest.apps)
  .map(([name, app]) => `    "${name}": ${JSON.stringify((app as { actions: unknown }).actions)}`)
  .join(",\n");

export default function AgentView({ lines, phase, prompt }: { lines: Line[]; phase: "in" | "on" | "out"; prompt?: string }) {
  const ref = useRef<HTMLPreElement>(null);
  const calls = lines.filter((l) => l.action || l.pending);
  const pending = lines.some((l) => l.pending);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  // Group calls into model turns: calls from one turn share a group.
  const turns: Line[][] = [];
  calls.forEach((l, i) => {
    const prev = calls[i - 1];
    if (prev && l.group && prev.group === l.group) turns[turns.length - 1].push(l);
    else turns.push([l]);
  });

  const out: string[] = [
    "POST /v1/messages",
    `{ "model": "claude-sonnet-5-5", "tools": [{ "name": "call", "input_schema": { "action": "enum", "args": "object" } }] }`,
    "",
    "── system",
    "You are an agent running on AgentOS, a computer made for agents. There is no screen.",
    "Each app is typed data and typed calls.",
    `{ "apps": {\n${MANIFEST}\n} }`,
    "",
    "── user",
    JSON.stringify(prompt ?? ""),
  ];
  turns.forEach((t) => {
    out.push("", `── assistant · tool_use × ${t.length}${t.length > 1 ? " (one turn, run in parallel)" : ""}`);
    const calls = t.filter((l) => l.action || l.req);
    calls.forEach((l) => out.push(`call ${JSON.stringify({ action: l.action?.call ?? l.req!.call, args: l.action?.args ?? l.req!.args })}`));
    const done = t.filter((l) => l.action && !l.pending);
    if (done.length) {
      out.push("", `── user · tool_result × ${done.length}`);
      done.forEach((l) => out.push(JSON.stringify({ receipt: l.action!.receipt, data: l.action!.data ?? (l.action!.receipt as { count?: number }).count ?? null })));
    }
  });

  return (
    <div className={`agent-view absolute inset-0 z-[200] overflow-hidden rounded-[12px] ${phase === "in" ? "glitch-in" : phase === "out" ? "glitch-out" : ""}`}>
      <pre ref={ref} className="scroll-thin h-full overflow-auto whitespace-pre-wrap break-all p-5 font-mono text-[11px] leading-[1.55]" style={{ color: "#d6e4dc" }}>
        {out.join("\n")}
        {"\n"}
        {(pending || turns.length === 0) && <span className="blink">█</span>}
      </pre>
    </div>
  );
}
