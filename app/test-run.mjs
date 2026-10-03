const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const q = async (path) => (await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15000) })).json();
const preset = process.argv[2] ?? "internships";
const t0 = Date.now();
const res = await fetch("http://localhost:3000/api/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ preset }), signal: AbortSignal.timeout(30000) });
const body = await res.json();
console.log("POST /api/run ->", res.status, JSON.stringify(body), `(${Date.now() - t0} ms)`);
if (!body.runId) process.exit(1);
let run;
for (let i = 0; i < 80; i++) {
  await new Promise((r) => setTimeout(r, 1000));
  [run] = await q(`runs?id=eq.${body.runId}`);
  if (run.status !== "running") break;
}
console.log("run:", JSON.stringify({ status: run.status, steps: run.steps, in: run.input_tokens, out: run.output_tokens, ms: run.ms }));
console.log("summary:", run.summary);
for (const a of await q(`action_log?run_id=eq.${body.runId}&order=id`)) console.log(" -", a.action, JSON.stringify(a.args).slice(0, 100), "=>", a.receipt.status, a.receipt.count ?? a.receipt.result_id ?? "", a.receipt.error ?? "", `${a.latency_ms}ms`);
for (const d of await q(`docs?run_id=eq.${body.runId}`)) console.log("\nDOC:", d.title, "\n" + d.body.slice(0, 1500));
for (const e of await q(`events?run_id=eq.${body.runId}&order=starts_at`)) console.log("EVENT:", e.kind, "|", e.title, "|", new Date(e.starts_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }), "|", e.duration_min + "min");
for (const b of await q(`bookings?run_id=eq.${body.runId}`)) console.log("BOOKING:", b.app, "|", b.title, "| $" + b.price, "|", b.confirmation);
