import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { seedObjects, type Obj } from "@/components/data";
import { CalendarSite, CutsSite, DocsSite, MailSite } from "@/components/web/Sites";

// One site, full window, like a real website. The cloud Chrome (Steel) loads these.
// ?s = base64url(JSON Obj[]) of objects the agent added or changed; ?hl = key to flash.
const SITES = { mail: MailSite, docs: DocsSite, calendar: CalendarSite, cuts: CutsSite } as const;
const TITLES: Record<keyof typeof SITES, string> = {
  mail: "Inbox - rithvik@agentos.dev - Mail",
  docs: "Docs",
  calendar: "Calendar - October 2026",
  cuts: "Fade & Co. | Book Online",
};
type SiteId = keyof typeof SITES;
const isSite = (s: string): s is SiteId => s in SITES;

export async function generateMetadata({ params }: { params: Promise<{ site: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const { site } = await params;
  return { title: isSite(site) ? TITLES[site] : "Not found", robots: { index: false } };
}

function decode(s: string | string[] | undefined): Obj[] {
  if (typeof s !== "string" || !s) return [];
  try {
    const v: unknown = JSON.parse(Buffer.from(s, "base64url").toString("utf8"));
    return Array.isArray(v) ? (v.filter((o) => o && typeof o === "object" && typeof o.key === "string" && typeof o.type === "string") as Obj[]) : [];
  } catch {
    return [];
  }
}

/** Seed, with any changed object replaced in place and new ones appended (same order the Mac sees). */
function merge(extra: Obj[]): Obj[] {
  const byKey = new Map(extra.map((o) => [o.key, o]));
  const out = seedObjects.map((o) => byKey.get(o.key) ?? o);
  const seen = new Set(seedObjects.map((o) => o.key));
  for (const o of extra) if (!seen.has(o.key)) out.push(o);
  return out;
}

export default async function WebSitePage({ params, searchParams }: { params: Promise<{ site: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { site } = await params;
  if (!isSite(site)) notFound();
  const q = await searchParams;
  const objects = merge(decode(q.s));
  const hl = typeof q.hl === "string" && q.hl ? q.hl : undefined;
  const Site = SITES[site];
  return (
    <div className="@container fixed inset-0 overflow-hidden" style={{ background: "#fff", color: "#1f1f1f", colorScheme: "light" }}>
      <Site objects={objects} hl={hl} hlT={hl ? 1 : undefined} />
    </div>
  );
}
