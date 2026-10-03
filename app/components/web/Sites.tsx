"use client";

import { useState } from "react";
import { ME, SHOP, type Obj } from "../data";

type P = { objects: Obj[]; hl?: string; hlT?: number };
const font = { fontFamily: 'Roboto, -apple-system, "Helvetica Neue", Arial, sans-serif' };
const fl = (hl: string | undefined, key: string) => (hl === key ? "flash-light" : "");

function Avatar({ c = "#0b8043" }: { c?: string }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-medium text-white" style={{ background: c }}>
      R
    </span>
  );
}

function fmt(iso: string) {
  const [d, t] = iso.split("T");
  const [h, m] = t.split(":").map(Number);
  const day = new Date(`${d}T12:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return `${day}, ${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function MailSite({ objects, hl, hlT }: P) {
  const mails = objects.filter((o): o is Extract<Obj, { type: "mail" }> => o.type === "mail");
  const hlMail = mails.find((m) => m.key === hl);
  const [folder, setFolder] = useState<"inbox" | "sent">("inbox");
  const [sel, setSel] = useState<string | null>(null);
  const f = hlMail ? hlMail.data.folder : folder;
  const open = mails.find((m) => m.key === (hlMail ? hl : sel));
  const list = mails.filter((m) => m.data.folder === f);
  const unread = mails.filter((m) => m.data.folder === "inbox" && m.data.unread).length;
  return (
    <div className="flex h-full flex-col" style={{ ...font, background: "#f6f8fc", color: "#1f1f1f" }}>
      <div className="flex h-14 shrink-0 items-center gap-4 px-4">
        <span className="text-[20px]" style={{ color: "#5f6368" }}>
          ☰
        </span>
        <span className="flex items-center gap-1.5 text-[20px]" style={{ color: "#5f6368" }}>
          <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden>
            <rect x="1" y="1" width="24" height="18" rx="3" fill="#fff" stroke="#c5221f" strokeWidth="2" />
            <path d="M2 3l11 8 11-8" fill="none" stroke="#c5221f" strokeWidth="2" />
          </svg>
          Mail
        </span>
        <div className="mx-auto flex h-11 w-[52%] items-center rounded-full px-5 text-[14px]" style={{ background: "#e9eef6", color: "#5f6368" }}>
          Search mail
        </div>
        <Avatar />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="w-[190px] shrink-0 px-2 text-[13.5px]">
          <div className="mb-3 inline-flex items-center gap-3 rounded-2xl px-5 py-4 font-medium" style={{ background: "#c2e7ff" }}>
            ✎ Compose
          </div>
          {(
            [
              ["inbox", "Inbox", unread],
              ["sent", "Sent", 0],
            ] as const
          ).map(([k, l, c]) => (
            <button key={k} onClick={() => setFolder(k)} className="flex w-full items-center justify-between rounded-r-full px-5 py-1.5 text-left" style={{ background: f === k ? "#d3e3fd" : "transparent", fontWeight: f === k ? 700 : 400 }}>
              {l}
              {c ? <span className="text-[12px]">{c}</span> : null}
            </button>
          ))}
          {["Starred", "Drafts", "Archive"].map((l) => (
            <div key={l} className="px-5 py-1.5">
              {l}
            </div>
          ))}
        </div>
        <div className="mr-3 mb-3 min-w-0 flex-1 overflow-auto rounded-2xl bg-white">
          {open ? (
            <div key={`${open.key}-${hlT}`} className={`px-8 py-6 ${fl(hl, open.key)}`}>
              <button onClick={() => setSel(null)} className="mb-4 text-[13px]" style={{ color: "#5f6368" }}>
                ← Back
              </button>
              <div className="text-[22px]">{open.data.subject}</div>
              <div className="mt-4 flex items-center gap-3">
                <Avatar c={open.data.folder === "sent" ? "#0b8043" : "#7b1fa2"} />
                <div className="text-[13px]">
                  <span className="font-semibold">{open.data.from}</span> <span style={{ color: "#5f6368" }}>&lt;{open.data.email}&gt;</span>
                  <div style={{ color: "#5f6368" }}>to {open.data.to === ME.email ? "me" : open.data.to}</div>
                </div>
              </div>
              <p className="mt-5 whitespace-pre-wrap text-[14px] leading-6">{open.data.body}</p>
            </div>
          ) : (
            list.map((m) => (
              <button key={m.key} onClick={() => setSel(m.key)} className="flex w-full items-center gap-4 border-b px-5 py-2.5 text-left text-[13.5px]" style={{ borderColor: "#f1f3f4", background: m.data.unread ? "#fff" : "#f8fafd", fontWeight: m.data.unread ? 700 : 400 }}>
                <span className="w-40 shrink-0 truncate">{m.data.folder === "sent" ? `To: ${m.data.to}` : m.data.from}</span>
                <span className="min-w-0 flex-1 truncate">
                  {m.data.subject} <span style={{ color: "#5f6368", fontWeight: 400 }}>- {m.data.body.split("\n")[0]}</span>
                </span>
                <span className="text-[12px]">{m.data.at}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function DocsSite({ objects, hl, hlT }: P) {
  const docs = objects.filter((o): o is Extract<Obj, { type: "doc" }> => o.type === "doc");
  const [sel, setSel] = useState<string | null>(null);
  const doc = docs.find((d) => d.key === (hl && docs.some((d) => d.key === hl) ? hl : sel));
  const Logo = () => (
    <svg width="22" height="28" viewBox="0 0 22 28" aria-hidden>
      <path d="M0 2a2 2 0 0 1 2-2h12l8 8v18a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z" fill="#4285f4" />
      <path d="M14 0l8 8h-6a2 2 0 0 1-2-2z" fill="#a1c2fa" />
      <path d="M5 13h12M5 17h12M5 21h8" stroke="#fff" strokeWidth="1.8" />
    </svg>
  );
  if (doc)
    return (
      <div className="flex h-full flex-col" style={{ ...font, background: "#f9fbfd" }}>
        <div className="flex h-14 shrink-0 items-center gap-3 px-4">
          <button onClick={() => setSel(null)}>
            <Logo />
          </button>
          <div>
            <div className="text-[17px]">{doc.data.title}</div>
            <div className="flex gap-3 text-[13px]" style={{ color: "#444" }}>
              {["File", "Edit", "View", "Insert", "Format", "Tools"].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
          <span className="ml-auto rounded-full px-5 py-2 text-[13.5px] font-medium" style={{ background: "#c2e7ff" }}>
            Share
          </span>
          <Avatar />
        </div>
        <div className="mx-3 mb-2 h-9 rounded-full" style={{ background: "#edf2fa" }} />
        <div className="min-h-0 flex-1 overflow-auto" style={{ background: "#f9fbfd" }}>
          <div key={`${doc.key}-${hlT}`} className={`mx-auto my-4 min-h-[600px] w-[620px] max-w-[92%] bg-white px-14 py-12 ${fl(hl, doc.key)}`} style={{ boxShadow: "0 1px 3px rgba(60,64,67,.15)" }}>
            <div className="text-[26px]">{doc.data.title}</div>
            <pre className="mt-5 whitespace-pre-wrap text-[14px] leading-7" style={font}>
              {doc.data.body}
            </pre>
          </div>
        </div>
      </div>
    );
  return (
    <div className="h-full overflow-auto" style={{ ...font, background: "#fff" }}>
      <div className="flex h-14 items-center gap-3 px-4">
        <Logo />
        <span className="text-[20px]" style={{ color: "#5f6368" }}>
          Docs
        </span>
        <div className="mx-auto h-11 w-[50%] rounded-full" style={{ background: "#e9eef6" }} />
        <Avatar />
      </div>
      <div className="px-10 py-4" style={{ background: "#f1f3f4" }}>
        <div className="text-[15px]">Start a new document</div>
        <div className="mt-3 flex h-[120px] w-[95px] items-center justify-center border bg-white text-[40px]" style={{ borderColor: "#dadce0", color: "#4285f4" }}>
          +
        </div>
      </div>
      <div className="px-10 py-4">
        <div className="text-[15px] font-medium">Recent documents</div>
        <div className="mt-3 flex flex-wrap gap-4">
          {[...docs].reverse().map((d) => (
            <button key={d.key} onClick={() => setSel(d.key)} className="w-[150px] overflow-hidden rounded border text-left" style={{ borderColor: "#dadce0" }}>
              <div className="h-[110px] overflow-hidden bg-white p-3 text-[6px] leading-tight" style={{ color: "#555" }}>
                {d.data.body}
              </div>
              <div className="border-t px-3 py-2 text-[12.5px]" style={{ borderColor: "#dadce0" }}>
                {d.data.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CalendarSite({ objects, hl, hlT }: P) {
  const events = objects.filter((o): o is Extract<Obj, { type: "event" }> => o.type === "event");
  const days = ["2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07"];
  const H0 = 9;
  const PX = 34;
  return (
    <div className="flex h-full flex-col" style={{ ...font, background: "#fff", color: "#1f1f1f" }}>
      <div className="flex h-14 shrink-0 items-center gap-4 px-4">
        <span className="flex h-8 w-8 flex-col items-center justify-center rounded border text-[12px] font-bold" style={{ borderColor: "#1a73e8", color: "#1a73e8" }}>
          3
        </span>
        <span className="text-[20px]" style={{ color: "#5f6368" }}>
          Calendar
        </span>
        <span className="rounded-full border px-4 py-1.5 text-[13.5px]" style={{ borderColor: "#dadce0" }}>
          Today
        </span>
        <span className="text-[20px]">October 2026</span>
        <span className="ml-auto rounded-full border px-4 py-1.5 text-[13.5px]" style={{ borderColor: "#dadce0" }}>
          Week ▾
        </span>
        <Avatar />
      </div>
      <div className="grid shrink-0 grid-cols-[56px_repeat(5,1fr)] border-b" style={{ borderColor: "#dadce0" }}>
        <div />
        {days.map((d) => {
          const dt = new Date(`${d}T12:00`);
          const today = d === "2026-10-03";
          return (
            <div key={d} className="py-1 text-center">
              <div className="text-[11px] font-medium" style={{ color: today ? "#1a73e8" : "#70757a" }}>
                {dt.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
              </div>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[22px]" style={{ background: today ? "#1a73e8" : "transparent", color: today ? "#fff" : "#3c4043" }}>
                {dt.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="relative grid min-h-0 flex-1 grid-cols-[56px_repeat(5,1fr)] overflow-auto">
        <div>
          {Array.from({ length: 12 }, (_, i) => H0 + i).map((h) => (
            <div key={h} className="pr-2 text-right text-[10px]" style={{ height: PX, color: "#70757a" }}>
              {h > 12 ? h - 12 : h} {h >= 12 ? "PM" : "AM"}
            </div>
          ))}
        </div>
        {days.map((d) => (
          <div key={d} className="relative border-l" style={{ borderColor: "#dadce0" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="border-b" style={{ height: PX, borderColor: "#f1f3f4" }} />
            ))}
            {events
              .filter((e) => e.data.start.startsWith(d))
              .map((e) => {
                const [sh, sm] = e.data.start.split("T")[1].split(":").map(Number);
                const [eh, em] = e.data.end.split("T")[1].split(":").map(Number);
                const top = (sh - H0 + sm / 60) * PX;
                const h = Math.max(18, (eh - sh + (em - sm) / 60) * PX);
                return (
                  <div key={`${e.key}-${hl === e.key ? hlT : 0}`} className={`absolute left-0.5 right-1 overflow-hidden rounded px-1.5 py-0.5 text-[11px] text-white ${fl(hl, e.key)}`} style={{ top, height: h, background: hl === e.key ? "#0b8043" : "#039be5" }}>
                    <div className="truncate font-medium">{e.data.title}</div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CutsSite({ objects, hl, hlT }: P) {
  const bookings = objects.filter((o): o is Extract<Obj, { type: "booking" }> => o.type === "booking");
  const last = bookings.at(-1);
  const slots = ["12:30 PM", "1:15 PM", "2:00 PM", "3:30 PM", "4:45 PM"];
  return (
    <div className="h-full overflow-auto" style={{ fontFamily: '"Helvetica Neue", -apple-system, sans-serif', background: "#faf7f2", color: "#1c1917" }}>
      <div className="flex items-center justify-between px-8 py-4" style={{ background: "#1c1917", color: "#faf7f2" }}>
        <span className="text-[20px] font-bold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
          Fade &amp; Co.
        </span>
        <div className="flex items-center gap-6 text-[13px]">
          <span>Services</span>
          <span>Barbers</span>
          <span>Book</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold" style={{ background: "#d97706", color: "#1c1917" }}>
            R
          </span>
        </div>
      </div>
      {last ? (
        <div key={`${last.key}-${hlT}`} className={`mx-auto my-8 max-w-[440px] rounded-xl bg-white p-7 text-center ${fl(hl, last.key)}`} style={{ boxShadow: "0 4px 20px rgba(0,0,0,.08)" }}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-[22px] text-white" style={{ background: "#16a34a" }}>
            ✓
          </div>
          <div className="mt-4 text-[22px] font-bold" style={{ fontFamily: "Georgia, serif" }}>
            You&apos;re booked, {ME.name}.
          </div>
          <div className="mt-4 space-y-1 text-[14px]" style={{ color: "#57534e" }}>
            <div>
              {last.data.service} with {last.data.barber}
            </div>
            <div className="font-semibold" style={{ color: "#1c1917" }}>
              {fmt(last.data.start)}
            </div>
            <div>
              ${last.data.price} · Confirmation FC-4821
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 px-8 py-8 md:grid-cols-[1fr_1fr]">
          <div>
            <div className="text-[28px] font-bold leading-tight" style={{ fontFamily: "Georgia, serif" }}>
              Sharp cuts, Valencia St.
            </div>
            <div className="mt-6 space-y-2">
              {SHOP.services.map((s) => (
                <div key={s.name} className="flex justify-between rounded-lg bg-white px-4 py-3 text-[14px]" style={{ boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
                  <span>
                    {s.name} <span style={{ color: "#a8a29e" }}>· {s.min} min</span>
                  </span>
                  <span className="font-semibold">${s.price}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-white p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
            <div className="text-[14px] font-semibold">Tomorrow · Sun Oct 4</div>
            <div className="mt-1 text-[12.5px]" style={{ color: "#78716c" }}>
              with {SHOP.barbers.join(", ")}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {slots.map((t) => (
                <span key={t} className="rounded-md border py-2 text-center text-[13px]" style={{ borderColor: "#d6d3d1" }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-5 rounded-md py-2.5 text-center text-[14px] font-semibold text-white" style={{ background: "#1c1917" }}>
              Book appointment
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
