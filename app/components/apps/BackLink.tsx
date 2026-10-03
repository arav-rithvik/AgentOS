import Link from "next/link";

export function BackLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-block text-xs font-medium text-neutral-500 hover:text-neutral-800 ${className}`}
    >
      ← AgentOS
    </Link>
  );
}

/** Light-theme page shell: overrides the dark AgentOS globals. */
export function LightPage({
  bg = "#ffffff",
  children,
  className = "",
}: {
  bg?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex-1 min-h-screen text-neutral-900 ${className}`}
      style={{ background: bg, colorScheme: "light" }}
    >
      {children}
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "2026-09-28" -> "Sep 28" (timezone-free, hydration-safe). */
export function shortDate(iso: string) {
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

/** "2026-10-03" -> "Saturday, Oct 3" */
export function longDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[wd]}, ${MONTHS[m - 1]} ${d}`;
}

/** "2026-10-03T19:00" -> "7:00 PM" */
export function clock(iso: string) {
  const t = iso.slice(11, 16);
  if (!t) return "";
  const [h, min] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(min).padStart(2, "0")} ${ampm}`;
}
