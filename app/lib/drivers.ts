import { admin } from "./supabase-admin";
import { ACTIONS, type ActionName } from "./manifest";
import type { Receipt } from "./types";

type Args = Record<string, unknown>;
type Outcome = { data: unknown; result_id?: string | null; count?: number | null };

const str = (v: unknown) => (typeof v === "string" ? v : "");
const TZ = "America/Los_Angeles";
// "2026-10-04" and "19:30" for a timestamp, in the user's time zone.
const localDate = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: TZ });
const localTime = (iso: string) => new Date(iso).toLocaleTimeString("sv-SE", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

/** Save one booking for this run and return what the agent and the receipt need. */
async function book(runId: string, app: string, item_id: string, title: string, price: number, details: Args): Promise<Outcome> {
  const { data, error } = await admin()
    .from("bookings")
    .insert({ run_id: runId, app, item_id, title, price, details })
    .select("id, confirmation")
    .single();
  if (error) throw new Error(error.message);
  return { data: { id: data.id, confirmation: data.confirmation, price }, result_id: data.id };
}

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
      .insert({ run_id: runId, title, starts_at: start.toISOString(), duration_min, kind: args.kind === "block" ? "block" : "event" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { data: { id: data.id }, result_id: data.id };
  },

  async "flights.search"(_runId, args) {
    let q = admin().from("flights").select("*").eq("origin", str(args.from).toUpperCase()).eq("dest", str(args.to).toUpperCase());
    if (args.maxPrice) q = q.lte("price", Number(args.maxPrice));
    const { data, error } = await q.order("price");
    if (error) throw new Error(error.message);
    const rows = (data ?? [])
      .filter((f) => (!args.date || localDate(f.departs_at) === str(args.date)) && (!args.after || localTime(f.departs_at) >= str(args.after)))
      .map((f) => ({ id: f.id, airline: f.airline, from: f.origin, to: f.dest, departs: f.departs_at, arrives: f.arrives_at, price: f.price, seatsLeft: f.seats_left }));
    return { data: rows, count: rows.length };
  },

  async "flights.book"(runId, args) {
    const { data: f } = await admin().from("flights").select("*").eq("id", str(args.flightId)).maybeSingle();
    if (!f) throw new Error(`no flight with id '${str(args.flightId)}'`);
    return book(runId, "flights", f.id, `${f.airline} ${f.origin} to ${f.dest}`, f.price, { departs: f.departs_at, arrives: f.arrives_at });
  },

  async "salon.slots.list"(_runId, args) {
    let q = admin().from("salon_slots").select("*");
    if (args.salon) q = q.ilike("salon", `%${str(args.salon)}%`);
    if (args.maxPrice) q = q.lte("price", Number(args.maxPrice));
    const { data, error } = await q.order("starts_at");
    if (error) throw new Error(error.message);
    const rows = (data ?? [])
      .filter((s) => (!args.date || localDate(s.starts_at) === str(args.date)) && (!args.before || localTime(s.starts_at) < str(args.before)))
      .map((s) => ({ id: s.id, salon: s.salon, stylist: s.stylist, service: s.service, start: s.starts_at, durationMin: s.duration_min, price: s.price }));
    return { data: rows, count: rows.length };
  },

  async "salon.book"(runId, args) {
    const { data: s } = await admin().from("salon_slots").select("*").eq("id", str(args.slotId)).maybeSingle();
    if (!s) throw new Error(`no slot with id '${str(args.slotId)}'`);
    return book(runId, "salon", s.id, `${s.service} at ${s.salon}`, s.price, { start: s.starts_at, durationMin: s.duration_min, stylist: s.stylist });
  },

  async "concerts.search"(_runId, args) {
    let q = admin().from("concerts").select("*");
    if (args.city) q = q.ilike("city", `%${str(args.city)}%`);
    if (args.maxPrice) q = q.lte("price", Number(args.maxPrice));
    const { data, error } = await q.order("starts_at");
    if (error) throw new Error(error.message);
    const words = str(args.query).toLowerCase().split(/\s+/).filter(Boolean);
    const rows = (data ?? [])
      .filter((c) => (!args.date || localDate(c.starts_at) === str(args.date)) && words.every((w) => `${c.artist} ${c.genre}`.toLowerCase().includes(w)))
      .map((c) => ({ id: c.id, artist: c.artist, genre: c.genre, venue: c.venue, city: c.city, start: c.starts_at, durationMin: c.duration_min, price: c.price, ticketsLeft: c.tickets_left }));
    return { data: rows, count: rows.length };
  },

  async "concerts.book"(runId, args) {
    const qty = Math.max(1, Number(args.qty) || 1);
    const { data: c } = await admin().from("concerts").select("*").eq("id", str(args.concertId)).maybeSingle();
    if (!c) throw new Error(`no concert with id '${str(args.concertId)}'`);
    if (qty > c.tickets_left) throw new Error(`only ${c.tickets_left} tickets left`);
    return book(runId, "concerts", c.id, `${qty} x ${c.artist} at ${c.venue}`, c.price * qty, { start: c.starts_at, durationMin: c.duration_min, qty });
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
