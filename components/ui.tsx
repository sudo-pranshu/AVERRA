"use client";

import { animate, motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function Frame({ label, title, lead, children, wide }: { label?: string; title: string; lead?: React.ReactNode; children?: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto flex min-h-full w-full flex-col ${wide ? "max-w-[1500px]" : "max-w-[1360px]"}`}>
      {label && <p className="t-small mb-3 text-cyan">{label}</p>}
      <h1 className="t-h1 measure">{title}</h1>
      {lead && <p className="t-body measure mt-3 text-mist">{lead}</p>}
      <div className="mt-8 flex-1 md:mt-10">{children}</div>
    </div>
  );
}

export const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };
export const rise: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}
export function Item({ children, className }: { children: React.ReactNode; className?: string }) {
  return <motion.div variants={rise} className={className}>{children}</motion.div>;
}

/** Animated number; respects reduced motion. */
export function CountUp({ to, format, className }: { to: number; format: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setV(to); return; }
    const c = animate(0, to, { duration: 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, to, reduce]);
  return <span ref={ref} className={`t-num ${className ?? ""}`}>{format(v)}</span>;
}

export function Tabs<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string; color?: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-full border hairline bg-navy-2 p-1">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button key={o.id} role="tab" aria-selected={on} onClick={() => onChange(o.id)}
            className={`relative rounded-full px-4 py-1.5 text-sm transition-colors ${on ? "text-navy" : "text-mist hover:text-white"}`}>
            {on && <motion.span layoutId={`tab-${label}`} className="absolute inset-0 rounded-full" style={{ background: o.color ?? "#06B6D4" }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative font-medium">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className="inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium" style={{ borderColor: color, color }}>{children}</span>;
}

export function Src({ children }: { children: React.ReactNode }) {
  return <p className="t-small mt-6 max-w-5xl text-slate">{children}</p>;
}
