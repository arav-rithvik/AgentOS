"use client";

// Dock magnification ported from Renovamen/playground-macos (MIT), which adopted it
// from PuruVJ/macos-web (MIT). See public/mac/LICENSE-playground-macos.txt.

import { Fragment, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

const SIZE = 48;
const MAG = 1.55;

function useHover(mouseX: MotionValue<number | null>, ref: React.RefObject<HTMLDivElement | null>) {
  const limit = SIZE * 6;
  const input = [-limit, -limit / (MAG * 0.65), -limit / (MAG * 0.85), 0, limit / (MAG * 0.85), limit / (MAG * 0.65), limit];
  const output = [SIZE, SIZE * (MAG * 0.55), SIZE * (MAG * 0.75), SIZE * MAG, SIZE * (MAG * 0.75), SIZE * (MAG * 0.55), SIZE];
  const distance = useMotionValue(limit + 1);
  const width = useSpring(useTransform(distance, input, output), { stiffness: 1700, damping: 90 });
  useAnimationFrame(() => {
    const el = ref.current;
    const x = mouseX.get();
    if (el && x !== null) {
      const r = el.getBoundingClientRect();
      distance.set(x - (r.left + r.width / 2));
    } else distance.set(limit + 1);
  });
  return width;
}

export type DockApp = { id: string; title: string; icon: React.ReactNode; open: boolean; sepAfter?: boolean };

function Item({ app, mouseX, onClick }: { app: DockApp; mouseX: MotionValue<number | null>; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useHover(mouseX, ref);
  return (
    <li className="group relative flex flex-col items-center justify-end pb-[5px]" onClick={onClick}>
      <p className="pointer-events-none absolute -top-[40px] hidden w-max rounded-full px-[12px] py-[4px] text-[13px] font-medium group-hover:block" style={{ color: "#fff", background: "rgba(40,40,44,.82)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 0 0 0.5px rgba(255,255,255,.18), 0 4px 12px rgba(0,0,0,.25)" }}>
        {app.title}
      </p>
      <motion.div ref={ref} style={{ width, height: width }} className="cursor-pointer">
        {app.icon}
      </motion.div>
      <div className="absolute bottom-[0px] h-[4px] w-[4px] rounded-full" style={{ background: app.open ? "rgba(255,255,255,.92)" : "transparent", boxShadow: app.open ? "0 0 2px rgba(0,0,0,.35)" : undefined }} />
    </li>
  );
}

export default function Dock({ apps, onOpen }: { apps: DockApp[]; onOpen: (id: string) => void }) {
  const mouseX = useMotionValue<number | null>(null);
  return (
    <div className="absolute inset-x-0 bottom-[6px] z-[56] mx-auto w-max">
      <ul
        className="flex items-end gap-[8px] px-[10px]"
        style={{ height: SIZE + 16, borderRadius: 24, background: "rgba(255,255,255,.22)", border: "1px solid rgba(255,255,255,.42)", backdropFilter: "blur(30px) saturate(1.8)", WebkitBackdropFilter: "blur(30px) saturate(1.8)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 10px 30px rgba(0,0,0,.2)" }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(null)}
      >
        {apps.map((a) => (
          <Fragment key={a.id}>
            <Item app={a} mouseX={mouseX} onClick={() => onOpen(a.id)} />
            {a.sepAfter && <li aria-hidden className="mx-[3px] mb-[9px] h-[46px] w-px self-end" style={{ background: "rgba(0,0,0,.22)" }} />}
          </Fragment>
        ))}
      </ul>
    </div>
  );
}
