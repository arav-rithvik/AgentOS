"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BOARDS, ME, seedObjects, TODAY, type Action, type Job, type Obj, type Run } from "./data";
import { describe, LIVE, local, toPreset } from "./live";

// Runner. With Supabase env set (LIVE), `start` posts to /api/run and the real run's
// action_log/runs/events/docs/bookings rows arrive over Realtime. Without it, a scripted
// preview runs so the page still works offline.

export type Line = { id: string; text: string; action?: Action; pending?: boolean; group?: string; req?: { call: string; args: Record<string, unknown> } };
export type Site = "jobs" | "docs" | "calendar" | "mail" | "cuts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let n = 0;
const uid = (p: string) => `${p}_${Date.now().toString(36)}${(n++).toString(36)}`;
const ML = /\b(ML|Machine Learning|NLP|Vision|LLM|Generative|Learning|Speech|Scientist|AI Safety)\b/;

function rank(jobs: Job[]) {
  const score = (j: Job) => (/Research|Safety/.test(j.title) ? 3 : 0) + (/LLM|NLP|Generative/.test(j.title) ? 2 : 0) + (/San Francisco|Remote|Palo Alto|Berkeley/.test(j.location) ? 1 : 0);
  return [...jobs].sort((a, b) => score(b) - score(a));
}

export function useRun() {
  const [objects, setObjects] = useState<Obj[]>(seedObjects);
  const [lines, setLines] = useState<Line[]>([]);
  const [run, setRun] = useState<Run | null>(null);
  const [live, setLive] = useState<{ app: Site; key?: string; t: number } | null>(null);
  const busy = useRef(false);
  const objRef = useRef(objects);
  objRef.current = objects;

  const push = (l: Line) => setLines((p) => [...p, l]);
  const patch = (id: string, u: Partial<Line>) => setLines((p) => p.map((l) => (l.id === id ? { ...l, ...u } : l)));
  const tick = (u: Partial<Run>) => setRun((r) => (r ? { ...r, ...u } : r));
  const add = (o: Obj) => setObjects((os) => [...os, o]);
  const show = (app: Site, key?: string) => setLive({ app, key, t: Date.now() });

  // Live: the calendar shows the real seeded events (deadlines etc.), not the offline seed.
  const loadSeed = useCallback(async () => {
    if (!LIVE) return;
    const data = await fetch("/api/seed")
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { events?: { id: string; title: string; starts_at: string; duration_min: number }[] } | null) => j?.events)
      .catch(() => undefined);
    if (!data) return;
    const evts: Obj[] = data.map((e) => ({ app: "calendar", type: "event", key: e.id, data: { title: e.title, start: local(e.starts_at), end: local(e.starts_at, e.duration_min) } }));
    setObjects((os) => [...os.filter((o) => o.type !== "event"), ...evts]);
  }, []);
  useEffect(() => {
    loadSeed();
  }, [loadSeed]);

  const reset = useCallback(() => {
    if (busy.current) return;
    setObjects(seedObjects);
    setLines([]);
    setRun(null);
    setLive(null);
    loadSeed();
  }, [loadSeed]);

  // The real engine: POST the preset, then follow the run over Realtime.
  const runLive = async (prompt: string) => {
    const preset = toPreset(prompt);
    setLines([]);
    setRun({ id: "pending", prompt, status: "running", result: null, steps: 0, input_tokens: 0, output_tokens: 0, ms: 0 });
    if (!preset) {
      push({ id: uid("l"), text: "This computer runs three tasks right now: the internship hunt, study blocks, and the weekend plan." });
      tick({ status: "done", result: "Pick one of the tasks below." });
      return;
    }
    push({ id: uid("l"), text: "Read the manifest: job boards, Docs, Calendar, salon, concerts, flights" });
    let runId = "";
    try {
      const res = await fetch("/api/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ preset }) });
      const j = await res.json();
      if (!res.ok || !j.runId) throw new Error(j.error ?? `HTTP ${res.status}`);
      runId = j.runId;
    } catch (e) {
      push({ id: uid("l"), text: `Couldn't start the run: ${e instanceof Error ? e.message : String(e)}` });
      tick({ status: "error", result: "The engine didn't start. Try again." });
      return;
    }
    tick({ id: runId });

    const seen = new Set<number>();
    let lastStart = 0;
    let lastId = "";
    const onAction = (a: { id: number; action: string; args: Record<string, unknown>; receipt: { status: string; count: number | null; error?: string; started_at: string }; latency_ms: number | null }) => {
      if (seen.has(a.id)) return;
      seen.add(a.id);
      const t = Date.parse(a.receipt.started_at);
      const parallel = Math.abs(t - lastStart) < 150;
      const id = `al_${a.id}`;
      if (parallel && lastId) patch(lastId, { group: "parallel" });
      push({ id, text: describe(a.action, a.args, a.receipt), group: parallel ? "parallel" : undefined, action: { id, run_id: runId, call: a.action, args: a.args, receipt: a.receipt as unknown as Record<string, unknown>, ms: a.latency_ms ?? 0 } });
      lastStart = t;
      lastId = id;
      if (a.action.startsWith("jobboard")) show("jobs");
      else if (a.action === "salon.slots.list") show("cuts");
      else if (a.action === "calendar.list") show("calendar");
    };

    // Follow the run by polling the server (it reads Supabase with the service role key).
    const seenObj = new Set<string>();
    type Snap = {
      run: { status: string; summary: string | null; steps: number; input_tokens: number; output_tokens: number; ms: number };
      actions: Parameters<typeof onAction>[0][];
      events: { id: string; title: string; starts_at: string; duration_min: number }[];
      docs: { id: string; title: string; body: string }[];
      bookings: { id: string; app: string; title: string; price: number; details: Record<string, unknown> }[];
    };
    const apply = (j: Snap) => {
      j.actions.forEach(onAction);
      j.events.forEach((e) => {
        if (seenObj.has(e.id)) return;
        seenObj.add(e.id);
        add({ app: "calendar", type: "event", key: e.id, data: { title: e.title, start: local(e.starts_at), end: local(e.starts_at, e.duration_min) } });
        show("calendar", e.id);
      });
      j.docs.forEach((d) => {
        if (seenObj.has(d.id)) return;
        seenObj.add(d.id);
        add({ app: "docs", type: "doc", key: d.id, data: { title: d.title, body: d.body } });
        show("docs", d.id);
      });
      j.bookings.forEach((b) => {
        if (seenObj.has(b.id) || b.app !== "salon") return;
        seenObj.add(b.id);
        const start = String(b.details.starts_at ?? b.details.start ?? "");
        add({ app: "cuts", type: "booking", key: b.id, data: { service: b.title.split(" at ")[0], barber: String(b.details.stylist ?? b.details.barber ?? ""), start: start ? local(start) : "", price: Number(b.price) } });
        show("cuts", b.id);
      });
      const r = j.run;
      tick({ status: r.status === "error" ? "error" : r.status === "done" ? "done" : "running", result: r.summary, steps: r.steps, input_tokens: r.input_tokens, output_tokens: r.output_tokens, ms: r.ms });
      return r.status !== "running";
    };
    const t0 = Date.now();
    for (;;) {
      await sleep(500);
      const j = (await fetch(`/api/run/${runId}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)) as Snap | null;
      if (j?.run && apply(j)) break;
      if (Date.now() - t0 > 120000) {
        tick({ status: "error", result: "The run took too long." });
        break;
      }
    }
  };

  const start = useCallback(async (prompt: string) => {
    if (busy.current || !prompt.trim()) return;
    busy.current = true;
    const runId = uid("run");
    const t0 = performance.now();
    const ms = () => Math.round(performance.now() - t0);
    setLines([]);
    setRun({ id: runId, prompt, status: "running", result: null, steps: 0, input_tokens: 0, output_tokens: 0, ms: 0 });
    let steps = 0;

    // One typed call: a line in the log, a receipt, and the change on the computer.
    const call = async (text: string, name: string, args: Record<string, unknown>, receipt: Record<string, unknown>, effect?: () => void, wait = 450) => {
      const id = uid("l");
      push({ id, text, pending: true });
      await sleep(wait);
      effect?.();
      steps += 1;
      patch(id, { pending: false, action: { id: uid("a"), run_id: runId, call: name, args, receipt, ms: 30 + Math.round(Math.random() * 30) } });
    };
    const finish = (result: string, input: number, output: number) => tick({ status: "done", result, steps, input_tokens: input, output_tokens: output, ms: ms() });

    if (LIVE) {
      await runLive(prompt);
      busy.current = false;
      return;
    }

    await sleep(300);
    push({ id: uid("l"), text: "Read the manifest: Mail, Docs, Calendar, Fade & Co., 5 job boards" });
    tick({ input_tokens: 1240, ms: ms() });
    await sleep(350);
    const p = prompt.toLowerCase();

    if (/hair|cut|barber|concert|flight|weekend/.test(p)) {
      // Same wire format as the engine (lib/agent.ts + lib/drivers.ts): call {action, args} -> {receipt, data}.
      type C = { text: string; action: string; args: Record<string, unknown>; result_id?: string; data: unknown; effect?: () => void };
      let turnN = 0;
      const turn = async (cs: C[], wait = 1100) => {
        turnN += 1;
        const g = cs.length > 1 ? `parallel:${turnN}` : `turn:${turnN}`;
        const ids = cs.map((c) => {
          const id = uid("l");
          push({ id, text: c.text, pending: true, group: g, req: { call: c.action, args: c.args } });
          return id;
        });
        const t = new Date();
        await sleep(wait);
        cs.forEach((c, i) => {
          c.effect?.();
          const ms = 30 + Math.round(Math.random() * 40);
          const receipt = { action: c.action, args: c.args, result_id: c.result_id ?? null, count: Array.isArray(c.data) ? c.data.length : null, status: "ok", started_at: t.toISOString(), finished_at: new Date(t.getTime() + ms).toISOString() };
          patch(ids[i], { pending: false, action: { id: uid("a"), run_id: runId, call: c.action, args: c.args, receipt, ms, data: c.data } });
        });
        steps += 1;
        tick({ steps, ms: ms() });
      };
      const slots = [
        { id: "slt_0912", salon: "Fade & Co.", stylist: "Dee", service: "Haircut", start: "2026-10-04T09:00:00-07:00", durationMin: 30, price: 35 },
        { id: "slt_1004", salon: "Fade & Co.", stylist: "Marcus", service: "Haircut", start: "2026-10-04T10:00:00-07:00", durationMin: 30, price: 32 },
        { id: "slt_1130", salon: "Mission Barbers", stylist: "Jo", service: "Haircut", start: "2026-10-04T11:30:00-07:00", durationMin: 30, price: 40 },
      ];
      const shows = [
        { id: "cnc_221", artist: "Japanese Breakfast", genre: "indie", venue: "The Fillmore", city: "San Francisco", start: "2026-10-04T20:00:00-07:00", durationMin: 150, price: 54, ticketsLeft: 38 },
        { id: "cnc_238", artist: "Khruangbin", genre: "psych", venue: "Bill Graham Civic", city: "San Francisco", start: "2026-10-04T21:00:00-07:00", durationMin: 120, price: 79, ticketsLeft: 120 },
      ];
      const flights = [
        { id: "flt_ua1478", airline: "United", from: "SFO", to: "LAX", departs: "2026-10-05T18:10:00-07:00", arrives: "2026-10-05T19:40:00-07:00", price: 89, seatsLeft: 11 },
        { id: "flt_as1921", airline: "Alaska", from: "SFO", to: "LAX", departs: "2026-10-05T19:25:00-07:00", arrives: "2026-10-05T20:55:00-07:00", price: 104, seatsLeft: 4 },
      ];
      const cal = [
        { id: "evt_1", title: "Physics 2 study block", start: "2026-10-03T19:00:00-07:00", durationMin: 90, kind: "block" },
        { id: "evt_2", title: "Team sync with Arav", start: "2026-10-04T10:00:00-07:00", durationMin: 60, kind: "event" },
      ];
      await turn([
        { text: "Checked salon openings: 3 found", action: "salon.slots.list", args: { date: "2026-10-04", before: "12:00" }, data: slots, effect: () => show("cuts") },
        { text: "Searched concerts: 2 found", action: "concerts.search", args: { city: "San Francisco", date: "2026-10-04", maxPrice: 60 }, data: shows },
        { text: "Searched flights SFO→LAX: 2 found", action: "flights.search", args: { from: "SFO", to: "LAX", date: "2026-10-05", after: "17:00" }, data: flights },
        { text: "Read your calendar: 2 items", action: "calendar.list", args: {}, data: cal },
      ]);
      tick({ input_tokens: 2980, output_tokens: 210 });
      // Marcus at 10:00 clashes with the team sync, so the cheapest free slot is Dee at 9:00.
      const booking: Obj = { app: "cuts", type: "booking", key: "bkg_7f3a", data: { service: "Haircut", barber: "Dee", start: "2026-10-04T09:00", price: 35 } };
      await turn([
        { text: "Booked the haircut", action: "salon.book", args: { slotId: "slt_0912" }, result_id: "bkg_7f3a", data: { id: "bkg_7f3a", confirmation: "FC-4821", price: 35 }, effect: () => { add(booking); show("cuts", booking.key); } },
        { text: "Booked 2 concert tickets", action: "concerts.book", args: { concertId: "cnc_221", qty: 2 }, result_id: "bkg_7f3b", data: { id: "bkg_7f3b", confirmation: "FIL-20931", price: 108 } },
        { text: "Booked the flight", action: "flights.book", args: { flightId: "flt_ua1478" }, result_id: "bkg_7f3c", data: { id: "bkg_7f3c", confirmation: "UA-K7Q2PD", price: 89 } },
      ]);
      tick({ input_tokens: 4410, output_tokens: 380 });
      const evs: [string, string, string, string][] = [
        ["evt_h1", "Haircut · Fade & Co.", "2026-10-04T09:00", "2026-10-04T09:30"],
        ["evt_c1", "Japanese Breakfast · The Fillmore", "2026-10-04T20:00", "2026-10-04T22:30"],
        ["evt_f1", "Flight UA 1478 SFO → LAX", "2026-10-05T18:10", "2026-10-05T19:40"],
      ];
      await turn(
        evs.map(([key, title, start, end]) => ({
          text: `Added “${title}”`,
          action: "calendar.create",
          args: { title, start: `${start}:00-07:00`, durationMin: (Date.parse(end) - Date.parse(start)) / 60000, kind: "event" },
          result_id: key,
          data: { id: key },
          effect: () => {
            add({ app: "calendar", type: "event", key, data: { title, start, end } });
            show("calendar", key);
          },
        })),
      );
      finish("Haircut 9:00 AM with Dee ($35), 2 tickets to Japanese Breakfast at 8 PM ($108), flight UA 1478 Mon 6:10 PM ($89). All three are on your calendar, no overlaps.", 5890, 520);
    } else if (/maya|reply|email|mail/.test(p)) {
      await call("Found Maya's email: “Coffee next week?”", "mail.messages.list", { from: "Maya", unread: true }, { ok: true, count: 1 }, () => show("mail", "mail_1"));
      const sent: Obj = { app: "mail", type: "mail", key: uid("mail"), data: { folder: "sent", from: ME.name, email: ME.email, to: "maya.chen@gmail.com", subject: "Re: Coffee next week?", body: "Tuesday at 3 works. See you then!\n\nRithvik", at: "3:00 PM", unread: false } };
      await call("Replied: “Tuesday at 3 works. See you then!”", "mail.messages.send", { to: "maya.chen@gmail.com", subject: sent.type === "mail" ? sent.data.subject : "" }, { ok: true, id: sent.key }, () => {
        add(sent);
        show("mail", sent.key);
      });
      const ev: Obj = { app: "calendar", type: "event", key: uid("evt"), data: { title: "Coffee with Maya", start: "2026-10-06T15:00", end: "2026-10-06T16:00" } };
      await call("Added “Coffee with Maya” to Tuesday 3:00 PM", "calendar.events.create", { title: ev.data.title, start: ev.data.start, end: ev.data.end }, { ok: true, id: ev.key }, () => {
        add(ev);
        show("calendar", ev.key);
      });
      finish("Replied to Maya and put coffee on your calendar for Tuesday at 3.", 1890, 240);
    } else if (/calendar|block|study/.test(p)) {
      const ev: Obj = { app: "calendar", type: "event", key: uid("evt"), data: { title: "Apply to top 3 internships", start: "2026-10-04T16:00", end: "2026-10-04T17:00" } };
      await call("Created “Apply to top 3 internships” tomorrow 4:00 PM", "calendar.events.create", { title: ev.data.title, start: ev.data.start, end: ev.data.end }, { ok: true, id: ev.key }, () => {
        add(ev);
        show("calendar", ev.key);
      });
      finish("Done. Tomorrow 4:00 to 5:00 PM is blocked.", 1610, 120);
    } else if (/job|intern|board/.test(p)) {
      // 5 board queries go out at the same time.
      show("jobs");
      const ids = BOARDS.map((b) => {
        const id = uid("l");
        push({ id, text: `Searched ${b.name}`, pending: true, group: "parallel" });
        return id;
      });
      let found: Job[] = [];
      await Promise.all(
        BOARDS.map(async (b, i) => {
          await sleep(450 + i * 70);
          const jobs = objRef.current.filter((o): o is Extract<Obj, { type: "job" }> => o.type === "job" && o.app === b.app && o.data.posted === TODAY && ML.test(o.data.title)).map((o) => o.data);
          found = found.concat(jobs);
          patch(ids[i], { pending: false, text: `Searched ${b.name}: ${jobs.length} new`, action: { id: uid("a"), run_id: runId, call: `${b.app}.jobs.list`, args: { query: "ML intern", posted: "today" }, receipt: { ok: true, count: jobs.length }, ms: 30 + Math.round(Math.random() * 40) } });
        }),
      );
      steps += 5;
      tick({ steps, input_tokens: 2050, output_tokens: 180, ms: ms() });
      await sleep(400);
      const seen = new Set<string>();
      const unique = found.filter((j) => (seen.has(`${j.company}|${j.title}`) ? false : (seen.add(`${j.company}|${j.title}`), true)));
      push({ id: uid("l"), text: `Found ${found.length} postings, ${unique.length} after removing duplicates` });
      await sleep(400);
      push({ id: uid("l"), text: "Ranked them: research roles and LLM work first" });
      const body = rank(unique)
        .map((j, i) => `${i + 1}. ${j.title} · ${j.company} · ${j.location}`)
        .join("\n");
      const doc: Obj = { app: "docs", type: "doc", key: uid("doc"), data: { title: "ML internships · Oct 3", body } };
      await call("Wrote the ranked list to a new doc", "docs.create", { title: doc.data.title }, { ok: true, id: doc.key, link: `/docs/${doc.key}` }, () => {
        add(doc);
        show("docs", doc.key);
      });
      finish(`${unique.length} new ML internships across 5 boards (${found.length} before dedupe). Ranked list is in your doc.`, 2610, 690);
    } else {
      await sleep(400);
      push({ id: uid("l"), text: "This preview runs the demos above. Free-form tasks go live when the engine is connected." });
      finish("Try one of the demos.", 900, 40);
    }
    busy.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { objects, lines, run, live, start, reset };
}

