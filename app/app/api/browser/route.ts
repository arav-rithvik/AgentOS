import { chromium } from "playwright-core";
import { cdpUrl, siteOrigin, steel } from "./_steel";

export const maxDuration = 60;

// POST → a fresh Steel cloud Chrome, already on /web/mail. Returns {id, viewerUrl}.
export async function POST(req: Request) {
  const client = steel();
  if (!client) return Response.json({ error: "no key" }, { status: 404 });

  let id: string | null = null;
  try {
    // Sized to the Mac's Chrome content area (wide, short) so the stream fills it.
    const session = await client.sessions.create({ timeout: 10 * 60 * 1000, dimensions: { width: 1280, height: 560 }, blockAds: true });
    id = session.id;
    const browser = await chromium.connectOverCDP(cdpUrl(session.id));
    try {
      const ctx = browser.contexts()[0] ?? (await browser.newContext());
      const page = ctx.pages()[0] ?? (await ctx.newPage());
      await page.goto(`${siteOrigin(req)}/web/mail`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    } finally {
      // Drops our CDP handle only; the default context (and the remote session) stay alive.
      await browser.close().catch(() => {});
    }
    const viewerUrl = `${session.debugUrl}${session.debugUrl.includes("?") ? "&" : "?"}interactive=true&showControls=false`;
    return Response.json({ id: session.id, viewerUrl, origin: siteOrigin(req) });
  } catch (e) {
    if (id) await client.sessions.release(id).catch(() => {});
    return Response.json({ error: e instanceof Error ? e.message : "steel failed" }, { status: 502 });
  }
}
