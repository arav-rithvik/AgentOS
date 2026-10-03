"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser client for Realtime. Anon key only; RLS allows reads, writes go through /api/run.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const LIVE = Boolean(URL && KEY);

let sb: SupabaseClient | null = null;
export function browser() {
  if (!sb) sb = createClient(URL!, KEY!);
  return sb;
}

/** Map free text from the CLI to one of the engine's preset tasks. */
export function toPreset(prompt: string): "internships" | "study" | "weekend" | null {
  const p = prompt.toLowerCase();
  if (/intern|job|board/.test(p)) return "internships";
  if (/study|due|deadline|block/.test(p)) return "study";
  if (/hair|cut|concert|ticket|flight|weekend|tomorrow/.test(p)) return "weekend";
  return null;
}

/** ISO (UTC) -> "YYYY-MM-DDTHH:MM" in Pacific time, the format the Mac's sites use. */
export function local(iso: string, addMin = 0) {
  const d = new Date(new Date(iso).getTime() + addMin * 60000);
  return d.toLocaleString("sv-SE", { timeZone: "America/Los_Angeles" }).replace(" ", "T").slice(0, 16);
}

const BOARD: Record<string, string> = { a: "Northwind Jobs", b: "Lattice Careers", c: "Gradhire", d: "InternStack", e: "Sprout Board" };
const when = (iso: unknown) => {
  const d = new Date(String(iso));
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-US", { timeZone: "America/Los_Angeles", weekday: "short", hour: "numeric", minute: "2-digit" });
};

/** One plain-English line for an action_log row. */
export function describe(action: string, args: Record<string, unknown>, r: { status: string; count: number | null; error?: string }) {
  if (r.status === "error") return `Failed: ${r.error ?? "error"}`;
  const n = r.count ?? 0;
  switch (action) {
    case "jobboard.jobs.list": return `Searched ${BOARD[String(args.board)] ?? "a board"}: ${n} found`;
    case "docs.create": return `Wrote “${args.title}” to a new doc`;
    case "docs.list": return `Read your docs: ${n}`;
    case "calendar.list": return `Read your calendar: ${n} items`;
    case "calendar.create": return `Added “${args.title}” · ${when(args.start)}`;
    case "flights.search": return `Searched flights ${args.from ?? ""}→${args.to ?? ""}: ${n} found`;
    case "flights.book": return "Booked the flight";
    case "salon.slots.list": return `Checked salon openings: ${n} found`;
    case "salon.book": return "Booked the haircut";
    case "concerts.search": return `Searched concerts: ${n} found`;
    case "concerts.book": return `Booked ${args.qty ?? ""} concert tickets`.replace("  ", " ");
    default: return action;
  }
}
