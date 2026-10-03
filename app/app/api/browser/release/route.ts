import { readJson, steel } from "../_steel";

export const maxDuration = 60;

// POST {id} → release the Steel session (sent via navigator.sendBeacon on page unload).
export async function POST(req: Request) {
  const client = steel();
  if (!client) return Response.json({ error: "no key" }, { status: 404 });
  const { id } = await readJson(req);
  if (typeof id !== "string") return Response.json({ error: "id required" }, { status: 400 });
  try {
    await client.sessions.release(id);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "release failed" }, { status: 502 });
  }
}
