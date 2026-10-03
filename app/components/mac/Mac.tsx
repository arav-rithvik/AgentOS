"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Obj } from "../data";
import type { Site } from "../useRun";
import Dock from "./Dock";
import { CalendarSite, CutsSite, DocsSite, MailSite } from "../web/Sites";
import { MS, P } from "../web/icons";

type Tab = Site | "newtab";

const WALLPAPER = "/mac/wallpaper-gg.jpg";
const SITES: Record<Site, { title: string; host: string; path: string; short: string }> = {
  mail: { title: "Inbox (2) - rithvik@agentos.dev - Mail", host: "mail.agentos.dev", path: "/mail/u/0/#inbox", short: "Mail" },
  docs: { title: "Docs", host: "docs.agentos.dev", path: "/document/u/0/", short: "Docs" },
  calendar: { title: "Calendar - October 2026", host: "calendar.agentos.dev", path: "/r/week/2026/10/3", short: "Calendar" },
  cuts: { title: "Fade & Co. | Book Online", host: "fadeandco.com", path: "/book", short: "Fade & Co." },
  jobs: { title: "Internships | Northwind Jobs", host: "northwindjobs.com", path: "/internships", short: "Northwind Jobs" },
};
const ORDER: Site[] = ["mail", "docs", "calendar", "cuts", "jobs"];
const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';

const APPLE = "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";

export function Favicon({ site, s = 16 }: { site: Tab; s?: number }) {
  if (site === "mail")
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
        <rect x="1" y="3" width="14" height="10.5" rx="2" fill="#d93025" />
        <path d="M2.6 4.8 8 8.9l5.4-4.1" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  if (site === "docs")
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
        <path d="M3 1.5h6.5L13 5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11.5a1 1 0 0 1 1-1Z" fill="#4285f4" />
        <path d="M9.5 1.5 13 5H10.5a1 1 0 0 1-1-1Z" fill="#a1c2fa" />
        <path d="M4.5 8h6M4.5 10h6M4.5 12h4" stroke="#fff" strokeWidth="1.1" />
      </svg>
    );
  if (site === "calendar")
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
        <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" fill="#fff" stroke="#1a73e8" strokeWidth="1.4" />
        <path d="M1.5 4a2.5 2.5 0 0 1 2.5-2.5h8A2.5 2.5 0 0 1 14.5 4v1.5h-13Z" fill="#1a73e8" />
        <text x="8" y="12.9" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#1a73e8" fontFamily="Arial, sans-serif">
          3
        </text>
      </svg>
    );
  if (site === "cuts")
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
        <rect width="16" height="16" rx="3.5" fill="#141414" />
        <text x="8" y="12" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#e8c27a" fontFamily="Georgia, serif">
          F
        </text>
      </svg>
    );
  if (site === "jobs")
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
        <rect width="16" height="16" rx="3.5" fill="#2563eb" />
        <path d="M4.5 11.5v-7l7 7v-7" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  return null;
}

/** Chrome's icon, drawn clean. */
export function ChromeLogo({ s = 48 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" aria-hidden>
      <ChromeMarks />
    </svg>
  );
}

function Btn({ d, label, dim, onClick, s = 20 }: { d: string; label: string; dim?: boolean; onClick?: () => void; s?: number }) {
  return (
    <button aria-label={label} onClick={onClick} className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[rgba(31,31,31,.08)]" style={{ color: dim ? "#b4b7bb" : "#474747" }}>
      <MS d={d} s={s} />
    </button>
  );
}

function clockText() {
  const d = new Date();
  const wd = d.toLocaleDateString("en-US", { weekday: "short" });
  const mo = d.toLocaleDateString("en-US", { month: "short" });
  const h = d.getHours();
  const p2 = (n: number) => String(n).padStart(2, "0");
  return `${wd} ${mo} ${d.getDate()} ${h % 12 || 12}:${p2(d.getMinutes())}:${p2(d.getSeconds())} ${h >= 12 ? "PM" : "AM"}`;
}

export default function Mac({ objects, live }: { objects: Obj[]; live: { app: Site; key?: string; t: number } | null }) {
  const [open, setOpen] = useState(true);
  const [max, setMax] = useState(true);
  const [pos, setPos] = useState({ x: 70, y: 52 });
  const [tabs, setTabs] = useState<Tab[]>(["mail", "calendar", "docs"]);
  const [active, setActive] = useState<Tab>("mail");
  const [clock, setClock] = useState("Sat Oct 3 3:38:02 PM");
  const win = useRef<HTMLDivElement>(null);
  const popNext = useRef(false);

  useEffect(() => {
    const f = () => setClock(clockText());
    f();
    const i = setInterval(f, 1000);
    return () => clearInterval(i);
  }, []);

  const openWin = () =>
    setOpen((o) => {
      if (!o) popNext.current = true;
      return true;
    });

  // Pop only when the window goes from closed to open — never on tab switches or re-renders.
  useLayoutEffect(() => {
    if (open && popNext.current && win.current) {
      popNext.current = false;
      win.current.animate(
        [
          { opacity: 0, transform: "scale(0.96) translateY(8px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 240, easing: "cubic-bezier(0.2, 0.9, 0.3, 1.1)" },
      );
    }
  }, [open]);

  const go = (s: Tab) => {
    // A site opened from a New Tab page navigates that tab, like Chrome.
    setTabs((t) => {
      if (t.includes(s)) return t;
      if (active === "newtab" && s !== "newtab" && t.includes("newtab")) return t.map((x) => (x === "newtab" ? s : x));
      return [...t, s];
    });
    setActive(s);
    openWin();
  };

  // The agent works in data on the AgentOS side; this computer just shows each change land.
  useEffect(() => {
    if (live) go(live.app);
  }, [live]);

  const closeTab = (t: Tab) => {
    const i = tabs.indexOf(t);
    const next = tabs.filter((x) => x !== t);
    if (!next.length) {
      // Closing the last tab closes the window; Chrome reopens to a New Tab.
      setOpen(false);
      setTabs(["newtab"]);
      setActive("newtab");
      return;
    }
    setTabs(next);
    if (t === active) setActive(next[Math.min(i, next.length - 1)]);
  };

  const drag = (e: React.MouseEvent) => {
    if (max) return;
    const sx = e.clientX - pos.x;
    const sy = e.clientY - pos.y;
    const move = (ev: MouseEvent) => setPos({ x: ev.clientX - sx, y: Math.max(28, ev.clientY - sy) });
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const hl = live && live.app === active ? live.key : undefined;
  const site = active === "newtab" ? null : SITES[active];
  const ai = tabs.indexOf(active);
  const frame = "#dfe3e7";
  const geo = max ? { left: 8, top: 31, right: 8, bottom: 78 } : { left: pos.x, top: pos.y, width: "78%", height: 470 };

  return (
    <div className="relative h-[680px] select-none overflow-hidden [&_[role=button]]:cursor-pointer [&_button]:cursor-pointer" style={{ borderRadius: 14, backgroundImage: `url(${WALLPAPER})`, backgroundSize: "cover", backgroundPosition: "center", fontFamily: SANS, boxShadow: "0 0 0 1px #2a2a2a", WebkitFontSmoothing: "antialiased" }}>
      {/* menu bar */}
      <div className="absolute inset-x-0 top-0 z-[80] flex h-[24px] items-center justify-between pl-[14px] pr-[10px] text-[13px] text-white" style={{ background: "rgba(20,24,40,.16)", backdropFilter: "blur(24px) saturate(1.5)", WebkitBackdropFilter: "blur(24px) saturate(1.5)", textShadow: "0 0 6px rgba(0,0,0,.25)", letterSpacing: "-0.08px" }}>
        <div className="flex h-[24px] min-w-0 flex-1 flex-wrap items-center overflow-hidden whitespace-nowrap">
          <svg width="14" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="mr-[13px] mt-[3px] shrink-0">
            <path d={APPLE} />
          </svg>
          <span className="h-[24px] shrink-0 px-[9px] font-semibold leading-[24px]">{open ? "Chrome" : "Finder"}</span>
          {(open ? ["File", "Edit", "View", "History", "Bookmarks", "Profiles", "Tab", "Window", "Help"] : ["File", "Edit", "View", "Go", "Window", "Help"]).map((m) => (
            <span key={m} className="hidden h-[24px] shrink-0 px-[9px] leading-[24px] sm:inline">
              {m}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-[14px] whitespace-nowrap pl-3">
          {/* wifi */}
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
            <path d="M8 2.1c2.3 0 4.4.9 6 2.4l1-1A9.6 9.6 0 0 0 8 .7 9.6 9.6 0 0 0 1 3.5l1 1a8.3 8.3 0 0 1 6-2.4Z" />
            <path d="M8 5.2c1.4 0 2.6.5 3.6 1.3l1-1A6.8 6.8 0 0 0 8 3.8c-1.8 0-3.4.7-4.6 1.7l1 1c1-.8 2.2-1.3 3.6-1.3Z" />
            <path d="M8 8.2c.6 0 1.1.2 1.5.5L8 10.9 6.5 8.7c.4-.3.9-.5 1.5-.5Z" />
          </svg>
          {/* battery */}
          <svg width="26" height="13" viewBox="0 0 26 13" fill="none" aria-hidden>
            <rect x=".75" y=".75" width="21.5" height="11.5" rx="3.4" stroke="currentColor" strokeOpacity=".45" strokeWidth="1.2" />
            <rect x="2.4" y="2.4" width="15.5" height="8.2" rx="1.9" fill="currentColor" />
            <path d="M24 4.6v3.8" stroke="currentColor" strokeOpacity=".45" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {/* spotlight */}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <circle cx="6.6" cy="6.6" r="5" />
            <path d="m10.4 10.4 4.3 4.3" strokeLinecap="round" />
          </svg>
          {/* control center */}
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden>
            <rect x=".75" y=".75" width="14.5" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="12.7" cy="3.25" r="1.6" fill="currentColor" />
            <rect x=".75" y="8.25" width="14.5" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="3.3" cy="10.75" r="1.6" fill="currentColor" />
          </svg>
          <span className="pl-[2px] tabular-nums" suppressHydrationWarning>
            {clock}
          </span>
        </div>
      </div>

      {open && (
        <div ref={win} className="absolute z-20 flex flex-col overflow-hidden" style={{ ...geo, borderRadius: 11, background: "#fff", color: "#1f1f1f", boxShadow: "0 0 0 0.5px rgba(0,0,0,.55), inset 0 0 0 0.5px rgba(255,255,255,.35), 0 24px 64px rgba(0,0,0,.42), 0 6px 18px rgba(0,0,0,.22)", fontFamily: SANS }}>
          {/* tab strip */}
          <div onMouseDown={drag} onDoubleClick={() => setMax((m) => !m)} className="flex h-[42px] shrink-0 items-end pr-[6px]" style={{ background: frame }}>
            <div className="group/tl flex h-full shrink-0 items-center gap-[8px] pl-[13px] pr-[12px]" onMouseDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
              {(
                [
                  ["#ff5f57", "#e0443e", "Close", () => { setOpen(false); setTabs(["newtab"]); setActive("newtab"); }, "M3.5 3.5l5 5M8.5 3.5l-5 5"],
                  ["#febc2e", "#dea123", "Minimize", () => setOpen(false), "M2.8 6h6.4"],
                  ["#28c840", "#1aab29", "Zoom", () => setMax((m) => !m), "M3.4 4.3v4.3h4.3ZM8.6 7.7V3.4H4.3Z"],
                ] as const
              ).map(([bg, ring, label, fn, d]) => (
                <button key={label} aria-label={label} onClick={fn} className="flex h-[12px] w-[12px] items-center justify-center rounded-full" style={{ background: bg, boxShadow: `inset 0 0 0 0.5px ${ring}` }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" className="opacity-0 group-hover/tl:opacity-100" aria-hidden>
                    <path d={d} stroke="rgba(0,0,0,.55)" strokeWidth="1.1" fill={label === "Zoom" ? "rgba(0,0,0,.55)" : "none"} strokeLinecap="round" />
                  </svg>
                </button>
              ))}
            </div>
            <button onMouseDown={(e) => e.stopPropagation()} className="mb-[4px] mr-[6px] flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] hover:bg-[rgba(31,31,31,.08)]" style={{ color: "#474747" }} aria-label="Search tabs">
              <MS d={P.down} s={20} />
            </button>
            <div className="flex h-[34px] min-w-0 flex-1 items-end">
              {tabs.map((t, i) => {
                const on = t === active;
                const sep = i > 0 && !on && i - 1 !== ai;
                const title = t === "newtab" ? "New Tab" : SITES[t].title;
                return (
                  <div key={t} className="group relative flex h-[34px] min-w-0 items-center" style={{ flex: "0 1 240px", zIndex: on ? 2 : 1 }}>
                    {sep && <span className="absolute left-0 top-[9px] h-[16px] w-px" style={{ background: "#a9acb0" }} />}
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => setActive(t)}
                      className={`relative mx-[1px] flex h-full min-w-0 flex-1 items-center gap-[8px] pl-[12px] pr-[8px] text-left ${on ? "" : "mb-[4px] mt-[0px] h-[28px] rounded-[8px] hover:bg-[rgba(31,31,31,.07)]"}`}
                      style={on ? { background: "#fff", borderRadius: "10px 10px 0 0" } : undefined}
                    >
                      {on && (
                        <>
                          <span className="pointer-events-none absolute bottom-0 left-[-10px] h-[10px] w-[10px]" style={{ background: "radial-gradient(circle at 0 0, transparent 9.5px, #fff 10px)" }} />
                          <span className="pointer-events-none absolute bottom-0 right-[-10px] h-[10px] w-[10px]" style={{ background: "radial-gradient(circle at 100% 0, transparent 9.5px, #fff 10px)" }} />
                        </>
                      )}
                      {t !== "newtab" && (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                          <Favicon site={t} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-[12px]" style={{ color: on ? "#1f1f1f" : "#3c3c3c", maskImage: "linear-gradient(90deg, #000 calc(100% - 18px), transparent)", WebkitMaskImage: "linear-gradient(90deg, #000 calc(100% - 18px), transparent)" }}>
                        {title}
                      </span>
                      <span
                        role="button"
                        aria-label="Close tab"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(t);
                        }}
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full hover:bg-[rgba(31,31,31,.1)] ${on ? "" : "opacity-0 group-hover:opacity-100"}`}
                        style={{ color: "#474747" }}
                      >
                        <MS d={P.close} s={14} />
                      </span>
                    </button>
                  </div>
                );
              })}
              <button onMouseDown={(e) => e.stopPropagation()} onClick={() => go("newtab")} className="mb-[4px] ml-[4px] flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full hover:bg-[rgba(31,31,31,.08)]" style={{ color: "#474747" }} aria-label="New tab">
                <MS d={P.add} s={20} />
              </button>
            </div>
          </div>

          {/* toolbar */}
          <div className="flex h-[44px] shrink-0 items-center gap-[2px] px-[6px]" style={{ background: "#fff" }}>
            <Btn d={P.back} label="Back" />
            <Btn d={P.fwd} label="Forward" dim />
            <Btn d={P.reload} label="Reload" />
            <button aria-label="Split view" className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full hover:bg-[rgba(31,31,31,.08)]" style={{ color: "#474747" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <rect x="2.5" y="4" width="15" height="12" rx="2.2" />
                <path d="M10 4v12" />
              </svg>
            </button>
            <div className="mx-[6px] flex h-[34px] min-w-0 flex-1 items-center rounded-full pl-[5px] pr-[4px] hover:bg-[#e1e6ee]" style={{ background: "#e9eef6" }}>
              <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full hover:bg-[rgba(31,31,31,.08)]" style={{ color: "#474747" }}>
                <MS d={site ? P.tune : P.search} s={site ? 18 : 18} />
              </span>
              <span className="ml-[8px] min-w-0 flex-1 truncate text-[14px]" style={{ letterSpacing: "0.1px" }}>
                {site ? (
                  <>
                    <span style={{ color: "#1f1f1f" }}>{site.host}</span>
                    <span style={{ color: "#5e5e5e" }}>{site.path}</span>
                  </>
                ) : (
                  <span style={{ color: "#5e5e5e" }}>Ask Google or type a URL</span>
                )}
              </span>
              {site && (
                <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full" style={{ color: "#474747" }}>
                  <MS d={P.star} s={18} />
                </span>
              )}
            </div>
            <Btn d={P.ext} label="Extensions" />
            <button aria-label="Profile" className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full hover:bg-[rgba(31,31,31,.08)]">
              <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full text-[12px] font-medium text-white" style={{ background: "linear-gradient(135deg,#0f9d8a,#0b6e63)" }}>
                R
              </span>
            </button>
            <Btn d={P.more} label="Customize and control Google Chrome" />
          </div>

          {/* bookmarks bar */}
          <div className="flex h-[28px] shrink-0 items-center gap-[2px] px-[8px]" style={{ background: "#fff", borderBottom: "1px solid #e1e3e6" }}>
            {ORDER.map((s) => (
              <button key={s} onClick={() => go(s)} className="flex h-[24px] items-center gap-[6px] rounded-full px-[8px] text-[12px] hover:bg-[rgba(31,31,31,.07)]" style={{ color: "#1f1f1f" }}>
                <Favicon site={s} s={14} />
                {SITES[s].short}
              </button>
            ))}
            <span className="ml-auto flex items-center gap-[6px] pr-[6px] text-[12px]" style={{ color: "#1f1f1f" }}>
              <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
                <path d="M1.5 4a1.5 1.5 0 0 1 1.5-1.5h3.2l1.5 1.6H13a1.5 1.5 0 0 1 1.5 1.5V12A1.5 1.5 0 0 1 13 13.5H3A1.5 1.5 0 0 1 1.5 12Z" fill="none" stroke="#474747" strokeWidth="1.3" />
              </svg>
              All Bookmarks
            </span>
          </div>

          {/* page */}
          <div className="@container relative min-h-0 flex-1 overflow-hidden" style={{ background: "#fff" }}>
            {active === "newtab" && (
              <div className="relative flex h-full flex-col items-center overflow-auto" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.12), rgba(0,0,0,.18)), url(${WALLPAPER})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute right-[16px] top-[10px] flex items-center gap-[14px] text-[13px] text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,.4)", fontFamily: 'Arial, sans-serif' }}>
                  <button onClick={() => go("mail")} className="hover:underline">Gmail</button>
                  <span role="button" className="hover:underline">Images</span>
                  <span role="button" className="flex h-[36px] w-[36px] items-center justify-center rounded-full hover:bg-[rgba(255,255,255,.18)]">
                    <MS d={P.apps} s={22} c="#fff" />
                  </span>
                  <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-[14px] font-medium" style={{ background: "linear-gradient(135deg,#0f9d8a,#0b6e63)", boxShadow: "0 0 0 2px rgba(255,255,255,.8)" }}>
                    R
                  </span>
                </div>
                <div className="mt-[11%] select-none text-[84px] font-medium leading-none text-white" style={{ fontFamily: '"Product Sans", "Google Sans", Arial, sans-serif', letterSpacing: "-3px", textShadow: "0 2px 12px rgba(0,0,0,.25)" }}>
                  Google
                </div>
                <div className="mt-[26px] flex h-[52px] w-[584px] max-w-[86%] items-center gap-[10px] rounded-full bg-white pl-[14px] pr-[10px] text-[16px]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,.18)", color: "#5e5e5e", fontFamily: 'Arial, sans-serif' }}>
                  <MS d={P.add} s={22} c="#474747" />
                  <span className="flex-1">Ask Google</span>
                  <svg width="22" height="22" viewBox="0 -960 960 960" aria-hidden>
                    <path fill="#4285f4" d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Z" />
                    <path fill="#34a853" d="M440-120v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320v80q-14 0-27-1.5t-13-1.5v123Z" />
                    <path fill="#ea4335" d="M480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-40v-200Z" />
                  </svg>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                    <path d="M4 9V7a3 3 0 0 1 3-3h2" stroke="#ea4335" />
                    <path d="M15 4h2a3 3 0 0 1 3 3v2" stroke="#fbbc04" />
                    <path d="M4 15v2a3 3 0 0 0 3 3h2" stroke="#34a853" />
                    <circle cx="12" cy="12" r="3.2" stroke="#4285f4" />
                    <circle cx="18" cy="18" r="1.6" fill="#4285f4" stroke="none" />
                  </svg>
                  <span className="ml-[2px] flex h-[36px] items-center gap-[6px] rounded-full px-[14px] text-[14px] font-medium" style={{ background: "#f1f3f4", color: "#1f1f1f" }}>
                    <MS d={P.search} s={18} c="#1f1f1f" />
                    AI Mode
                  </span>
                </div>
                <div className="mt-[28px] flex flex-wrap justify-center gap-x-1 gap-y-1">
                  {ORDER.map((s) => (
                    <button key={s} onClick={() => go(s)} className="flex w-[104px] flex-col items-center gap-[8px] rounded-xl py-3 hover:bg-[rgba(255,255,255,.16)]">
                      <span className="flex h-[48px] w-[48px] items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,.92)" }}>
                        <Favicon site={s} s={24} />
                      </span>
                      <span className="w-full truncate px-2 text-center text-[13px] text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,.5)" }}>
                        {SITES[s].short}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {active === "mail" && <MailSite objects={objects} hl={hl} hlT={live?.t} />}
            {active === "docs" && <DocsSite objects={objects} hl={hl} hlT={live?.t} />}
            {active === "calendar" && <CalendarSite objects={objects} hl={hl} hlT={live?.t} />}
            {active === "cuts" && <CutsSite objects={objects} hl={hl} hlT={live?.t} />}
            {active === "jobs" && <iframe src="/boards/a" title="Northwind Jobs" className="h-full w-full" style={{ border: 0 }} />}
          </div>
        </div>
      )}

      <Dock
        apps={[
          { id: "finder", title: "Finder", icon: <img src="/mac/finder.png" alt="" draggable={false} className="h-full w-full" />, open: true },
          { id: "chrome", title: "Google Chrome", icon: <img src="/mac/chrome.png" alt="" draggable={false} className="h-full w-full" />, open },
        ]}
        onOpen={(id) => {
          if (id === "chrome") openWin();
        }}
      />
    </div>
  );
}

function ChromeMarks() {
  // Three 120° sectors around a white ring and blue center.
  const r = 21;
  const pt = (deg: number) => [24 + r * Math.cos((deg * Math.PI) / 180), 24 + r * Math.sin((deg * Math.PI) / 180)];
  const sector = (a: number, b: number) => {
    const [x1, y1] = pt(a);
    const [x2, y2] = pt(b);
    return `M24 24L${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}Z`;
  };
  return (
    <>
      <path d={sector(-150, -30)} fill="#ea4335" />
      <path d={sector(-30, 90)} fill="#fbbc04" />
      <path d={sector(90, 210)} fill="#34a853" />
      <circle cx="24" cy="24" r="9.6" fill="#fff" />
      <circle cx="24" cy="24" r="7.6" fill="#1a73e8" />
    </>
  );
}
