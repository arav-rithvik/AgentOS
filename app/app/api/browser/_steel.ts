import Steel from "steel-sdk";

/** The cloud browser can't reach localhost, so local dev points it at the public deploy. */
export const PUBLIC_ORIGIN = "https://agentsos.vercel.app";

export function siteOrigin(req: Request): string {
  const o = new URL(req.url).origin;
  const host = new URL(o).hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".localhost") ? PUBLIC_ORIGIN : o;
}

/** Resolve a path (or same-origin absolute URL) against the origin the cloud browser can reach. */
export function absolute(req: Request, url: string): string | null {
  const origin = siteOrigin(req);
  try {
    const u = new URL(url, origin);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname) || u.hostname.endsWith(".localhost");
    const target = local ? new URL(u.pathname + u.search + u.hash, origin) : u;
    return target.origin === origin ? target.toString() : null;
  } catch {
    return null;
  }
}

export function steel(): Steel | null {
  const apiKey = process.env.STEEL_API_KEY;
  return apiKey ? new Steel({ steelAPIKey: apiKey }) : null;
}

export const cdpUrl = (id: string) => `wss://connect.steel.dev?apiKey=${encodeURIComponent(process.env.STEEL_API_KEY ?? "")}&sessionId=${encodeURIComponent(id)}`;

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  // sendBeacon posts text/plain, so parse the raw body ourselves.
  try {
    const v: unknown = JSON.parse(await req.text());
    return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
