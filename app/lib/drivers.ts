import { admin } from "./supabase-admin";
import { ACTIONS, type ActionName } from "./manifest";
import type { Receipt } from "./types";

type Args = Record<string, unknown>;
type Outcome = { data: unknown; result_id?: string | null; count?: number | null };

const str = (v: unknown) => (typeof v === "string" ? v : "");

// One handler per typed call. Each returns the data for the agent, plus what the receipt needs.
const handlers: Record<ActionName, (runId: string, args: Args) => Promise<Outcome>> = {
  async "jobboard.jobs.list"(_runId, args) {
    const board = str(args.board).toLowerCase();
    if (!["a", "b", "c", "d", "e"].includes(board)) throw new Error("board must be one of a, b, c, d, e");
    let q = admin().from("jobs").select("id, board, title, company, location, tags, url, posted_at").eq("board", board);
    if (args.posted === "today") q = q.gte("posted_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString());
    const { data, error } = await q.order("posted_at", { ascending: false });
    if (error) throw new Error(error.message);
    // Every word of the query must appear in the title, company or tags.
    const words = str(args.query).toLowerCase().split(/\s+/).filter(Boolean).map((w) => w.replace(/s$/, ""));
    const rows = (data ?? [])
      .filter((j) => {
        const hay = `${j.title} ${j.company} ${j.tags}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .map((j) => ({ id: j.id, title: j.title, company: j.company, location: j.location, url: j.url, posted: j.posted_at, board: j.board }));
    return { data: rows, count: rows.length };
  },

  async "docs.create"(runId, args) {
    const title = str(args.title);
    if (!title) throw new Error("title is required");
    const { data, error } = await admin().from("docs").insert({ run_id: runId, title, body: str(args.body) }).select("id").single();
    if (error) throw new Error(error.message);
    return { data: { id: data.id, url: `/apps/docs?run=${runId}&doc=${data.id}` }, result_id: data.id };
  },

  async "docs.list"(runId) {
    const { data, error } = await admin().from("docs").select("id, title").or(`run_id.is.null,run_id.eq.${runId}`).order("created_at");
    if (error) throw new Error(error.message);
    const rows = (data ?? []).map((d) => ({ id: d.id, title: d.title, url: `/apps/docs?run=${runId}&doc=${d.id}` }));
    return { data: rows, count: rows.length };
  },

  async "calendar.list"(runId, args) {
    let q = admin().from("events").select("id, title, starts_at, duration_min, kind").or(`run_id.is.null,run_id.eq.${runId}`);
    if (args.kind) q = q.eq("kind", str(args.kind));
    const { data, error } = await q.order("starts_at");
    if (error) throw new Error(error.message);
    const rows = (data ?? []).map((e) => ({ id: e.id, title: e.title, start: e.starts_at, durationMin: e.duration_min, kind: e.kind }));
    return { data: rows, count: rows.length };
  },

  async "calendar.create"(runId, args) {
    const title = str(args.title);
    const start = new Date(str(args.start));
    if (!title) throw new Error("title is required");
    if (Number.isNaN(start.getTime())) throw new Error("start must be an ISO time, for example 2026-10-04T19:00:00-07:00");
    const duration_min = Number(args.durationMin) || 60;
    const { data, error } = await admin()
      .from("events")
      .insert({ run_id: runId, title, starts_at: start.toISOString(), duration_min, kind: "block" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { data: { id: data.id }, result_id: data.id };
  },
};

/**
 * Run one typed call for a run. Always returns a receipt and always appends one
 * row to action_log, also when the call fails.
 * `tokens` is this call's share of the model turn that asked for it.
 */
export async function call(runId: string, action: string, args: Args, tokens: number | null = null) {
  const started = new Date();
  let outcome: Outcome = { data: null };
  let error: string | undefined;

  if (!(ACTIONS as readonly string[]).includes(action)) {
    error = `unknown action '${action}'. Valid actions: ${ACTIONS.join(", ")}`;
  } else {
    try {
      outcome = await handlers[action as ActionName](runId, args);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  const finished = new Date();
  const receipt: Receipt = {
    action,
    args,
    result_id: outcome.result_id ?? null,
    count: outcome.count ?? null,
    status: error ? "error" : "ok",
    ...(error ? { error } : {}),
    started_at: started.toISOString(),
    finished_at: finished.toISOString(),
  };

  await admin().from("action_log").insert({
    run_id: runId,
    app: action.split(".")[0],
    action,
    args,
    receipt,
    tokens,
    latency_ms: finished.getTime() - started.getTime(),
  });

  return { receipt, data: outcome.data };
}
