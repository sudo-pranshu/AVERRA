"use client";

import { motion } from "framer-motion";

/** The AVERRA signal as a progress bar: the tremor damps toward a steady line as the presentation advances. */
export function WaveProgress({ index, total, onSelect, titles, accent }: { index: number; total: number; onSelect: (i: number) => void; titles: string[]; accent: string }) {
  const W = 1000, H = 30, mid = H / 2;
  const p = total > 1 ? index / (total - 1) : 1;
  const amp = 10 * Math.pow(1 - p, 1.15) + 0.4;
  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = (i / 200) * W;
    const env = Math.exp(-((x / W) * 2.2));
    pts.push(`${x.toFixed(1)},${(mid - amp * env * Math.sin((x / W) * Math.PI * 2 * 9)).toFixed(2)}`);
  }
  const d = "M" + pts.join(" L");
  const px = 8 + p * (W - 16);
  return (
    <div className="relative z-20 h-12 shrink-0 px-5 md:px-8">
      <div className="relative h-full">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-x-0 top-1/2 h-7 w-full -translate-y-1/2" aria-hidden="true">
          <path d={`M0,${mid} L${W},${mid}`} stroke="#2B3A5C" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
          <motion.path animate={{ d }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} stroke="#3B82F6" strokeOpacity={0.4} strokeWidth="1.4" fill="none" vectorEffect="non-scaling-stroke" />
          <defs>
            <clipPath id="wave-done"><motion.rect x="0" y="0" height={H} animate={{ width: px }} transition={{ duration: 0.6 }} /></clipPath>
          </defs>
          <motion.path animate={{ d, stroke: accent }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} clipPath="url(#wave-done)" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
        <motion.span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full" animate={{ left: `${(px / W) * 100}%`, backgroundColor: accent, boxShadow: `0 0 0 5px ${accent}33, 0 0 18px ${accent}` }} transition={{ duration: 0.6 }} />
        <div className="absolute inset-0 flex" role="tablist" aria-label="Jump to slide">
          {titles.map((t, i) => (
            <button key={t} role="tab" aria-selected={i === index} aria-label={`Go to slide ${i + 1}: ${t}`} title={`${i + 1}. ${t}`} onClick={() => onSelect(i)} className="group relative h-full flex-1 focus-visible:outline-offset-0">
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-navy-3 px-2 py-1 text-xs text-mist group-hover:block">{i + 1}. {t}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
