"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { seedObjects, type Obj } from "../data";
import type { Site } from "../useRun";

// A real Chrome (Steel.dev cloud browser) streamed into the drawn Chrome window.
// With no STEEL_API_KEY (or any failure) this stays null and the drawn sites render as before.

type Real = { id: string; viewerUrl: string; origin: string };

const log = (...a: unknown[]) => {
  if (process.env.NODE_ENV !== "production") console.info("[real-chrome]", ...a);
};

// One session per page load, shared across StrictMode double-mounts and re-renders.
let session: Promise<Real | null> | null = null;
let current: Real | null = null;

function start(): Promise<Real | null> {
  if (session) return session;
  session = fetch("/api/browser", { method: "POST" })
    .then(async (r) => {
      if (!r.ok) {
        log(r.status === 404 ? "no STEEL_API_KEY, using drawn Chrome" : `start failed (${r.status}), using drawn Chrome`);
        return null;
      }
      const j = (await r.json()) as Partial<Real>;
      if (!j.id || !j.viewerUrl) return null;
      current = { id: j.id, viewerUrl: j.viewerUrl, origin: j.origin ?? "https://agentsos.vercel.app" };
      log("session", current.id);
      return current;
    })
    .catch((e) => {
      log("start error, using drawn Chrome", e);
      return null;
    });
  return session;
}

function release() {
  if (!current) return;
  const body = JSON.stringify({ id: current.id });
  try {
    if (!navigator.sendBeacon?.("/api/browser/release", body)) throw new Error("beacon refused");
  } catch {
    fetch("/api/browser/release", { method: "POST", body, keepalive: true }).catch(() => {});
  }
  log("released", current.id);
  current = null;
  session = null;
}

const seedJson = new Map(seedObjects.map((o) => [o.key, JSON.stringify(o)]));

function b64url(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The real page for a drawn tab: only objects added/changed since seed ride along in ?s. */
export function realPath(site: Site, objects: Obj[], hl?: string): string {
  if (site === "jobs") return "/boards/a";
  const extra = objects.filter((o) => o.app === site && seedJson.get(o.key) !== JSON.stringify(o));
  const q = new URLSearchParams();
  if (extra.length) q.set("s", b64url(JSON.stringify(extra)));
  if (hl) q.set("hl", hl);
  const qs = q.toString();
  return `/web/${site}${qs ? `?${qs}` : ""}`;
}

/** Lazily opens the cloud browser when `root` scrolls into view; returns the session (or null) and a navigator. */
export function useRealChrome(root: React.RefObject<HTMLElement | null>) {
  const [real, setReal] = useState<Real | null>(null);
  const inflight = useRef(false);
  const queued = useRef<string | null>(null);

  const boot = useCallback(() => {
    start().then((r) => setReal(r));
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) {
        io.disconnect();
        boot();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [root, boot]);

  useEffect(() => {
    const onHide = () => {
      release();
      setReal(null);
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  const pump = useCallback(async (id: string) => {
    if (inflight.current) return;
    while (queued.current) {
      const url = queued.current;
      queued.current = null;
      inflight.current = true;
      try {
        const r = await fetch("/api/browser/show", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, url }) });
        log(r.ok ? "show" : `show failed (${r.status})`, url);
      } catch (e) {
        log("show error", e);
      } finally {
        inflight.current = false;
      }
    }
  }, []);

  /** Navigate the real browser (latest wins; calls made while one is in flight collapse to the newest). */
  const show = useCallback(
    (path: string) => {
      if (!real) return;
      queued.current = path;
      void pump(real.id);
    },
    [real, pump],
  );

  return { real, show, boot };
}
