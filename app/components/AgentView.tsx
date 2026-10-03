"use client";

import { useEffect, useRef } from "react";
import { manifest } from "@/lib/manifest";
import type { Run } from "./data";
import type { Line } from "./useRun";

// The agent's computer, as AgentOS sees it: no screen. Only the system calls the agent makes
// (lib/agent.ts: call { action, args } -> { receipt, data }), streaming in, then "done".

const APPS = Object.keys(manifest.apps).length;
const CALLS = Object.values(manifest.apps).reduce((n, a) => n + Object.keys((a as { actions: object }).actions).length, 0);

function clip(s: string, n = 260) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default function AgentView({ lines, run }: { lines: Line[]; run: Run | null }) {
  const ref = useRef<HTMLPreElement>(null);
  const calls = lines.filter((l) => l.action || l.req);
  const running = run?.status === "running";

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [lines, run?.status]);

  const out: string[] = [`agentos ▸ ${APPS} apps mounted · ${CALLS} system calls · no screen`, ""];
  if (!run) out.push("waiting for a task…");
  else {
    out.push(`task ${JSON.stringify(run.prompt)}`, "");
    let group: string | undefined;
    calls.forEach((l) => {
      if (l.group !== group) {
        if (group !== undefined) out.push("");
        group = l.group;
      }
      const action = l.action?.call ?? l.req!.call;
      const args = l.action?.args ?? l.req!.args;
      out.push(`call ${JSON.stringify({ action, args })}`);
      if (l.action) {
        const r = l.action.receipt as { status?: string; count?: number | null; result_id?: string | null };
        const data = l.action.data;
        const result = { status: r.status ?? "ok", count: r.count ?? null, result_id: r.result_id ?? null, data };
        out.push(clip(` → ${JSON.stringify(result)}`) + `  ${l.action.ms}ms`);
      } else out.push(" → …");
    });
    if (run.status !== "running") {
      const n = calls.filter((l) => l.action).length;
      out.push(
        "",
        run.status === "done" ? `✓ done · ${n} calls · ${(run.ms / 1000).toFixed(1)}s · ${(run.input_tokens + run.output_tokens).toLocaleString()} tokens · 0 screenshots` : `✗ ${run.result ?? "failed"}`,
      );
    }
  }

  return (
    <div className="flex h-[680px] flex-col overflow-hidden rounded-[14px] border" style={{ background: "#050505", borderColor: "var(--line-2)" }}>
      <pre ref={ref} className="scroll-thin h-full overflow-auto whitespace-pre-wrap break-all p-5 font-mono text-[11.5px] leading-[1.6]" style={{ color: "#d6e4dc" }}>
        {out.map((t, i) => (
          <div key={i} style={{ color: t.startsWith("✓") ? "var(--green)" : t.startsWith(" →") ? "#7d8a83" : t.startsWith("agentos") ? "var(--green)" : undefined }}>
            {t || " "}
          </div>
        ))}
        {(running || !run) && <span className="blink">█</span>}
      </pre>
    </div>
  );
}
