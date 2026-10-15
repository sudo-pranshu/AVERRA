"use client";

import { animate, motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Slide frame: label, a title that rises out of a mask, an optional lead, then the body. */
export function Frame({ label, title, lead, children, aside }: { label?: string; title: string; lead?: React.ReactNode; children?: React.ReactNode; wide?: boolean; aside?: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-end justify-between gap-8">
        <div className="min-w-0">
          {label && (
            <motion.p className="t-small mb-2 flex items-center gap-2 text-cyan" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease }}>
              <span className="inline-block h-px w-6 bg-cyan" />{label}
            </motion.p>
          )}
          <div className="overflow-hidden pb-1">
            <motion.h1 className="t-h1 max-w-[36ch]" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.7, ease, delay: 0.05 }}>{title}</motion.h1>
          </div>
          {lead && <motion.p className="t-body measure mt-2 text-mist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.25 }}>{lead}</motion.p>}
        </div>
        {aside}
      </div>
      <div className="mt-6 min-h-0 flex-1">{children}</div>
    </div>
  );
}

export const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } };
export const rise: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } };

export function Stagger({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "ul" | "ol" }) {
  const M = as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div;
  return <M variants={stagger} initial="hidden" animate="show" className={className}>{children}</M>;
}
export function Item({ children, className, as = "div", style }: { children: React.ReactNode; className?: string; as?: "div" | "li"; style?: React.CSSProperties }) {
  const M = as === "li" ? motion.li : motion.div;
  return <M variants={rise} className={className} style={style}>{children}</M>;
}

/** Animated number; respects reduced motion. */
export function CountUp({ to, format, className, delay = 0 }: { to: number; format: (n: number) => string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setV(to); return; }
    const c = animate(0, to, { duration: 1.2, ease, delay, onUpdate: setV });
    return () => c.stop();
  }, [inView, to, reduce, delay]);
  return <span ref={ref} className={`t-num ${className ?? ""}`}>{format(v)}</span>;
}

/** Segmented control. No shared-layout animation, so it stays correct inside the scaled stage. */
export function Tabs<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string; color?: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-full border hairline bg-navy-2/80 p-1">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button key={o.id} role="tab" aria-selected={on} onClick={() => onChange(o.id)}
            className={`t-small whitespace-nowrap rounded-full px-4 py-1.5 font-medium transition-all duration-300 ${on ? "text-navy shadow-[0_0_20px_-4px_var(--c)]" : "text-mist hover:text-white"}`}
            style={{ background: on ? o.color ?? "#06B6D4" : "transparent", ["--c" as string]: o.color ?? "#06B6D4" }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className="t-micro inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium" style={{ borderColor: `${color}99`, color, background: `${color}14` }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />{children}</span>;
}

export function Src({ children }: { children: React.ReactNode }) {
  return <p className="t-micro mt-4 max-w-5xl text-slate">{children}</p>;
}
