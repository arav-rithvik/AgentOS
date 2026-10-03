"use client";

import { useEffect, useState } from "react";
import { seedObjects, type Obj } from "@/components/data";
import { CalendarSite, CutsSite, DocsSite, MailSite } from "@/components/web/Sites";

// Shared across /web/* on this origin, so a booking made on Fade & Co. is there when you open Calendar.
const KEY = "agentos.web.v1";
const SITES = { mail: MailSite, docs: DocsSite, calendar: CalendarSite, cuts: CutsSite } as const;

function read(): Obj[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? (v as Obj[]) : [];
  } catch {
    return [];
  }
}

export default function Web({ site }: { site: keyof typeof SITES }) {
  const [added, setAdded] = useState<Obj[]>([]);
  const [hl, setHl] = useState<string | undefined>();
  useEffect(() => {
    if (new URLSearchParams(location.search).has("reset")) {
      try {
        localStorage.removeItem(KEY);
      } catch {}
      history.replaceState(null, "", location.pathname);
      return;
    }
    const saved = read();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load once after mount (storage isn't on the server)
    if (saved.length) setAdded(saved);
  }, []);
  const onAdd = (o: Obj) => {
    const next = [...read().filter((x) => x.key !== o.key), o];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    setAdded(next);
    setHl(o.key);
  };
  const Site = SITES[site];
  return <Site objects={[...seedObjects, ...added]} hl={hl} hlT={hl ? added.length : undefined} onAdd={onAdd} />;
}
