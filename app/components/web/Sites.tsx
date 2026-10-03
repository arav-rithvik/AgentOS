"use client";

import { useEffect, useRef, useState } from "react";
import { ME, SHOP, TODAY, type Obj } from "../data";
import { MS, P } from "./icons";

type P_ = { objects: Obj[]; hl?: string; hlT?: number };
const font = { fontFamily: '"Google Sans", Roboto, -apple-system, "Helvetica Neue", Arial, sans-serif' };
const textFont = { fontFamily: 'Roboto, -apple-system, "Helvetica Neue", Arial, sans-serif' };
const fl = (hl: string | undefined, key: string) => (hl === key ? "flash-light" : "");

/** Scroll only the given container (never the page) so the flashed item is visible. */
function useRevealFlash(box: React.RefObject<HTMLElement | null>, hl?: string, hlT?: number) {
  useEffect(() => {
    const c = box.current;
    if (!c || !hl) return;
    const id = requestAnimationFrame(() => {
      const el = c.querySelector<HTMLElement>(".flash-light");
      if (!el) return;
      const cr = c.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      if (er.top < cr.top || er.bottom > cr.bottom) c.scrollTop += er.top - cr.top - cr.height / 2 + er.height / 2;
    });
    return () => cancelAnimationFrame(id);
  }, [box, hl, hlT]);
}

const COLORS = ["#7b1fa2", "#e8710a", "#1e8e3e", "#d93025", "#1a73e8", "#a142f4", "#12b5cb"];
function colorFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

function Avatar({ name = ME.name, s = 32 }: { name?: string; s?: number }) {
  const me = name === ME.name;
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full font-medium text-white" style={{ width: s, height: s, fontSize: s * 0.44, background: me ? "linear-gradient(135deg,#0f9d8a,#0b6e63)" : colorFor(name) }}>
      {name[0]}
    </span>
  );
}

function IconBtn({ d, s = 20, c = "#444746", label }: { d: string; s?: number; c?: string; label?: string }) {
  return (
    <span role="button" aria-label={label} className="flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-[rgba(68,71,70,.08)]" style={{ color: c }}>
      <MS d={d} s={s} />
    </span>
  );
}

function fmt(iso: string) {
  if (!iso.includes("T")) return iso;
  const [d, t] = iso.split("T");
  const [h, m] = t.split(":").map(Number);
  const day = new Date(`${d}T12:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return `${day} · ${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

/* ───────────────────────────── Mail ───────────────────────────── */

export function MailSite({ objects, hl, hlT }: P_) {
  const mails = objects.filter((o): o is Extract<Obj, { type: "mail" }> => o.type === "mail");
  const hlMail = mails.find((m) => m.key === hl);
  const [folder, setFolder] = useState<"inbox" | "sent">("inbox");
  const [sel, setSel] = useState<string | null>(null);
  const f = hlMail ? hlMail.data.folder : folder;
  const open = mails.find((m) => m.key === (hlMail ? hl : sel));
  const list = mails.filter((m) => m.data.folder === f);
  const unread = mails.filter((m) => m.data.folder === "inbox" && m.data.unread).length;
  const nav: [string, string, "inbox" | "sent" | null, number][] = [
    [P.inbox, "Inbox", "inbox", unread],
    [P.star, "Starred", null, 0],
    [P.clock, "Snoozed", null, 0],
    [P.send, "Sent", "sent", 0],
    [P.draft, "Drafts", null, 0],
    [P.archive, "All Mail", null, 0],
  ];
  return (
    <div className="flex h-full flex-col" style={{ ...textFont, background: "#f6f8fc", color: "#1f1f1f" }}>
      <div className="flex h-[56px] shrink-0 items-center gap-1 pl-2 pr-3">
        <IconBtn d={P.menu} s={22} label="Main menu" />
        <span className="mr-6 flex items-center gap-2 pl-1 text-[20px]" style={{ ...font, color: "#444746" }}>
          <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden>
            <rect x="1" y="1.5" width="24" height="17" rx="3" fill="#d93025" />
            <path d="M3.5 4.5 13 11.4l9.5-6.9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
          </svg>
          Mail
        </span>
        <div className="flex h-[46px] min-w-0 max-w-[640px] flex-1 items-center gap-3 rounded-full px-3 text-[15px]" style={{ background: "#e9eef6", color: "#444746" }}>
          <MS d={P.search} s={22} />
          <span className="truncate">Search mail</span>
          <span className="ml-auto">
            <MS d={P.tune} s={20} />
          </span>
        </div>
        <div className="ml-auto flex items-center">
          <IconBtn d={P.help} s={22} />
          <IconBtn d={P.settings} s={22} />
          <IconBtn d={P.apps} s={22} />
          <span className="ml-1">
            <Avatar s={32} />
          </span>
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="w-[196px] shrink-0 pr-3 text-[14px]">
          <div role="button" className="mb-3 ml-2 inline-flex h-[56px] cursor-pointer items-center gap-3 rounded-2xl pl-4 pr-6 text-[14px] font-medium transition-shadow hover:shadow-[0_1px_3px_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)]" style={{ ...font, background: "#c2e7ff", color: "#001d35" }}>
            <MS d={P.edit} s={22} />
            Compose
          </div>
          {nav.map(([icon, l, k, c]) => {
            const on = k !== null && f === k && !open;
            const sel_ = k !== null && f === k;
            return (
              <button
                key={l}
                onClick={() => {
                  if (k) {
                    setFolder(k);
                    setSel(null);
                  }
                }}
                className="flex h-[32px] w-full items-center gap-4 rounded-r-full pl-6 pr-3 text-left hover:bg-[#eaebef]"
                style={{ background: sel_ ? "#d3e3fd" : undefined, fontWeight: sel_ || (on && c) ? 700 : 400, color: sel_ ? "#001d35" : "#1f1f1f" }}
              >
                <MS d={icon} s={20} c={sel_ ? "#001d35" : "#444746"} />
                <span className="flex-1">{l}</span>
                {c ? <span className="text-[12px] font-bold">{c}</span> : null}
              </button>
            );
          })}
          <div className="mt-4 flex items-center justify-between pl-6 pr-3 text-[15px]" style={{ ...font, color: "#1f1f1f" }}>
            Labels <MS d={P.add} s={20} c="#444746" />
          </div>
        </div>
        <div className="mb-3 mr-3 flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white">
          {open ? (
            <MailThread m={open} hl={hl} hlT={hlT} back={() => setSel(null)} />
          ) : (
            <>
              <div className="flex h-[48px] shrink-0 items-center gap-1 pl-3 pr-4" style={{ color: "#444746" }}>
                <span className="flex h-[36px] w-[36px] items-center justify-center">
                  <span className="h-[15px] w-[15px] rounded-[3px] border-2" style={{ borderColor: "#5f6368" }} />
                </span>
                <IconBtn d={P.reload} s={20} />
                <IconBtn d={P.more} s={20} />
                <span className="ml-auto text-[12px]" style={{ color: "#5e5e5e" }}>
                  1–{list.length} of {list.length}
                </span>
                <IconBtn d={P.left} s={20} c="#bdbdbd" />
                <IconBtn d={P.right} s={20} c="#bdbdbd" />
              </div>
              {f === "inbox" && (
                <div className="flex h-[52px] shrink-0 items-end border-b text-[14px]" style={{ borderColor: "#f1f3f4" }}>
                  {[
                    ["Primary", true],
                    ["Promotions", false],
                    ["Social", false],
                    ["Updates", false],
                  ].map(([t, on]) => (
                    <span key={t as string} role="button" className="relative flex h-full w-[170px] cursor-pointer hover:bg-[rgba(68,71,70,.06)] items-center gap-4 px-4 font-medium" style={{ color: on ? "#0b57d0" : "#444746" }}>
                      {on ? <MS d={P.inbox} s={20} /> : null}
                      {t as string}
                      {on && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t" style={{ background: "#0b57d0" }} />}
                    </span>
                  ))}
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-auto">
                {list.map((m) => (
                  <button
                    key={`${m.key}-${hl === m.key ? hlT : 0}`}
                    onClick={() => setSel(m.key)}
                    className={`group relative flex h-[40px] w-full items-center border-b pl-2 pr-4 text-left text-[14px] hover:z-[1] hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)] ${fl(hl, m.key)}`}
                    style={{ borderColor: "#f1f3f4", background: m.data.unread ? "#fff" : "#f2f6fc" }}
                  >
                    <span className="flex h-[36px] w-[32px] shrink-0 items-center justify-center">
                      <span className="h-[15px] w-[15px] rounded-[3px] border-2" style={{ borderColor: "#c4c7c5" }} />
                    </span>
                    <span className="flex w-[28px] shrink-0 justify-center" style={{ color: "#c4c7c5" }}>
                      <MS d={P.star} s={19} />
                    </span>
                    <span className="ml-2 w-[168px] shrink-0 truncate pr-4" style={{ fontWeight: m.data.unread ? 700 : 400, color: m.data.unread ? "#1f1f1f" : "#444746" }}>
                      {m.data.folder === "sent" ? `To: ${m.data.to.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase())}` : m.data.from}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      <span style={{ fontWeight: m.data.unread ? 700 : 400, color: m.data.unread ? "#1f1f1f" : "#444746" }}>{m.data.subject}</span>
                      <span style={{ color: "#5e5e5e" }}> - {m.data.body.replace(/\n+/g, " ")}</span>
                    </span>
                    <span className="ml-4 w-[64px] shrink-0 text-right text-[12px] group-hover:invisible" style={{ fontWeight: m.data.unread ? 700 : 400, color: m.data.unread ? "#1f1f1f" : "#5e5e5e" }}>
                      {m.data.at}
                    </span>
                    <span className="absolute right-3 hidden items-center group-hover:flex" style={{ color: "#444746" }}>
                      <IconBtn d={P.archive} s={20} />
                      <IconBtn d={P.trash} s={20} />
                      <IconBtn d={P.clock} s={20} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MailThread({ m, hl, hlT, back }: { m: Extract<Obj, { type: "mail" }>; hl?: string; hlT?: number; back: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[48px] shrink-0 items-center gap-1 px-3" style={{ color: "#444746" }}>
        <button onClick={back} aria-label="Back to Inbox">
          <IconBtn d={P.back} s={20} />
        </button>
        <IconBtn d={P.archive} s={20} />
        <IconBtn d={P.trash} s={20} />
        <IconBtn d={P.clock} s={20} />
        <IconBtn d={P.more} s={20} />
      </div>
      <div key={`${m.key}-${hlT}`} className={`min-h-0 flex-1 overflow-auto pb-6 pl-[72px] pr-8 ${fl(hl, m.key)}`}>
        <div className="flex items-center gap-3 pt-2 text-[22px]" style={{ ...font, color: "#1f1f1f" }}>
          {m.data.subject}
          <span className="rounded px-[6px] py-[1px] text-[12px]" style={{ background: "#ddd", color: "#444746", ...textFont }}>
            {m.data.folder === "sent" ? "Sent" : "Inbox"}
          </span>
        </div>
        <div className="relative mt-5 flex items-start gap-3">
          <span className="absolute -left-[56px] top-0">
            <Avatar name={m.data.from} s={40} />
          </span>
          <div className="min-w-0 flex-1 text-[14px]">
            <div className="flex items-baseline">
              <span className="font-bold">{m.data.from}</span>
              <span className="ml-1 text-[12px]" style={{ color: "#5e5e5e" }}>
                &lt;{m.data.email}&gt;
              </span>
              <span className="ml-auto text-[12px]" style={{ color: "#5e5e5e" }}>
                {m.data.at}
              </span>
            </div>
            <div className="text-[12px]" style={{ color: "#5e5e5e" }}>
              to {m.data.to === ME.email ? "me" : m.data.to} ▾
            </div>
            <p className="mt-5 whitespace-pre-wrap text-[14px] leading-[1.6]" style={{ color: "#222" }}>
              {m.data.body}
            </p>
            <div className="mt-8 flex gap-2">
              {["Reply", "Forward"].map((b) => (
                <span key={b} role="button" className="cursor-pointer rounded-full border px-5 py-2 text-[14px] font-medium hover:bg-[rgba(68,71,70,.08)]" style={{ borderColor: "#747775", color: "#444746", ...font }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Docs ───────────────────────────── */

const DocLogo = ({ s = 28 }: { s?: number }) => (
  <svg width={(s * 22) / 28} height={s} viewBox="0 0 22 28" aria-hidden>
    <path d="M0 2a2 2 0 0 1 2-2h12l8 8v18a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z" fill="#4285f4" />
    <path d="M14 0l8 8h-6a2 2 0 0 1-2-2z" fill="#a1c2fa" />
    <path d="M5 13h12M5 17h12M5 21h8" stroke="#fff" strokeWidth="1.8" />
  </svg>
);

export function DocsSite({ objects, hl, hlT }: P_) {
  const docs = objects.filter((o): o is Extract<Obj, { type: "doc" }> => o.type === "doc");
  const [sel, setSel] = useState<string | null>(null);
  const doc = docs.find((d) => d.key === (hl && docs.some((d) => d.key === hl) ? hl : sel));
  const box = useRef<HTMLDivElement>(null);
  useRevealFlash(box, hl, hlT);
  if (doc)
    return (
      <div className="flex h-full flex-col" style={{ ...textFont, background: "#f9fbfd", color: "#1f1f1f" }}>
        <div className="flex h-[58px] shrink-0 items-center gap-2 pl-3 pr-4">
          <button onClick={() => setSel(null)} className="px-1">
            <DocLogo s={34} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-[18px]" style={font}>
              <span className="truncate">{doc.data.title}</span>
              <span style={{ color: "#444746" }}>
                <MS d={P.star} s={18} />
              </span>
            </div>
            <div className="-ml-[6px] flex text-[14px]" style={{ color: "#1f1f1f" }}>
              {["File", "Edit", "View", "Insert", "Format", "Tools", "Extensions", "Help"].map((m) => (
                <span key={m} role="button" className="cursor-pointer rounded px-[6px] py-[1px] hover:bg-[#e8eaed]">
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <IconBtn d={P.clock} s={22} />
            <span role="button" className="flex h-[40px] cursor-pointer items-center gap-2 rounded-full pl-4 pr-5 text-[14px] font-medium hover:brightness-95" style={{ ...font, background: "#c2e7ff", color: "#001d35" }}>
              <MS d={P.lock} s={18} />
              Share
            </span>
            <Avatar s={32} />
          </div>
        </div>
        <div className="mx-2 mb-[6px] flex h-[40px] shrink-0 items-center gap-[2px] overflow-hidden rounded-full px-3 text-[14px]" style={{ background: "#edf2fa", color: "#444746" }}>
          <IconBtn d={P.search} s={18} />
          <IconBtn d={P.undo} s={18} />
          <IconBtn d={P.redo} s={18} />
          <span className="mx-1 h-5 w-px" style={{ background: "#c7c7c7" }} />
          <span className="px-2">100%</span>
          <span className="mx-1 h-5 w-px" style={{ background: "#c7c7c7" }} />
          <span className="px-2">Normal text ▾</span>
          <span className="mx-1 h-5 w-px" style={{ background: "#c7c7c7" }} />
          <span className="px-2">Arial ▾</span>
          <span className="mx-1 h-5 w-px" style={{ background: "#c7c7c7" }} />
          <span className="flex items-center gap-1 px-1">
            <span className="text-[16px]">−</span>
            <span className="rounded border px-[6px] text-[13px]" style={{ borderColor: "#747775" }}>
              11
            </span>
            <span className="text-[16px]">+</span>
          </span>
          <span className="mx-1 h-5 w-px" style={{ background: "#c7c7c7" }} />
          <span className="px-[7px] font-bold">B</span>
          <span className="px-[7px] italic" style={{ fontFamily: "Georgia, serif" }}>
            I
          </span>
          <span className="px-[7px] underline">U</span>
          <span className="px-[7px]">
            A<span className="block h-[3px] w-full" style={{ background: "#000", marginTop: -2 }} />
          </span>
        </div>
        <div className="flex h-[22px] shrink-0 items-end border-b px-[calc(50%-306px)]" style={{ borderColor: "#dadce0", background: "#f9fbfd" }}>
          <div className="relative h-[18px] w-[612px] bg-white" style={{ backgroundImage: "repeating-linear-gradient(90deg, #8a8a8a 0 1px, transparent 1px 48px)", backgroundSize: "48px 4px", backgroundRepeat: "repeat-x", backgroundPosition: "72px bottom" }} />
        </div>
        <div ref={box} className="min-h-0 flex-1 overflow-auto" style={{ background: "#f9fbfd" }}>
          <div key={`${doc.key}-${hlT}`} className={`mx-auto my-5 min-h-[792px] w-[612px] bg-white px-[72px] py-[64px] ${fl(hl, doc.key)}`} style={{ boxShadow: "0 0 0 0.75pt #d1d1d1, 0 2px 4px rgba(0,0,0,.08)" }}>
            <div className="text-[26px] leading-tight" style={{ fontFamily: "Arial, sans-serif" }}>
              {doc.data.title}
            </div>
            <div className="mt-4 whitespace-pre-wrap text-[14.6px] leading-[1.6]" style={{ fontFamily: "Arial, sans-serif", color: "#000" }}>
              {doc.data.body}
            </div>
          </div>
        </div>
      </div>
    );
  return (
    <div className="h-full overflow-auto" style={{ ...textFont, background: "#fff", color: "#1f1f1f" }}>
      <div className="flex h-[64px] items-center gap-2 pl-2 pr-4">
        <IconBtn d={P.menu} s={22} />
        <DocLogo s={32} />
        <span className="mr-6 pl-1 text-[22px]" style={{ ...font, color: "#444746" }}>
          Docs
        </span>
        <div className="flex h-[46px] min-w-0 max-w-[620px] flex-1 items-center gap-3 rounded-full px-4 text-[15px]" style={{ background: "#e9eef6", color: "#444746" }}>
          <MS d={P.search} s={22} />
          Search
        </div>
        <div className="ml-auto flex items-center">
          <IconBtn d={P.apps} s={22} />
          <Avatar s={32} />
        </div>
      </div>
      <div className="py-4" style={{ background: "#f1f3f4" }}>
        <div className="mx-auto max-w-[760px] px-8">
          <div className="text-[16px]" style={font}>
            Start a new document
          </div>
          <div className="mt-3 flex gap-5">
            {["Blank document", "Resume", "Letter", "Project proposal"].map((t, i) => (
              <div key={t}>
                <div className="flex h-[140px] w-[108px] items-center justify-center rounded border bg-white" style={{ borderColor: "#dadce0" }}>
                  {i === 0 ? (
                    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
                      <path d="M20 6h4v14h14v4H24v14h-4V24H6v-4h14Z" fill="#4285f4" />
                      <path d="M24 6h0v14h14v4" fill="none" />
                      <path d="M20 24h4v14h-4Z" fill="#34a853" />
                      <path d="M6 20h14v4H6Z" fill="#fbbc04" />
                      <path d="M24 20h14v4H24Z" fill="#ea4335" />
                    </svg>
                  ) : (
                    <div className="h-full w-full p-3">
                      <div className="h-2 w-12" style={{ background: i === 1 ? "#1a73e8" : "#5f6368" }} />
                      {Array.from({ length: 9 }, (_, j) => (
                        <div key={j} className="mt-[5px] h-[3px]" style={{ background: "#dadce0", width: `${60 + ((j * 23) % 40)}%` }} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-[13px] font-medium">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[760px] px-8 py-4">
        <div className="flex items-center text-[15px] font-medium" style={font}>
          Recent documents
          <span className="ml-auto text-[13px] font-normal" style={{ color: "#5e5e5e" }}>
            Owned by anyone ▾
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-5">
          {[...docs].reverse().map((d) => (
            <button key={d.key} onClick={() => setSel(d.key)} className="w-[160px] overflow-hidden rounded border text-left hover:border-[#4285f4]" style={{ borderColor: "#dadce0" }}>
              <div className="h-[150px] overflow-hidden border-b bg-white px-4 pt-4 text-[5.5px] leading-[1.5]" style={{ color: "#444", borderColor: "#dadce0" }}>
                <div className="mb-1 text-[8px]">{d.data.title}</div>
                {d.data.body}
              </div>
              <div className="px-3 py-2">
                <div className="truncate text-[13px] font-medium">{d.data.title}</div>
                <div className="mt-1 flex items-center gap-2 text-[12px]" style={{ color: "#5e5e5e" }}>
                  <DocLogo s={14} /> Opened 3:{(d.key.length * 7) % 60 || 10} PM
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Calendar ─────────────────────────── */

function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T12:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function CalendarSite({ objects, hl, hlT }: P_) {
  const events = objects.filter((o): o is Extract<Obj, { type: "event" }> => o.type === "event");
  const hlEv = events.find((e) => e.key === hl);
  const focus = hlEv ? hlEv.data.start.slice(0, 10) : TODAY;
  const dow = new Date(`${focus}T12:00`).getDay();
  const sunday = addDays(focus, -dow);
  const days = Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
  const PX = 44;
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (box.current && !hl) box.current.scrollTop = PX * 8.5;
  }, [hl]);
  useEffect(() => {
    const c = box.current;
    if (!c || !hlEv) return;
    const h = Number(hlEv.data.start.split("T")[1].split(":")[0]);
    c.scrollTop = Math.max(0, (h - 2.5) * PX);
  }, [hlEv, hlT]);
  const fd = new Date(`${focus}T12:00`);
  const monthLabel = fd.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  // mini month
  const first = new Date(fd.getFullYear(), fd.getMonth(), 1);
  const startPad = first.getDay();
  const dim = new Date(fd.getFullYear(), fd.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => i - startPad + 1);
  const now = 15 + 27 / 60;
  return (
    <div className="flex h-full flex-col" style={{ ...textFont, background: "#f8fafd", color: "#1f1f1f" }}>
      <div className="flex h-[60px] shrink-0 items-center gap-1 pl-2 pr-4">
        <IconBtn d={P.menu} s={22} />
        <span className="flex shrink-0 items-center gap-2 pl-1 pr-5 text-[22px]" style={{ ...font, color: "#444746" }}>
          <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden>
            <rect x="3" y="3" width="30" height="30" rx="5" fill="#fff" stroke="#1a73e8" strokeWidth="2.4" />
            <path d="M3 8a5 5 0 0 1 5-5h20a5 5 0 0 1 5 5v3H3Z" fill="#1a73e8" />
            <text x="18" y="28" textAnchor="middle" fontSize="15" fontWeight="700" fill="#1a73e8" fontFamily="Arial, sans-serif">
              3
            </text>
          </svg>
          Calendar
        </span>
        <span role="button" className="mr-2 shrink-0 cursor-pointer rounded-full border px-5 py-[7px] text-[14px] font-medium hover:bg-[rgba(68,71,70,.08)]" style={{ borderColor: "#747775", color: "#1f1f1f", ...font }}>
          Today
        </span>
        <IconBtn d={P.left} s={22} />
        <IconBtn d={P.right} s={22} />
        <span className="ml-2 whitespace-nowrap text-[22px]" style={{ ...font, color: "#1f1f1f" }}>
          {monthLabel}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <IconBtn d={P.search} s={22} />
          <span className="hidden @[1000px]:contents">
            <IconBtn d={P.help} s={22} />
            <IconBtn d={P.settings} s={22} />
          </span>
          <span role="button" className="mx-2 flex cursor-pointer items-center gap-2 rounded-full border px-4 py-[7px] text-[14px] font-medium hover:bg-[rgba(68,71,70,.08)]" style={{ borderColor: "#747775", ...font }}>
            Week <MS d={P.down} s={18} />
          </span>
          <IconBtn d={P.apps} s={22} />
          <Avatar s={32} />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="w-[200px] shrink-0 px-3">
          <div role="button" className="ml-1 inline-flex h-[56px] cursor-pointer items-center gap-3 rounded-2xl bg-white pl-4 pr-6 text-[14px] font-medium hover:bg-[#f1f4f9]" style={{ ...font, boxShadow: "0 1px 2px rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)" }}>
            <MS d={P.add} s={26} c="#1f1f1f" />
            Create <MS d={P.down} s={18} c="#444746" />
          </div>
          <div className="mt-5 px-2">
            <div className="flex items-center justify-between pl-1 text-[14px] font-medium" style={font}>
              {monthLabel}
              <span className="flex" style={{ color: "#444746" }}>
                <MS d={P.left} s={18} />
                <span className="w-2" />
                <MS d={P.right} s={18} />
              </span>
            </div>
            <div className="mt-2 grid grid-cols-7 text-center text-[10.5px]" style={{ color: "#5e5e5e" }}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="py-1 font-medium">
                  {d}
                </span>
              ))}
              {cells.map((n, i) => {
                const inMonth = n >= 1 && n <= dim;
                const label = inMonth ? n : n < 1 ? new Date(fd.getFullYear(), fd.getMonth(), n).getDate() : n - dim;
                const iso = inMonth ? `${fd.getFullYear()}-${String(fd.getMonth() + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}` : "";
                const today = iso === TODAY;
                const inWeek = days.includes(iso);
                return (
                  <span key={i} className="flex h-[24px] items-center justify-center" style={{ background: inWeek && !today ? "#d3e3fd" : undefined, borderRadius: inWeek ? (iso === days[0] ? "12px 0 0 12px" : iso === days[6] ? "0 12px 12px 0" : 0) : undefined }}>
                    <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full" style={{ background: today ? "#0b57d0" : undefined, color: today ? "#fff" : inMonth ? "#1f1f1f" : "#80868b", fontWeight: today ? 600 : 400 }}>
                      {label}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
          <div className="mt-5 flex h-[40px] items-center gap-3 rounded bg-[#e9eef6] px-3 text-[14px]" style={{ color: "#444746" }}>
            <MS d={P.people} s={20} /> Search for people
          </div>
          <div className="mt-4 px-2 text-[14px] font-medium" style={font}>
            My calendars
          </div>
          {[
            [ME.name, "#039be5"],
            ["Birthdays", "#0b8043"],
            ["Tasks", "#4285f4"],
          ].map(([n, c]) => (
            <div key={n} className="flex items-center gap-3 px-2 py-[5px] text-[14px]">
              <span className="flex h-[16px] w-[16px] items-center justify-center rounded-[3px]" style={{ background: c }}>
                <MS d={P.check} s={14} c="#fff" />
              </span>
              {n}
            </div>
          ))}
        </div>
        <div className="mb-3 mr-3 flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white">
          <div className="grid shrink-0 grid-cols-[56px_repeat(7,minmax(0,1fr))] pt-2">
            <div className="flex items-end justify-end pb-1 pr-2 text-[10px]" style={{ color: "#5e5e5e" }}>
              GMT-07
            </div>
            {days.map((d) => {
              const dt = new Date(`${d}T12:00`);
              const today = d === TODAY;
              return (
                <div key={d} className="flex flex-col items-center pb-2">
                  <div className="text-[11px] font-medium" style={{ color: today ? "#0b57d0" : "#444746" }}>
                    {dt.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                  </div>
                  <div className="mt-[2px] flex h-[46px] w-[46px] items-center justify-center rounded-full text-[24px]" style={{ ...font, background: today ? "#0b57d0" : "transparent", color: today ? "#fff" : "#1f1f1f" }}>
                    {dt.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          <div ref={box} className="relative min-h-0 flex-1 overflow-auto border-t" style={{ borderColor: "#dadce0" }}>
            <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]" style={{ height: PX * 24 }}>
              <div className="relative">
                {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
                  <div key={h} className="absolute right-2 -translate-y-1/2 text-[10px]" style={{ top: h * PX, color: "#5e5e5e" }}>
                    {h > 12 ? h - 12 : h} {h >= 12 ? "PM" : "AM"}
                  </div>
                ))}
              </div>
              {days.map((d) => (
                <div key={d} className="relative border-l" style={{ borderColor: "#dadce0", backgroundImage: `repeating-linear-gradient(180deg, transparent 0 ${PX - 1}px, #dadce0 ${PX - 1}px ${PX}px)` }}>
                  {d === TODAY && (
                    <div className="absolute inset-x-0 z-[3] h-[2px]" style={{ top: now * PX, background: "#ea4335" }}>
                      <span className="absolute -left-[6px] -top-[5px] h-[12px] w-[12px] rounded-full" style={{ background: "#ea4335" }} />
                    </div>
                  )}
                  {events
                    .filter((e) => e.data.start.startsWith(d))
                    .map((e) => {
                      const [sh, sm] = e.data.start.split("T")[1].split(":").map(Number);
                      const [eh, em] = (e.data.end.split("T")[1] ?? "").split(":").map(Number);
                      const top = (sh + sm / 60) * PX;
                      const dur = Number.isFinite(eh) ? eh - sh + (em - sm) / 60 : 1;
                      const h = Math.max(20, dur * PX - 2);
                      const past = d < TODAY || (d === TODAY && sh + sm / 60 < now);
                      const t = (x: number, y: number) => `${x % 12 || 12}${y ? `:${String(y).padStart(2, "0")}` : ""}`;
                      return (
                        <div
                          key={`${e.key}-${hl === e.key ? hlT : 0}`}
                          className={`absolute left-[1px] right-[6px] z-[2] overflow-hidden rounded-[4px] px-[6px] py-[2px] text-[12px] leading-[1.25] ${fl(hl, e.key)}`}
                          style={{ top: top + 1, height: h, background: hl === e.key ? "#0b8043" : past ? "#7fcdf2" : "#039be5", color: "#fff", boxShadow: hl === e.key ? "0 0 0 2px #fff, 0 4px 12px rgba(0,0,0,.25)" : "0 0 0 1px #fff" }}
                        >
                          <div className="truncate font-medium">{e.data.title}</div>
                          {h > 30 && (
                            <div className="truncate opacity-90">
                              {t(sh, sm)} – {Number.isFinite(eh) ? t(eh, em) : ""}
                              {eh >= 12 ? "pm" : "am"}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Fade & Co. ─────────────────────────── */

export function CutsSite({ objects, hl, hlT }: P_) {
  const bookings = objects.filter((o): o is Extract<Obj, { type: "booking" }> => o.type === "booking");
  const last = bookings.at(-1);
  const slots = ["12:30 PM", "1:15 PM", "2:00 PM", "2:45 PM", "3:30 PM", "4:45 PM", "5:30 PM", "6:15 PM"];
  const [svc, setSvc] = useState(0);
  const [barber, setBarber] = useState(0);
  const [day, setDay] = useState(1);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i));
  const gold = "#c9a45c";
  // You're signed in on this computer already; one click to sign in, then Appointments shows what was booked.
  const [view, setView] = useState<"book" | "signin" | "appts">("book");
  const [me, setMe] = useState(false);
  const toAppts = () => setView(me ? "appts" : "signin");
  return (
    <div className="h-full overflow-auto" style={{ fontFamily: '"Inter", -apple-system, "Helvetica Neue", sans-serif', background: "#f5f3ef", color: "#161616" }}>
      <div className="flex h-[56px] items-center justify-between px-8" style={{ background: "#111", color: "#f5f3ef" }}>
        <span className="flex items-center gap-3">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full border text-[13px] font-bold" style={{ borderColor: gold, color: gold, fontFamily: "Georgia, serif" }}>
            F
          </span>
          <span className="text-[18px] tracking-[0.02em]" style={{ fontFamily: "Georgia, serif" }}>
            Fade &amp; Co.
          </span>
        </span>
        <div className="flex items-center gap-7 text-[12px] uppercase tracking-[0.14em]" style={{ color: "#cfcac1" }}>
          <span role="button" onClick={() => setView("book")} className="hover:text-white">Services</span>
          <span role="button" onClick={toAppts} className="hover:text-white" style={{ color: view === "appts" ? "#fff" : undefined }}>
            Appointments
          </span>
          {me ? (
            <span className="flex items-center gap-2 normal-case tracking-normal text-[13px] text-white">
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[12px] font-semibold" style={{ background: gold, color: "#111" }}>
                R
              </span>
              {ME.name}
            </span>
          ) : (
            <span role="button" onClick={() => setView("signin")} className="hover:text-white">
              Sign in
            </span>
          )}
          <span role="button" onClick={() => setView("book")} className="cursor-pointer rounded-full px-4 py-[7px] font-semibold hover:brightness-110" style={{ background: gold, color: "#111" }}>
            Book now
          </span>
        </div>
      </div>
      <div className="relative h-[118px] overflow-hidden" style={{ background: "linear-gradient(110deg,#1b1b1b 0%,#2b2620 55%,#3b3127 100%)" }}>
        <div className="absolute inset-0 opacity-[.13]" style={{ backgroundImage: "repeating-linear-gradient(135deg,#fff 0 2px,transparent 2px 14px)" }} />
        <div className="relative flex h-full items-end justify-between px-8 pb-5 text-white">
          <div>
            <div className="text-[26px] leading-none" style={{ fontFamily: "Georgia, serif" }}>
              Fade &amp; Co. Barbershop
            </div>
            <div className="mt-2 flex items-center gap-3 text-[13px]" style={{ color: "#d6d0c4" }}>
              <span style={{ color: gold }}>★★★★★</span> 4.9 (1,284 reviews)
              <span className="opacity-50">•</span>
              <MS d={P.pin} s={14} /> 1180 Valencia St, San Francisco
            </div>
          </div>
          <span className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ background: "rgba(255,255,255,.12)" }}>
            Open · closes 8 PM
          </span>
        </div>
      </div>

      {view === "signin" ? (
        <div className="mx-auto my-10 max-w-[380px] rounded-2xl bg-white p-7" style={{ boxShadow: "0 10px 30px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04)" }}>
          <div className="text-[22px]" style={{ fontFamily: "Georgia, serif" }}>
            Sign in to Fade &amp; Co.
          </div>
          <div className="mt-1 text-[13px]" style={{ color: "#7a746b" }}>
            See and manage your appointments.
          </div>
          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setMe(true);
              setView("appts");
            }}
          >
            <label className="block text-[12px] font-medium" style={{ color: "#5c564d" }}>
              Email
              <input readOnly value={ME.email} className="mt-1 block w-full rounded-lg border px-3 py-2.5 text-[14px] outline-none" style={{ borderColor: "#d6d3d1", color: "#161616" }} />
            </label>
            <label className="block text-[12px] font-medium" style={{ color: "#5c564d" }}>
              Password
              <input readOnly type="password" value="saved-on-this-mac" className="mt-1 block w-full rounded-lg border px-3 py-2.5 text-[14px] outline-none" style={{ borderColor: "#d6d3d1" }} />
            </label>
            <button className="w-full rounded-lg py-2.5 text-[14px] font-semibold text-white hover:opacity-90" style={{ background: "#111" }}>
              Sign in
            </button>
          </form>
        </div>
      ) : view === "appts" && !last ? (
        <div className="mx-auto my-12 max-w-[420px] text-center">
          <div className="text-[22px]" style={{ fontFamily: "Georgia, serif" }}>
            No upcoming appointments
          </div>
          <div className="mt-2 text-[14px]" style={{ color: "#7a746b" }}>
            When you book, it shows up here.
          </div>
          <button onClick={() => setView("book")} className="mt-5 rounded-full px-5 py-2 text-[13px] font-semibold hover:brightness-110" style={{ background: gold, color: "#111" }}>
            Book now
          </button>
        </div>
      ) : view === "appts" && last ? (
        <div>
        <div className="mx-auto mt-7 max-w-[460px] text-[20px]" style={{ fontFamily: "Georgia, serif" }}>
          Your appointments
        </div>
        <div key={`${last.key}-${hlT}`} className={`mx-auto my-7 max-w-[460px] overflow-hidden rounded-2xl bg-white ${fl(hl, last.key)}`} style={{ boxShadow: "0 10px 30px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04)" }}>
          <div className="flex items-center gap-3 px-6 py-5" style={{ background: "#111", color: "#fff" }}>
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full" style={{ background: "#16a34a" }}>
              <MS d={P.check} s={22} c="#fff" />
            </span>
            <div>
              <div className="text-[18px]" style={{ fontFamily: "Georgia, serif" }}>
                You&apos;re booked, {ME.name}.
              </div>
              <div className="text-[12px]" style={{ color: "#bdb6a9" }}>
                Confirmation #FC-4821 · sent to {ME.email}
              </div>
            </div>
          </div>
          <div className="divide-y divide-[#eeebe5] px-6 text-[14px]">
            {[
              ["Service", `${last.data.service}`],
              ["Barber", last.data.barber],
              ["When", fmt(last.data.start)],
              ["Where", "1180 Valencia St, San Francisco"],
              ["Total", `$${last.data.price}.00 · pay at shop`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3">
                <span style={{ color: "#7a746b" }}>{k}</span>
                <span className="text-right font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 px-6 pb-6 pt-2">
            <span role="button" className="flex-1 cursor-pointer rounded-lg border py-[10px] hover:bg-[#f5f3ef] text-center text-[13px] font-medium" style={{ borderColor: "#d6d3d1" }}>
              Reschedule
            </span>
            <span role="button" className="flex-1 cursor-pointer rounded-lg py-[10px] text-center text-[13px] font-semibold text-white hover:opacity-90" style={{ background: "#111" }}>
              Add to calendar
            </span>
          </div>
        </div>
        </div>
      ) : (
        <div className="grid gap-6 px-8 py-6 md:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#7a746b" }}>
              1 · Choose a service
            </div>
            <div className="mt-3 space-y-2">
              {SHOP.services.map((s, i) => (
                <button key={s.name} onClick={() => setSvc(i)} className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-[14px]" style={{ boxShadow: svc === i ? `0 0 0 2px #111` : "0 0 0 1px #e7e3dc" }}>
                  <span>
                    <span className="font-medium">{s.name}</span>
                    <span className="block text-[12px]" style={{ color: "#8a8378" }}>
                      {s.min} min · {["Scissor or clipper, hot towel finish", "Cut plus beard shape and straight-razor line", "Edge-up around hairline and neck"][i]}
                    </span>
                  </span>
                  <span className="font-semibold">${s.price}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#7a746b" }}>
              2 · Pick your barber
            </div>
            <div className="mt-3 flex gap-3">
              {["Any", ...SHOP.barbers].map((b, i) => (
                <button key={b} onClick={() => setBarber(i)} className="flex w-[84px] flex-col items-center gap-2 rounded-xl bg-white py-3 text-[13px]" style={{ boxShadow: barber === i ? "0 0 0 2px #111" : "0 0 0 1px #e7e3dc" }}>
                  <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full text-[15px] font-semibold text-white" style={{ background: i === 0 ? "#b8b0a3" : ["#3d3328", "#6b4f3a", "#2f3b45"][i - 1] }}>
                    {i === 0 ? "★" : b[0]}
                  </span>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="self-start rounded-2xl bg-white p-5" style={{ boxShadow: "0 0 0 1px #e7e3dc, 0 6px 20px rgba(0,0,0,.05)" }}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#7a746b" }}>
              3 · Date &amp; time
            </div>
            <div className="mt-3 flex justify-between">
              {dates.map((d, i) => {
                const dt = new Date(`${d}T12:00`);
                const on = day === i;
                return (
                  <button key={d} onClick={() => setDay(i)} className="flex w-[38px] flex-col items-center rounded-lg py-[6px]" style={{ background: on ? "#111" : "transparent", color: on ? "#fff" : "#161616" }}>
                    <span className="text-[10px] uppercase" style={{ opacity: 0.7 }}>
                      {dt.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className="text-[15px] font-semibold">{dt.getDate()}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-[12px]" style={{ color: "#8a8378" }}>
              Afternoon
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {slots.map((t, i) => (
                <span key={t} role="button" className="cursor-pointer rounded-lg border py-[7px] text-center text-[13px] hover:border-[#111]" style={{ borderColor: i === 2 ? "#111" : "#e1ddd5", background: i === 2 ? "#111" : "#fff", color: i === 2 ? "#fff" : i === 4 ? "#c4beb4" : "#161616", textDecoration: i === 4 ? "line-through" : undefined }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t pt-4 text-[13px]" style={{ borderColor: "#eee" }}>
              <span style={{ color: "#7a746b" }}>{SHOP.services[svc].name}</span>
              <span className="font-semibold">${SHOP.services[svc].price}</span>
            </div>
            <div role="button" className="mt-3 cursor-pointer rounded-xl py-3 text-center text-[14px] font-semibold text-white hover:opacity-90" style={{ background: "#111" }}>
              Book appointment
            </div>
            <div className="mt-2 text-center text-[11px]" style={{ color: "#a19a8f" }}>
              Free cancellation up to 2 hours before
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
