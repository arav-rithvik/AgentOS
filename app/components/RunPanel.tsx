"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "./globe/Globe";
import { PRESETS, type Run } from "./data";
import type { Line } from "./useRun";

// The AgentOS CLI. Laid out like a coding-agent terminal: header, transcript of
// typed calls with their receipts, a prompt, and a status line.

const BG = "#1f2330";
const DIM = "#7d8496";
const FAINT = "#545b6c";
const GREEN = "var(--green)";

function fmtArgs(args: Record<string, unknown>) {
  const s = Object.entries(args)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(", ");
  return s.length > 64 ? s.slice(0, 63) + "…" : s;
}

export default function RunPanel({ lines, run, reset, start }: { lines: Line[]; run: Run | null; reset: () => void; start: (p: string) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState(PRESETS[0].prompt);
  const [now, setNow] = useState(0);
  const t0 = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const running = run?.status === "running";

  // Live timer while running; the run row's ms is the source of truth when done.
  useEffect(() => {
    if (!running) return;
    t0.current = performance.now();
    const i = setInterval(() => setNow(performance.now() - t0.current), 50);
    return () => clearInterval(i);
  }, [running]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [lines.length, run?.status]);

  // The prompt grows with what you type, so the whole thing is always visible.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [msg]);

  const secs = run ? (running ? now : run.ms) / 1000 : 0;
  const tokens = run ? run.input_tokens + run.output_tokens : 0;

  const submit = () => {
    const m = msg.trim();
    if (!m || running) return;
    if (m === "/reset" || m === "/clear") {
      reset();
      setMsg("");
      return;
    }
    start(m);
    setMsg("");
  };

  return (
    <div className="mono flex h-[680px] flex-col overflow-hidden rounded-[12px] border text-[12.5px] leading-[1.55]" style={{ background: BG, borderColor: "#343a4a", color: "#e6e8ee", boxShadow: "0 30px 80px rgba(0,0,0,.55)" }}>
      {/* Terminal title bar */}
      <div className="relative flex h-8 shrink-0 items-center px-3" style={{ background: "#2a2f3d", borderBottom: "1px solid #343a4a" }}>
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 text-center font-sans text-[12px] font-semibold" style={{ color: "#c9ccd6" }}>
          rithvik — {running ? "✳ " : ""}AgentOS — agentos
        </div>
      </div>

      {/* Transcript */}
      <div ref={scroller} className="scroll-thin min-h-0 flex-1 overflow-auto px-4 pb-3 pt-4">
        <div className="flex items-start gap-3">
          <span style={{ color: GREEN, lineHeight: 1 }}>
            <Globe cols={15} rows={8} speed={running ? 9 : 3} className="text-[4.6px]" />
          </span>
          <div className="leading-[1.45]">
            <div>
              <span className="font-bold">AgentOS</span> <span style={{ color: DIM }}>v0.1.0</span>
            </div>
            <div style={{ color: DIM }}>The operating system your agent runs on</div>
            <div style={{ color: DIM }}>/Users/rithvik</div>
          </div>
        </div>

        <div className="mt-3 border-l-2 pl-2" style={{ borderColor: GREEN }}>
          <div style={{ color: GREEN }}>Signed in: Mail · Docs · Calendar · Fade &amp; Co. · 5 job boards</div>
          <div>Every app is data. Every call returns a receipt.</div>
        </div>

        {run && (
          <div className="mt-4 rounded-[3px] px-2 py-1" style={{ background: "#2c3242" }}>
            <span style={{ color: DIM }}>&gt; </span>
            {run.prompt}
          </div>
        )}

        <div className="mt-3 space-y-2">
          {lines.map((l) => {
            const open = openId === l.id && l.action;
            return (
              <div key={l.id} className="rise">
                <button disabled={!l.action} onClick={() => setOpenId(openId === l.id ? null : l.id)} className="flex w-full items-start gap-2 text-left">
                  <span className={l.pending ? "blink" : ""} style={{ color: l.pending ? DIM : l.action ? GREEN : "#e6e8ee" }}>
                    ⏺
                  </span>
                  <span className="min-w-0 flex-1">
                    {l.action ? (
                      <>
                        <span className="font-bold">{l.action.call}</span>
                        <span style={{ color: DIM }}>({fmtArgs(l.action.args)})</span>
                      </>
                    ) : (
                      <span style={{ color: l.pending ? DIM : "#e6e8ee" }}>{l.text}</span>
                    )}
                    {l.group === "parallel" && <span style={{ color: FAINT }}> · parallel</span>}
                  </span>
                </button>
                {l.action && (
                  <div className="flex gap-2 pl-[6px]" style={{ color: DIM }}>
                    <span>⎿</span>
                    <span className="min-w-0 flex-1">
                      {l.text}
                      <span style={{ color: FAINT }}>
                        {" "}
                        · {l.action.ms}ms {open ? "▾" : "▸ receipt"}
                      </span>
                    </span>
                  </div>
                )}
                {open && l.action && (
                  <pre className="ml-6 mt-1 overflow-auto rounded-[3px] p-2 text-[11px] leading-snug" style={{ background: "#181b25", color: "#a9b0c2" }}>
                    {JSON.stringify({ call: l.action.call, args: l.action.args, receipt: l.action.receipt }, null, 1)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>

        {run?.result && !running && (
          <div className="rise mt-3 flex gap-2">
            <span>⏺</span>
            <span className="flex-1">{run.result}</span>
          </div>
        )}

        {running && (
          <div className="mt-3" style={{ color: GREEN }}>
            <span className="blink">✻</span> Working… <span style={{ color: DIM }}>({secs.toFixed(1)}s · ↑ {tokens.toLocaleString()} tokens · 0 screenshots)</span>
          </div>
        )}
      </div>

      {/* Prompt */}
      <form
        className="shrink-0 px-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex items-start gap-2 border-y py-2" style={{ borderColor: "#3a4152" }}>
          <span className="pt-[1px]" style={{ color: "#e6e8ee" }}>
            ❯
          </span>
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
            placeholder='Try "book me a haircut tomorrow afternoon"'
            className="scroll-thin flex-1 resize-none overflow-auto bg-transparent leading-[1.5] outline-none placeholder:text-[#545b6c]"
            spellCheck={false}
          />
          <button disabled={running || !msg.trim()} className="rounded-[3px] px-2 py-[1px] text-[11px] disabled:opacity-40" style={{ background: GREEN, color: "#04140c" }}>
            ↵ run
          </button>
        </div>
      </form>

      {/* Status line */}
      <div className="shrink-0 space-y-1 px-3 pb-3 pt-2 text-[11px] leading-snug">
        <div className="flex flex-wrap items-center gap-x-2">
          <span style={{ color: GREEN }}>●</span>
          <span>agentos</span>
          <span style={{ color: FAINT }}>·</span>
          <span>{run ? `${secs.toFixed(1)}s` : "0.0s"}</span>
          <span style={{ color: FAINT }}>·</span>
          <span>{tokens.toLocaleString()} tokens</span>
          <span style={{ color: FAINT }}>·</span>
          <span style={{ color: GREEN }}>0 screenshots</span>
          <button type="button" onClick={reset} disabled={running} className="ml-auto hover:text-white disabled:opacity-40" style={{ color: DIM }}>
            ↻ /reset
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span style={{ color: "#f0a35e" }}>⏵⏵ try</span>
          {PRESETS.map((p) => (
            <button type="button" key={p.label} onClick={() => setMsg(p.prompt)} className="hover:text-white" style={{ color: msg === p.prompt ? GREEN : DIM }}>
              {p.label.toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
