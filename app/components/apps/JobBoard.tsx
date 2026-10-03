"use client";

import { useMemo, useState } from "react";
import { BackLink, LightPage, shortDate } from "./BackLink";

export type BoardMeta = { id: string; name: string; color: string; bg: string };
export type BoardJob = { key: string; title: string; company: string; location: string; posted: string };

type Variant = {
  tagline: string;
  nav: string[];
  cta: string;
  searchPlaceholder: string;
};

const VARIANTS: Record<string, Variant> = {
  a: {
    tagline: "Find your next internship at teams that ship.",
    nav: ["Jobs", "Companies", "Salaries", "For Employers"],
    cta: "Sign in",
    searchPlaceholder: "Search job title or company",
  },
  b: {
    tagline: "Curated early-career roles across engineering, research and design.",
    nav: ["Explore", "Companies", "Saved", "Messages"],
    cta: "Post a job",
    searchPlaceholder: "Search roles, companies…",
  },
  c: {
    tagline: "Internships and new-grad roles, updated daily.",
    nav: ["Internships", "New Grad", "Events", "Resources"],
    cta: "Create profile",
    searchPlaceholder: "Try “ML intern” or a company name",
  },
  d: {
    tagline: "The internship index for builders.",
    nav: ["Listings", "Stacks", "Pay data", "Newsletter"],
    cta: "Log in",
    searchPlaceholder: "filter by title or company",
  },
  e: {
    tagline: "Grow your career, one internship at a time.",
    nav: ["Discover", "Companies", "Stories", "Help"],
    cta: "Join free",
    searchPlaceholder: "What role are you looking for?",
  },
};

function initials(s: string) {
  return s
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function JobBoard({ board, jobs, today }: { board: BoardMeta; jobs: BoardJob[]; today: string }) {
  const [q, setQ] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);
  const v = VARIANTS[board.id] ?? VARIANTS.a;
  const c = board.color;

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        (!todayOnly || j.posted === today) &&
        (!needle || j.title.toLowerCase().includes(needle) || j.company.toLowerCase().includes(needle)),
    );
  }, [jobs, q, todayOnly, today]);

  const when = (p: string) => (p === today ? "Today" : shortDate(p));
  const todayCount = jobs.filter((j) => j.posted === today).length;

  const search = (
    <input
      type="search"
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder={v.searchPlaceholder}
      aria-label="Search jobs"
      className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-500"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
    />
  );

  const toggle = (
    <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-neutral-700">
      <input
        type="checkbox"
        checked={todayOnly}
        onChange={(e) => setTodayOnly(e.target.checked)}
        className="h-4 w-4"
        style={{ accentColor: c }}
      />
      Posted today
      <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: board.bg, color: c }}>
        {todayCount}
      </span>
    </label>
  );

  const count = (
    <p className="text-sm text-neutral-500">
      Showing <span className="font-semibold text-neutral-800">{shown.length}</span> of {jobs.length} internships
    </p>
  );

  const apply = (label = "Apply") => (
    <button
      type="button"
      className="shrink-0 rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      style={{ background: c }}
    >
      {label}
    </button>
  );

  const empty = shown.length === 0 && (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500">
      No internships match your filters.
    </div>
  );

  /* ---------- A: Northwind — solid brand header, hero search, classic list ---------- */
  if (board.id === "a") {
    return (
      <LightPage bg="#f7f8fa">
        <div className="bg-white px-6 py-1.5"><BackLink /></div>
        <header style={{ background: c }} className="text-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-extrabold tracking-tight">Northwind<span className="font-light">Jobs</span></span>
              <nav className="hidden gap-6 text-sm font-medium text-white/85 md:flex">
                {v.nav.map((n) => <span key={n} className="cursor-pointer hover:text-white">{n}</span>)}
              </nav>
            </div>
            <button className="rounded-md bg-white px-4 py-1.5 text-sm font-semibold" style={{ color: c }}>{v.cta}</button>
          </div>
          <div className="mx-auto max-w-5xl px-6 pb-8 pt-4">
            <h1 className="text-3xl font-bold">{v.tagline}</h1>
            <div className="mt-5 flex flex-col gap-3 rounded-lg bg-white p-3 sm:flex-row sm:items-center">
              <div className="flex-1">{search}</div>
              <div className="px-2">{toggle}</div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-6">
          <div className="mb-3">{count}</div>
          <ul className="flex flex-col gap-3">
            {shown.map((j) => (
              <li key={j.key} id={j.key} className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-5 scroll-mt-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-sm font-bold" style={{ background: board.bg, color: c }}>
                  {initials(j.company)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold" style={{ color: c }}>{j.title}</h2>
                  <p className="text-sm text-neutral-700">{j.company} · {j.location}</p>
                  <p className="mt-1 text-xs text-neutral-500">Posted {when(j.posted)} · Internship · Summer 2027</p>
                </div>
                {apply("Apply now")}
              </li>
            ))}
          </ul>
          {empty}
        </main>
      </LightPage>
    );
  }

  /* ---------- B: Lattice — white header with brand underline, serif logo, sidebar filters ---------- */
  if (board.id === "b") {
    return (
      <LightPage bg={board.bg}>
        <header className="border-b-4 bg-white" style={{ borderColor: c }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <BackLink />
              <span className="font-serif text-2xl font-semibold italic" style={{ color: c }}>Lattice</span>
              <span className="font-serif text-2xl text-neutral-800">Careers</span>
            </div>
            <nav className="hidden items-center gap-6 text-sm text-neutral-600 md:flex">
              {v.nav.map((n) => <span key={n} className="cursor-pointer hover:text-neutral-900">{n}</span>)}
              <button className="rounded-full border px-4 py-1.5 font-medium" style={{ borderColor: c, color: c }}>{v.cta}</button>
            </nav>
          </div>
        </header>
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">Filters</h3>
            <div className="mb-4">{search}</div>
            {toggle}
            <div className="mt-5 border-t border-neutral-100 pt-4 text-sm text-neutral-600">
              <p className="mb-2 font-semibold text-neutral-800">Job type</p>
              <p>Internship</p>
            </div>
          </aside>
          <main>
            <h1 className="font-serif text-3xl text-neutral-900">Internships</h1>
            <p className="mb-4 mt-1 text-neutral-600">{v.tagline}</p>
            <div className="mb-3">{count}</div>
            <div className="grid gap-4">
              {shown.map((j) => (
                <article key={j.key} id={j.key} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm scroll-mt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium" style={{ color: c }}>{j.company}</p>
                      <h2 className="mt-0.5 text-xl font-semibold text-neutral-900">{j.title}</h2>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-700">{j.location}</span>
                        <span className="rounded-full px-2.5 py-1 font-medium" style={{ background: board.bg, color: c }}>
                          {when(j.posted)}
                        </span>
                      </div>
                    </div>
                    {apply()}
                  </div>
                </article>
              ))}
              {empty}
            </div>
          </main>
        </div>
      </LightPage>
    );
  }

  /* ---------- C: Gradhire — badge logo, bold uppercase, two-column card grid ---------- */
  if (board.id === "c") {
    return (
      <LightPage bg="#ffffff">
        <header className="border-b border-neutral-200">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-black text-white" style={{ background: c }}>G</span>
              <span className="text-xl font-black uppercase tracking-widest text-neutral-900">Gradhire</span>
            </div>
            <nav className="hidden gap-5 text-sm font-semibold text-neutral-600 md:flex">
              {v.nav.map((n) => <span key={n} className="cursor-pointer hover:text-neutral-900">{n}</span>)}
            </nav>
            <button className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: c }}>{v.cta}</button>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-6 pt-3"><BackLink /></div>
        <section style={{ background: board.bg }} className="mt-2">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <h1 className="text-3xl font-black text-neutral-900">{v.tagline}</h1>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="max-w-xl flex-1">{search}</div>
              {toggle}
            </div>
          </div>
        </section>
        <main className="mx-auto max-w-6xl px-6 py-6">
          <div className="mb-4">{count}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            {shown.map((j) => (
              <div key={j.key} id={j.key} className="flex flex-col justify-between rounded-xl border-2 border-neutral-100 p-5 hover:border-neutral-200 scroll-mt-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{j.company}</span>
                    {j.posted === today ? (
                      <span className="rounded px-2 py-0.5 text-xs font-bold text-white" style={{ background: c }}>NEW · Today</span>
                    ) : (
                      <span className="text-xs text-neutral-500">{when(j.posted)}</span>
                    )}
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-neutral-900">{j.title}</h2>
                  <p className="mt-1 text-sm text-neutral-600">📍 {j.location}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Posted {when(j.posted)}</span>
                  {apply("Quick apply")}
                </div>
              </div>
            ))}
          </div>
          {empty}
        </main>
      </LightPage>
    );
  }

  /* ---------- D: InternStack — compact monospace wordmark, table layout ---------- */
  if (board.id === "d") {
    return (
      <LightPage bg="#fafafa">
        <header style={{ background: board.bg }} className="border-b border-neutral-200">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <BackLink />
              <span className="font-mono text-xl font-bold" style={{ color: c }}>
                intern<span className="text-neutral-900">stack</span>
                <span className="ml-1 rounded bg-neutral-900 px-1.5 py-0.5 align-middle text-[10px] text-white">beta</span>
              </span>
            </div>
            <nav className="hidden gap-5 font-mono text-sm text-neutral-600 md:flex">
              {v.nav.map((n) => <span key={n} className="cursor-pointer hover:text-neutral-900">{n.toLowerCase()}</span>)}
            </nav>
            <button className="rounded border border-neutral-900 bg-white px-3 py-1.5 font-mono text-sm font-semibold text-neutral-900">{v.cta}</button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-6">
          <h1 className="text-2xl font-bold text-neutral-900">{v.tagline}</h1>
          <div className="my-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="max-w-md flex-1">{search}</div>
            {toggle}
            <div className="sm:ml-auto">{count}</div>
          </div>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 font-mono text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Location</th>
                  <th className="px-4 py-3">Posted</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {shown.map((j) => (
                  <tr key={j.key} id={j.key} className="border-t border-neutral-100 hover:bg-neutral-50 scroll-mt-4">
                    <td className="px-4 py-3 font-semibold text-neutral-900">{j.title}</td>
                    <td className="px-4 py-3 text-neutral-700">{j.company}</td>
                    <td className="hidden px-4 py-3 text-neutral-600 sm:table-cell">{j.location}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs" style={{ color: j.posted === today ? c : "#737373", fontWeight: j.posted === today ? 700 : 400 }}>
                        {when(j.posted)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{apply()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shown.length === 0 && <div className="p-8 text-center text-neutral-500">No internships match your filters.</div>}
          </div>
        </main>
      </LightPage>
    );
  }

  /* ---------- E: Sprout — centered friendly header, rounded pill UI ---------- */
  return (
    <LightPage bg={board.bg}>
      <div className="px-6 pt-3"><BackLink /></div>
      <header className="mx-auto max-w-3xl px-6 pb-6 pt-4 text-center">
        <div className="text-4xl font-bold lowercase italic tracking-tight" style={{ color: c }}>
          🌱 sprout board
        </div>
        <nav className="mt-3 flex justify-center gap-5 text-sm text-neutral-600">
          {v.nav.map((n) => <span key={n} className="cursor-pointer hover:text-neutral-900">{n}</span>)}
          <span className="cursor-pointer font-semibold" style={{ color: c }}>{v.cta}</span>
        </nav>
        <p className="mt-5 text-lg text-neutral-700">{v.tagline}</p>
        <div className="mt-4 flex items-center gap-2 rounded-full border border-neutral-200 bg-white p-1.5 pl-5 shadow-sm">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={v.searchPlaceholder}
            aria-label="Search jobs"
            className="flex-1 bg-transparent py-1.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none"
          />
          <button className="rounded-full px-5 py-2 text-sm font-semibold text-white" style={{ background: c }}>Search</button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">{toggle}{count}</div>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-12">
        <ul className="flex flex-col gap-3">
          {shown.map((j) => (
            <li key={j.key} id={j.key} className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm scroll-mt-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: c }}>
                {initials(j.company)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-neutral-900">{j.title}</h2>
                <p className="text-sm text-neutral-600">{j.company} — {j.location}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs font-medium" style={{ color: j.posted === today ? c : "#737373" }}>{when(j.posted)}</span>
                <button type="button" className="rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90" style={{ background: c }}>
                  Apply
                </button>
              </div>
            </li>
          ))}
        </ul>
        {empty}
      </main>
    </LightPage>
  );
}
