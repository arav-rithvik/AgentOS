"use client";

// Port of the renderer in adamsky/globe (GPL-3.0, https://github.com/adamsky/globe),
// itself based on DinoZ1729/Earth. Rendered as text, tinted by CSS.

import { useEffect, useRef } from "react";
import { EARTH_DAY, EARTH_NIGHT } from "./textures";

const PALETTE = [" ", ".", ":", ";", "'", ",", "w", "i", "o", "g", "O", "L", "X", "H", "W", "Y", "V", "@"];
const parse = (t: string) => t.split("\n").filter((l) => l.length).map((l) => [...l].reverse());
const DAY = parse(EARTH_DAY);
const NIGHT = parse(EARTH_NIGHT);
const TEX_X = DAY[0].length - 1;
const TEX_Y = DAY.length - 1;

type V3 = [number, number, number];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (r: V3) => {
  const l = Math.sqrt(dot(r, r));
  r[0] /= l;
  r[1] /= l;
  r[2] /= l;
};

function camera(r: number, alpha: number, beta: number) {
  const sa = Math.sin(alpha), ca = Math.cos(alpha), sb = Math.sin(beta), cb = Math.cos(beta);
  const x = r * ca * cb, y = r * sa * cb, z = r * sb;
  const m = [-sa, ca, 0, 0, ca * sb, sa * sb, -cb, 0, ca * cb, sa * cb, sb, 0, x, y, z, 1];
  return { x, y, z, m };
}

function render(cols: number, rows: number, angle: number, camXY: number, night: boolean) {
  const cam = camera(1.55, camXY, 0);
  const light: V3 = [0, 999999, 0];
  const o: V3 = [cam.x, cam.y, cam.z];
  const hx = cols / 2, hy = rows / 2;
  let out = "";
  for (let yi = 0; yi < rows; yi++) {
    for (let xi = 0; xi < cols; xi++) {
      const ux = -(xi - hx + 0.5) / hx, uy = (yi - hy + 0.5) / hy, uz = -1;
      const m = cam.m;
      const u: V3 = [
        ux * m[0] + uy * m[4] + uz * m[8] + m[12] - cam.x,
        ux * m[1] + uy * m[5] + uz * m[9] + m[13] - cam.y,
        ux * m[2] + uy * m[6] + uz * m[10] + m[14] - cam.z,
      ];
      norm(u);
      const du = dot(u, o);
      const disc = du * du - dot(o, o) + 1;
      if (disc < 0) {
        out += " ";
        continue;
      }
      const d = -Math.sqrt(disc) - du;
      const p: V3 = [o[0] + d * u[0], o[1] + d * u[1], o[2] + d * u[2]];
      const n: V3 = [p[0], p[1], p[2]];
      norm(n);
      const l: V3 = [p[0] - light[0], p[1] - light[1], p[2] - light[2]];
      norm(l);
      const lum = Math.min(1, Math.max(0, 5 * dot(n, l) + 0.5));
      const phi = -p[2] / 2 + 0.5;
      let theta = Math.atan(p[1] / p[0]) / Math.PI + 0.5 + angle / 2 / Math.PI;
      theta -= Math.floor(theta);
      const ex = Math.floor(theta * TEX_X), ey = Math.floor(phi * TEX_Y);
      if (night) {
        const dI = PALETTE.indexOf(DAY[ey]?.[ex] ?? " ");
        const nI = PALETTE.indexOf(NIGHT[ey]?.[ex] ?? " ");
        let idx = Math.floor((1 - lum) * nI + lum * dI);
        if (idx < 0 || idx >= PALETTE.length) idx = 0;
        out += PALETTE[idx];
      } else {
        out += DAY[ey]?.[ex] ?? " ";
      }
    }
    out += "\n";
  }
  return out;
}

export default function Globe({ cols = 40, rows = 20, speed = 1, className = "" }: { cols?: number; rows?: number; speed?: number; className?: string }) {
  const ref = useRef<HTMLPreElement>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    let raf = 0, last = 0, angle = 0, cur = speedRef.current;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 50) return;
      last = t;
      cur += (speedRef.current - cur) * 0.08; // ease between idle and working speed
      const s = 0.02 * cur;
      angle += s; // camera stays put: orbiting it too cancelled the spin exactly
      if (ref.current) ref.current.textContent = render(cols, rows, angle, 0, false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cols, rows]);

  return <pre ref={ref} aria-hidden className={`globe ${className}`} />;
}
