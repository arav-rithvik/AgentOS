import { admin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// GET -> the seeded calendar events (run_id is null), for the Calendar tab.
export async function GET() {
  try {
    const { data, error } = await admin().from("events").select("id, title, starts_at, duration_min").is("run_id", null).order("starts_at");
    if (error) throw new Error(error.message);
    return Response.json({ events: data ?? [] });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
