"use client";

import type { Line } from "./useRun";

// The agent's computer: the same apps the Mac shows, as typed data. It takes over the
// screen while a run is going, and each tile lights up as the agent calls that app.

const TILES: { id: string; name: string; calls: string[] }[] = [
  { id: "jobs", name: "5 job boards", calls: ["jobs.list(board, query, posted)"] },
  { id: "docs", name: "Docs", calls: ["docs.list()", "docs.create(title, body)"] },
  { id: "calendar", name: "Calendar", calls: ["calendar.list(kind)", "calendar.create(title, start)"] },
  { id: "salon", name: "Fade & Co.", calls: ["slots.list(date, after)", "book(slotId)"] },
  { id: "concerts", name: "Concerts", calls: ["concerts.search(city, date)", "concerts.book(id, qty)"] },
  { id: "flights", name: "Flights", calls: ["flights.search(from, to)", "flights.book(flightId)"] },
  { id: "mail", name: "Mail", calls: ["messages.list(from)", "messages.send(to, body)"] },
];

function tileOf(call: string) {
  const app = call.split(".")[0];
  if (app.startsWith("board") || app === "jobboard") return "jobs";
  if (app === "cuts" || app === "salon") return "salon";
  return app;
}

function short(receipt: Record<string, unknown>) {
  const r = receipt as { status?: string; ok?: boolean; count?: number | null; result_id?: string | null; id?: string; confirmation?: string };
  const ok = r.status ? r.status === "ok" : r.ok !== false;
  const bits = [ok ? "ok" : "error"];
  if (r.count != null) bits.push(`${r.count} rows`);
  const id = r.result_id ?? r.id;
  if (id) bits.push(`id ${String(id).slice(0, 8)}`);
  if (r.confirmation) bits.push(r.confirmation);
  return bits.join(" · ");
}

export default function AgentView({ lines, phase }: { lines: Line[]; phase: "in" | "on" | "out" }) {
  const calls = lines.filter((l) => l.action);
  const byTile = new Map<string, Line[]>();
  calls.forEach((l) => {
    const t = tileOf(l.action!.call);
    byTile.set(t, [...(byTile.get(t) ?? []), l]);
  });
  const last = calls[calls.length - 1];
  const pending = lines.some((l) => l.pending);

  return (
    <div className={`agent-view absolute inset-0 z-[200] flex flex-col overflow-hidden rounded-[12px] ${phase === "in" ? "glitch-in" : phase === "out" ? "glitch-out" : ""}`}>
      <div className="mono flex items-center justify-between border-b px-4 py-2.5 text-[11px] tracking-[0.12em]" style={{ borderColor: "#123222" }}>
        <span style={{ color: "var(--green)" }}>AGENTOS · YOUR COMPUTER, AS YOUR AGENT SEES IT</span>
        <span style={{ color: "#6f8a7c" }}>
          {calls.length} calls · <span style={{ color: "var(--green)" }}>0 pixels</span>
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5 p-3 lg:grid-cols-3">
        {TILES.map((t) => {
          const hits = byTile.get(t.id) ?? [];
          const hot = last && tileOf(last.action!.call) === t.id;
          return (
            <div
              key={t.id}
              className="mono flex min-h-0 flex-col overflow-hidden rounded-lg border p-2.5 text-[10.5px] leading-snug transition-all duration-300"
              style={{
                borderColor: hot ? "var(--green)" : hits.length ? "#1f6b4a" : "#14251c",
                background: hot ? "rgba(62,207,142,.10)" : "rgba(5,14,10,.75)",
                boxShadow: hot ? "0 0 24px rgba(62,207,142,.25)" : "none",
              }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: hits.length ? "#e6efe9" : "#6f8a7c" }}>{t.name}</span>
                {hits.length > 0 && <span style={{ color: "var(--green)" }}>{hits.length}×</span>}
              </div>
              {hits.length === 0 ? (
                <div className="mt-1.5 space-y-0.5" style={{ color: "#3c5547" }}>
                  {t.calls.map((c) => (
                    <div key={c}>{c}</div>
                  ))}
                </div>
              ) : (
                <div className="scroll-thin mt-1.5 min-h-0 space-y-1 overflow-auto">
                  {hits.slice(-4).map((l) => (
                    <div key={l.id} className="rise">
                      <div style={{ color: "#cfe9db" }}>
                        <span style={{ color: "var(--green)" }}>✓</span> {l.action!.call}
                      </div>
                      <div className="pl-3" style={{ color: "#6f8a7c" }}>
                        → {short(l.action!.receipt)} · {l.action!.ms}ms
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="mono flex flex-col justify-center rounded-lg border p-2.5 text-[10.5px] leading-snug" style={{ borderColor: "#14251c", color: "#6f8a7c" }}>
          <div style={{ color: pending ? "var(--green)" : "#cfe9db" }}>
            <span className={pending ? "blink" : ""}>●</span> {pending ? "calling…" : "thinking…"}
          </div>
          <div className="mt-1">No screen. No clicks.</div>
          <div>Every call returns a receipt.</div>
        </div>
      </div>
    </div>
  );
}
