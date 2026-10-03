import { admin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// GET -> everything the page needs to follow one run: the run row, its system calls, and what they wrote.
// Read on the server with the service role key, so the browser needs no Supabase key at all.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = admin();
    const [run, actions, events, docs, bookings] = await Promise.all([
      db.from("runs").select("status, summary, steps, input_tokens, output_tokens, ms").eq("id", id).single(),
      db.from("action_log").select("id, action, args, receipt, latency_ms").eq("run_id", id).order("id"),
      db.from("events").select("id, title, starts_at, duration_min").eq("run_id", id),
      db.from("docs").select("id, title, body").eq("run_id", id),
      db.from("bookings").select("id, app, title, price, details").eq("run_id", id),
    ]);
    if (run.error) throw new Error(run.error.message);
    return Response.json({ run: run.data, actions: actions.data ?? [], events: events.data ?? [], docs: docs.data ?? [], bookings: bookings.data ?? [] });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
