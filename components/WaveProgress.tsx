"use client";

import { motion } from "framer-motion";

/** The AVERRA signal as a progress bar: the tremor damps toward a steady line as the presentation advances. */
export function WaveProgress({ index, total, onSelect, titles }: { index: number; total: number; onSelect: (i: number) => void; titles: string[] }) {
  const W = 1000, H = 40, mid = H / 2;
  const p = total > 1 ? index / (total - 1) : 1;
  const amp = 13 * Math.pow(1 - p, 1.15) + 0.4;
  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = (i / 200) * W;
    const env = Math.exp(-((x / W) * 2.2));
    pts.push(`${x.toFixed(1)},${(mid - amp * env * Math.sin((x / W) * Math.PI * 2 * 9)).toFixed(2)}`);
  }
  const d = "M" + pts.join(" L");
  const px = 8 + p * (W - 16);
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-navy from-55% to-transparent px-5 pb-4 pt-8 md:px-14">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-8 w-full" aria-hidden="true">
          <path d={`M0,${mid} L${W},${mid}`} stroke="#2B3A5C" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
          <motion.path animate={{ d }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} stroke="#3B82F6" strokeOpacity={0.45} strokeWidth="1.6" fill="none" vectorEffect="non-scaling-stroke" />
          <defs>
            <clipPath id="wave-done"><motion.rect x="0" y="0" height={H} animate={{ width: px }} transition={{ duration: 0.6 }} /></clipPath>
          </defs>
          <motion.path animate={{ d }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} clipPath="url(#wave-done)" stroke="#06B6D4" strokeWidth="2.2" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
        <motion.span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan shadow-[0_0_0_4px_rgba(6,182,212,0.18)]" animate={{ left: `${(px / W) * 100}%` }} transition={{ duration: 0.6 }} />
        <div className="pointer-events-auto absolute inset-0 flex" role="tablist" aria-label="Jump to slide">
          {titles.map((t, i) => (
            <button key={t} role="tab" aria-selected={i === index} aria-label={`Go to slide ${i + 1}: ${t}`} title={`${i + 1}. ${t}`} onClick={() => onSelect(i)} className="h-full flex-1 focus-visible:outline-offset-0" />
          ))}
        </div>
      </div>
    </div>
  );
}
