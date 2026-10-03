"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "../globe/Globe";
import { PRESETS, type Run } from "../data";
import type { Site } from "../useRun";

// agentsos.vercel.app, open in Chrome on your computer: where you give your agent a task.
// The work happens on the AgentOS side (no screen); you check the result in your own apps.

export function AgentOSSite({ run, start, onOpen }: { run: Run | null; start: (p: string) => void; onOpen: (s: Site) => void }) {
  const [msg, setMsg] = useState(PRESETS[0].prompt);
  const box = useRef<HTMLTextAreaElement>(null);
  const running = run?.status === "running";

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [msg]);

  const submit = () => {
    if (msg.trim() && !running) start(msg.trim());
  };

  return (
    <div className="flex h-full flex-col items-center overflow-auto px-6 pt-14" style={{ background: "#fff", color: "#111", fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif' }}>
      <div style={{ color: "#111" }}>
        <Globe cols={18} rows={10} speed={running ? 9 : 3} className="text-[5px]" />
      </div>
      <div className="mt-3 font-mono text-[13px] tracking-[0.18em]">AGENTOS</div>
      <h1 className="mt-6 text-center text-[26px] font-semibold tracking-tight">What should your agent do?</h1>
      <p className="mt-1 text-[14px]" style={{ color: "#6b6b6b" }}>
        It works on AgentOS, not on your screen. Check the result in your own apps.
      </p>

      <form
        className="mt-6 w-full max-w-[600px]"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex items-end gap-2 rounded-[22px] border px-4 py-3 transition-shadow focus-within:shadow-[0_2px_14px_rgba(0,0,0,.08)]" style={{ borderColor: "#dcdcdc" }}>
          <textarea
            ref={box}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Book me a haircut tomorrow morning…"
            className="flex-1 resize-none bg-transparent text-[15px] leading-[1.5] outline-none"
          />
          <button disabled={running || !msg.trim()} aria-label="Run" className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-30" style={{ background: "#111" }}>
            ↑
          </button>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {PRESETS.map((p) => (
            <button type="button" key={p.label} onClick={() => setMsg(p.prompt)} className="rounded-full border px-3 py-1.5 text-[12.5px] transition-colors hover:bg-[#f3f3f3]" style={{ borderColor: msg === p.prompt ? "#111" : "#e2e2e2" }}>
              {p.label}
            </button>
          ))}
        </div>
      </form>

      <div className="mt-8 w-full max-w-[600px] text-center text-[14px]">
        {running && <div style={{ color: "#6b6b6b" }}>Working on AgentOS… watch the system calls on the right →</div>}
        {run && run.status !== "running" && (
          <div className="rounded-2xl border p-5" style={{ borderColor: "#e6e6e6" }}>
            <div className="font-semibold" style={{ color: run.status === "done" ? "#0b8043" : "#c5221f" }}>
              {run.status === "done" ? "✓ Done" : "Something went wrong"}
            </div>
            {run.result && <div className="mt-1 leading-relaxed" style={{ color: "#3c3c3c" }}>{run.result}</div>}
            <div className="mt-4 text-[13px]" style={{ color: "#6b6b6b" }}>
              Don&apos;t take its word for it. Check your apps:
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {(
                [
                  ["cuts", "Fade & Co. → Appointments"],
                  ["calendar", "Calendar"],
                  ["docs", "Docs"],
                ] as [Site, string][]
              ).map(([s, label]) => (
                <button key={s} onClick={() => onOpen(s)} className="rounded-full px-3.5 py-1.5 text-[13px] text-white hover:opacity-90" style={{ background: "#111" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
