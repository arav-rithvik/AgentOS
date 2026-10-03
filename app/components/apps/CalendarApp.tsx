"use client";

import { useState } from "react";
import { BackLink, LightPage, clock, longDate } from "./BackLink";

export type EventItem = { key: string; title: string; start: string; end: string };

const ACCENT = "#1a73e8";

export function CalendarApp({ seed, today }: { seed: EventItem[]; today: string }) {
  const [events, setEvents] = useState<EventItem[]>(seed);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(`${today}T16:00`);
  const [end, setEnd] = useState(`${today}T17:00`);
  const [error, setError] = useState("");

  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  const days: { day: string; items: EventItem[] }[] = [];
  for (const e of sorted) {
    const day = e.start.slice(0, 10);
    const last = days[days.length - 1];
    if (last && last.day === day) last.items.push(e);
    else days.push({ day, items: [e] });
  }

  function add(ev: React.FormEvent) {
    ev.preventDefault();
    if (!title.trim()) return setError("Add a title.");
    if (!start || !end || end <= start) return setError("End must be after start.");
    setEvents((xs) => [...xs, { key: `evt_local_${xs.length + 1}`, title: title.trim(), start, end }]);
    setTitle("");
    setError("");
  }

  return (
    <LightPage bg="#ffffff">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-3">
          <BackLink />
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 flex-col overflow-hidden rounded border border-neutral-300 text-center">
              <span className="h-2.5 bg-[#1a73e8]" />
              <span className="flex-1 text-[11px] font-bold leading-[18px] text-neutral-800">{Number(today.slice(8, 10))}</span>
            </span>
            <span className="text-xl text-neutral-800">Calendar</span>
          </span>
          <span className="ml-4 text-sm text-neutral-500">Today is {longDate(today)}</span>
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-8 md:grid-cols-[1fr_300px]">
        <section>
          <h1 className="mb-4 text-2xl font-normal text-neutral-900">Schedule</h1>
          {days.length === 0 && <p className="text-neutral-500">No upcoming events.</p>}
          <div className="flex flex-col gap-6">
            {days.map(({ day, items }) => (
              <div key={day} className="flex gap-5">
                <div className="w-20 shrink-0 text-center">
                  <div className="text-xs font-medium uppercase text-neutral-500">{longDate(day).split(",")[0].slice(0, 3)}</div>
                  <div
                    className="mx-auto mt-1 flex h-11 w-11 items-center justify-center rounded-full text-xl"
                    style={day === today ? { background: ACCENT, color: "white" } : { color: "#3c4043" }}
                  >
                    {Number(day.slice(8, 10))}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">{longDate(day).split(", ")[1]}</div>
                </div>
                <ul className="flex flex-1 flex-col gap-2 border-t border-neutral-200 pt-3">
                  {items.map((e) => (
                    <li key={e.key} id={e.key} className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-neutral-50" style={{ borderLeft: `4px solid ${ACCENT}`, background: "#e8f0fe" }}>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-neutral-900">{e.title}</div>
                        <div className="text-sm text-neutral-600">
                          {clock(e.start)} – {e.end.slice(0, 10) === day ? clock(e.end) : `${longDate(e.end)} ${clock(e.end)}`}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <aside>
          <form onSubmit={add} className="rounded-xl border border-neutral-200 p-4 shadow-sm">
            <h2 className="mb-3 font-medium text-neutral-900">New event</h2>
            <label htmlFor="evt-title" className="mb-1 block text-xs font-medium text-neutral-600">Title</label>
            <input
              id="evt-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title"
              className="mb-3 w-full rounded border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#1a73e8]"
            />
            <label htmlFor="evt-start" className="mb-1 block text-xs font-medium text-neutral-600">Start</label>
            <input
              id="evt-start"
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mb-3 w-full rounded border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#1a73e8]"
            />
            <label htmlFor="evt-end" className="mb-1 block text-xs font-medium text-neutral-600">End</label>
            <input
              id="evt-end"
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="mb-3 w-full rounded border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#1a73e8]"
            />
            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full rounded-full bg-[#1a73e8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1765cc]">
              Save
            </button>
          </form>
        </aside>
      </main>
    </LightPage>
  );
}
