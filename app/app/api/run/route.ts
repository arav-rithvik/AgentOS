import { after } from "next/server";
import { runAgent } from "@/lib/agent";
import { PRESETS, type PresetName } from "@/lib/presets";
import { admin } from "@/lib/supabase-admin";

export const maxDuration = 120;

// POST { preset } -> { runId } at once. The run goes on after the response is sent;
// the page follows it with Realtime on `runs` and `action_log`.
export async function POST(req: Request) {
  const { preset } = (await req.json().catch(() => ({}))) as { preset?: string };
  if (!preset || !(preset in PRESETS)) {
    return Response.json({ error: `preset must be one of: ${Object.keys(PRESETS).join(", ")}` }, { status: 400 });
  }
  const { prompt } = PRESETS[preset as PresetName];

  try {
    const db = admin();
    await db.rpc("ensure_fresh_events");
    const { data, error } = await db.from("runs").insert({ preset, prompt }).select("id").single();
    if (error) throw new Error(error.message);
    after(() => runAgent(data.id, prompt));
    return Response.json({ runId: data.id });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
