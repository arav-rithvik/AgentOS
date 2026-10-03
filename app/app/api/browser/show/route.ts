import { absolute, cdpUrl, readJson, steel } from "../_steel";

export const maxDuration = 60;

// POST {id, url} → navigate that session's active page. Returns {ok}.
export async function POST(req: Request) {
  if (!steel()) return Response.json({ error: "no key" }, { status: 404 });
  const { id, url } = await readJson(req);
  if (typeof id !== "string" || typeof url !== "string") return Response.json({ error: "id and url required" }, { status: 400 });
  const target = absolute(req, url);
  if (!target) return Response.json({ error: "url must be same-origin" }, { status: 400 });

  try {
    const browser = await (await import("playwright-core")).chromium.connectOverCDP(cdpUrl(id));
    try {
      const ctx = browser.contexts()[0] ?? (await browser.newContext());
      const pages = ctx.pages();
      const page = pages[pages.length - 1] ?? (await ctx.newPage());
      await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30_000 });
    } finally {
      await browser.close().catch(() => {});
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "navigate failed" }, { status: 502 });
  }
}
