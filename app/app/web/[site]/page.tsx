import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Web from "./Web";

// One site, full window, like a real website. A screen agent (e.g. Grok Bot) uses these for the race:
// book a haircut on /web/cuts, then add it on /web/calendar. Changes persist in this browser (?reset=1 clears).
const TITLES = {
  mail: "Inbox - rithvik@agentos.dev - Mail",
  docs: "Docs",
  calendar: "Calendar - October 2026",
  cuts: "Fade & Co. | Book Online",
} as const;
type SiteId = keyof typeof TITLES;
const isSite = (s: string): s is SiteId => s in TITLES;

export async function generateMetadata({ params }: { params: Promise<{ site: string }> }): Promise<Metadata> {
  const { site } = await params;
  return { title: isSite(site) ? TITLES[site] : "Not found", robots: { index: false } };
}

export default async function WebSitePage({ params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  if (!isSite(site)) notFound();
  return (
    <div className="@container fixed inset-0 overflow-hidden" style={{ background: "#fff", color: "#1f1f1f", colorScheme: "light" }}>
      <Web site={site} />
    </div>
  );
}
