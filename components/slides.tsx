"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CountUp, Frame, Item, Pill, Src, Stagger, Tabs } from "@/components/ui";
import { D, K, SIG, STATUS, StatusKey, crore, inr, lakh, pct } from "@/lib/data";

const ts = D.tremosense;
const sc = ts.scenarios;
const F = D.funding;
const H = D.headline;
const MK = D.market;
const UE = D.unitEconomics;
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const beLabel = String(H.breakEvenMonth).replace("\n", " · ");
const beMonthName = (() => {
  const [m, y] = beLabel.split(" · ")[1].split("-");
  return `${{ Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June", Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December" }[m] ?? m} 20${y}`;
})();
const CYAN = "#06B6D4", VIOLET = "#8B5CF6", BLUE = "#3B82F6", MINT = "#34D399", AMBER = "#F59E0B";

/* ------------------------------------------------------------------ animation hook */
/** Calls fn(t) every frame while mounted (t in seconds). Stops for reduced motion. */
function useTicker(fn: (t: number) => void, run = true) {
  const reduce = useReducedMotion();
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!run) return;
    if (reduce) { ref.current(0.37); return; }
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => { ref.current((now - t0) / 1000); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduce, run]);
}

/* ------------------------------------------------------------------ shared drawing helpers */
/** Live signature: a tremor signal flows in from the left and leaves the AVERRA line ~90% calmer. */
function LiveSignal() {
  const W = 1320, Hh = 200, mid = Hh / 2, fx = W * 0.5;
  const raw = useRef<SVGPathElement>(null);
  const calm = useRef<SVGPathElement>(null);
  useTicker((t) => {
    const voluntary = (x: number) => 22 * Math.sin(2 * Math.PI * (x / W * 0.9 - t * 0.12));
    const tremor = (x: number) => 52 * Math.sin(2 * Math.PI * (x / W * 16 - t * 1.6)) * (0.75 + 0.25 * Math.sin(2 * Math.PI * (x / W * 2.3 - t * 0.3)));
    let a = "", b = "";
    for (let x = 0; x <= W; x += 4) {
      const k = x < fx ? 1 : 0.1 + 0.9 * Math.exp(-(x - fx) / 26);
      const y = (mid - voluntary(x) - k * tremor(x)).toFixed(1);
      if (x <= fx) a += `${a ? "L" : "M"}${x},${y}`;
      if (x >= fx) b += `${b ? "L" : "M"}${x},${y}`;
    }
    raw.current?.setAttribute("d", a);
    calm.current?.setAttribute("d", b);
  });
  return (
    <motion.svg viewBox={`0 0 ${W} ${Hh}`} className="w-full overflow-visible" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
      <defs>
        <linearGradient id="rawg" x1="0" x2="1"><stop offset="0" stopColor="#8B5CF6" stopOpacity="0" /><stop offset="0.35" stopColor="#8B5CF6" stopOpacity="0.9" /><stop offset="1" stopColor="#A78BFA" /></linearGradient>
        <filter id="glow" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path ref={raw} fill="none" stroke="url(#rawg)" strokeWidth="2.6" strokeLinejoin="round" />
      <path ref={calm} fill="none" stroke="#67E8F9" strokeWidth="3.2" strokeLinejoin="round" filter="url(#glow)" />
      <line x1={fx} x2={fx} y1="8" y2={Hh - 8} stroke="#fff" strokeOpacity="0.5" strokeDasharray="3 6" />
      <circle cx={fx} cy={mid} r="7" fill="#06B6D4"><animate attributeName="r" values="6;10;6" dur="2.4s" repeatCount="indefinite" /></circle>
      <text x={fx - 14} y="18" fill="#C4B5FD" fontSize="14" textAnchor="end">tremor in</text>
      <text x={fx + 14} y="18" fill="#67E8F9" fontSize="14">steady out</text>
    </motion.svg>
  );
}

function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={`rounded-2xl border hairline object-cover ${className ?? ""}`} />;
}

function Flow({ steps, color, highlight = [] }: { steps: string[]; color: string; highlight?: number[] }) {
  return (
    <ol className="relative space-y-2">
      <motion.span className="absolute bottom-4 left-[22px] top-4 w-px" style={{ background: `${color}55`, originY: 0 }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.9, ease, delay: 0.2 }} />
      {steps.map((s, i) => (
        <motion.li key={s} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12, duration: 0.45, ease }}
          className="t-small relative flex items-center gap-3 rounded-xl border px-3 py-2.5 backdrop-blur"
          style={{ borderColor: highlight.includes(i) ? color : "rgba(148,163,184,.16)", background: highlight.includes(i) ? `${color}1F` : "rgba(19,29,51,.8)" }}>
          <span className="t-num grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-semibold text-navy" style={{ background: color }}>{i + 1}</span>
          <span className="text-white">{s}</span>
        </motion.li>
      ))}
    </ol>
  );
}

function SignalToSpectrum() {
  const W = 520, Hh = 110;
  const xs = SIG.x as number[], maxX = Math.max(...xs.map(Math.abs));
  const line = xs.map((v, i) => `${((i / (xs.length - 1)) * W).toFixed(1)},${(Hh / 2 - (v / maxX) * (Hh / 2 - 6)).toFixed(1)}`).join(" L");
  const ps = SIG.p as number[], fs = SIG.f as number[];
  return (
    <figure className="panel p-5">
      <figcaption className="t-micro mb-2 text-slate">Raw movement (4 s) → frequency spectrum · synthetic signal for illustration</figcaption>
      <svg viewBox={`0 0 ${W} ${Hh}`} className="h-24 w-full" aria-label="Illustrative movement signal">
        <motion.path d={"M" + line} fill="none" stroke={CYAN} strokeWidth="1.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease }} />
      </svg>
      <div className="t-micro my-1 text-center text-blue">FFT</div>
      <svg viewBox={`0 0 ${W} 130`} className="h-28 w-full" aria-label="Illustrative spectrum with a tremor peak near 5 Hz">
        {ps.map((p, i) => {
          const bw = W / ps.length, h = (p / 100) * 110;
          const hot = fs[i] >= 4 && fs[i] <= 6.5;
          return <motion.rect key={i} x={i * bw + 1} width={bw - 2} y={120 - h} height={h} rx={1.5} fill={hot ? VIOLET : BLUE} fillOpacity={hot ? 1 : 0.55}
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: 1, transformBox: "fill-box" }} transition={{ delay: 1.4 + i * 0.012, duration: 0.4 }} />;
        })}
        <text x="4" y="129" fill="#94A3B8" fontSize="10">0 Hz</text><text x={W - 34} y="129" fill="#94A3B8" fontSize="10">12 Hz</text>
      </svg>
      <p className="t-micro mt-1 text-mist">Voluntary motion sits below 2 Hz; the tremor shows as its own peak near 5 Hz (violet).</p>
    </figure>
  );
}

/** Illustration of TremoSense: the handle shakes; with stabilisation on, the spoon head keeps ~10% of the motion. */
function SpoonDemo() {
  const [on, setOn] = useState(true);
  const [hz, setHz] = useState(6);
  const hand = useRef<SVGGElement>(null);
  const head = useRef<SVGGElement>(null);
  const trace = useRef<SVGPathElement>(null);
  const hist = useRef<number[]>([]);
  const state = useRef({ on, hz });
  state.current = { on, hz };
  useTicker((t) => {
    const { on: s, hz: f } = state.current;
    const a = 9 * Math.sin(2 * Math.PI * f * t * 0.5) + 2 * Math.sin(2 * Math.PI * 0.3 * t);
    const k = s ? 0.1 : 1;
    hand.current?.setAttribute("transform", `rotate(${a.toFixed(2)} 150 250)`);
    head.current?.setAttribute("transform", `rotate(${(-a * (1 - k)).toFixed(2)} 150 128)`);
    const h = hist.current;
    h.push(a * k);
    if (h.length > 120) h.shift();
    trace.current?.setAttribute("d", "M" + h.map((v, i) => `${(i * 2.5).toFixed(1)},${(30 - v * 2).toFixed(1)}`).join(" L"));
  });
  return (
    <div className="panel flex flex-col p-5">
      <div className="flex items-center justify-between">
        <p className="t-small text-white">Try it</p>
        <button onClick={() => setOn((v) => !v)} aria-pressed={on} className="t-micro flex items-center gap-2 rounded-full border hairline px-3 py-1 text-mist hover:text-white">
          <span className={`relative h-4 w-7 rounded-full transition-colors ${on ? "bg-violet" : "bg-line"}`}><span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${on ? "left-3.5" : "left-0.5"}`} /></span>
          Stabilisation {on ? "on" : "off"}
        </button>
      </div>
      <svg viewBox="0 0 300 300" className="mx-auto mt-2 h-[250px] w-full" aria-label="Animated spoon illustration">
        <circle cx="150" cy="128" r="70" fill={on ? "#8B5CF61A" : "#F871711A"} />
        <g ref={hand}>
          <rect x="138" y="160" width="24" height="120" rx="12" fill="#334155" stroke="#64748B" />
          <rect x="143" y="180" width="14" height="30" rx="4" fill="#8B5CF6" opacity="0.8" />
          <g ref={head}>
            <rect x="146" y="100" width="8" height="64" rx="4" fill="#CBD5E1" />
            <ellipse cx="150" cy="86" rx="26" ry="34" fill="#E2E8F0" />
            <ellipse cx="150" cy="84" rx="18" ry="25" fill="#CBD5E1" />
            <circle cx="146" cy="80" r="4" fill="#F59E0B" /><circle cx="155" cy="86" r="3.5" fill="#F59E0B" /><circle cx="148" cy="91" r="3" fill="#FBBF24" />
          </g>
        </g>
      </svg>
      <svg viewBox="0 0 300 60" className="h-12 w-full" aria-hidden="true"><line x1="0" x2="300" y1="30" y2="30" stroke="#2B3A5C" /><path ref={trace} fill="none" stroke={on ? "#A78BFA" : "#F87171"} strokeWidth="2" /></svg>
      <p className="t-micro text-slate">Spoon-head motion</p>
      <div className="mt-3 flex gap-2" role="group" aria-label="Tremor frequency">
        {[4, 6, 8].map((f) => (
          <button key={f} onClick={() => setHz(f)} aria-pressed={hz === f} className={`t-micro flex-1 rounded-full border px-2 py-1 transition-colors ${hz === f ? "border-violet bg-violet/20 text-white" : "hairline text-mist hover:text-white"}`}>{f} Hz</button>
        ))}
      </div>
      <p className="t-micro mt-3 text-slate">Illustration at half speed, scaled to the ≈90% bench result. Not a recording.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ 1 opening */
function Opening() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="-mx-4"><LiveSignal /></div>
      <div className="mt-6 grid grid-cols-1 items-end gap-10 @5xl:grid-cols-[1.25fr_1fr]">
        <div>
          <motion.img src="/brand/averra-wordmark-white.svg" alt="AVERRA" className="h-9 w-auto @3xl:h-11" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} />
          <div className="mt-5 overflow-hidden pb-2">
            <motion.h1 className="t-display grad-text max-w-[15ch]" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ delay: 0.8, duration: 0.9, ease }}>{K.brand.tagline}</motion.h1>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.8 }}>
          <p className="t-body text-mist">{K.brand.positioning}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="panel lift p-4"><p className="t-small font-semibold text-cyan">ParkinSense</p><p className="t-small mt-1 text-mist">Measures and helps people understand movement</p></div>
            <div className="panel lift p-4"><p className="t-small font-semibold text-violet">TremoSense</p><p className="t-small mt-1 text-mist">Assists people who live with tremor</p></div>
          </div>
          <p className="t-small mt-5 text-slate">Pranshu Kumar and Pawan Shinde · VJTI Mumbai <span className="ml-3 text-slate/70">Press → to begin</span></p>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 2 problem */
function Problem() {
  const st = K.problem.stats;
  return (
    <Frame label="The problem" title="Movement is measured for minutes, and lived with all day" lead="Clinic visits sample a few minutes. At home, tremor in the 4–12 Hz band turns a spoon into a spill.">
      <Stagger className="grid gap-4 @3xl:grid-cols-3">
        {[[MK.pd60 / 1e5, "Indians aged 60+ living with Parkinson's (derived from UNFPA 2023 × community prevalence)"], [MK.et / 1e5, "people with essential tremor (single rural-Gujarat study)"]].map(([v, l], i) => (
          <Item key={i} className="panel lift p-6">
            <p className="t-h1 text-cyan"><CountUp to={v as number} format={(n) => `≈${n.toFixed(1)} lakh`} /></p>
            <p className="t-small mt-2 text-mist">{l}</p>
          </Item>
        ))}
        <Item className="panel lift p-6"><p className="t-h1 text-violet">{st[2][0]}</p><p className="t-small mt-2 text-mist">{st[2][1]}</p></Item>
      </Stagger>
      <div className="mt-8 flex items-baseline gap-4">
        <h2 className="t-h2">What the research says</h2>
        <p className="t-micro text-slate">{K.problem.quotesNote}</p>
      </div>
      <Stagger className="mt-4 grid gap-4 @3xl:grid-cols-3">
        {K.problem.quotes.map(([who, q, src, url]) => (
          <Item key={who} className="panel lift flex flex-col p-5">
            <span className="text-5xl leading-none text-cyan/40" aria-hidden="true">“</span>
            <p className="t-body -mt-3 flex-1 text-white">{q}</p>
            <footer className="t-micro mt-4 border-t hairline pt-3"><span className="text-cyan">{who}</span> <a href={url} target="_blank" rel="noreferrer" className="text-slate underline decoration-slate/40 hover:text-mist">{src}</a></footer>
          </Item>
        ))}
      </Stagger>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 3 why now */
const WHY_MEANS = [
  "Wrist movement data became something mainstream platforms collect.",
  "A regulator has cleared wrist-based Parkinson's monitoring, so a path exists.",
  "We can now plan and cost the Indian approval route.",
  "Our core users more than double by 2050.",
  "Demand for tremor monitoring and aids keeps rising.",
];

function WhyNow() {
  return (
    <Frame label="Why now" title="Five shifts that make AVERRA possible today" lead="Each shift is dated and sourced. The line under each says what it means for us.">
      <div className="relative mt-10">
        <motion.div className="absolute left-0 right-0 top-[11px] hidden h-[2px] @3xl:block" style={{ background: "linear-gradient(90deg,#06B6D4,#8B5CF6)", originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.4, ease }} />
        <ol className="grid gap-6 @3xl:grid-cols-5">
          {K.whyNow.map(([date, text, url], i) => (
            <motion.li key={date + text} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.2, duration: 0.5, ease }}>
              <motion.span className={`block h-[24px] w-[24px] rounded-full border-4 border-navy ${i % 2 ? "bg-violet" : "bg-cyan"}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.2, type: "spring", stiffness: 400, damping: 15 }} />
              <p className="t-h2 mt-5">{date}</p>
              <p className="t-body mt-2 text-mist">{text}</p>
              <p className="t-small mt-2 border-l-2 pl-2.5 text-white" style={{ borderColor: i % 2 ? VIOLET : CYAN }}>{WHY_MEANS[i]}</p>
              <a href={url} target="_blank" rel="noreferrer" className="t-micro mt-2 inline-block text-slate underline hover:text-white">Source</a>
            </motion.li>
          ))}
        </ol>
      </div>
      <motion.div className="mt-10 grid gap-4 @3xl:grid-cols-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
        <div className="panel p-5"><p className="t-h1 t-num text-cyan">$15.90</p><p className="t-small mt-1 text-mist">The microcontroller with an on-board 6-axis IMU used in both products. Hardware is no longer the barrier; validation is.</p></div>
        <div className="panel p-5"><p className="t-small font-medium text-violet">Why not three years ago?</p><p className="t-small mt-1 text-mist">Before October 2023, India had no mandatory, defined licensing route for devices like ours, so a product could not be planned and costed end to end.</p></div>
        <div className="panel p-5"><p className="t-small font-medium text-amber">Why the window will not stay open</p><p className="t-small mt-1 text-mist">Global wearable brands already sense movement. If they add tremor features or imported aids get cheaper, the low-cost Indian gap closes.</p></div>
      </motion.div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 4 portfolio */
function Portfolio() {
  const [focus, setFocus] = useState<"ps" | "ts" | null>(null);
  const shared = ["Nordic nRF52840 microcontroller family", "LSM6DS3 6-axis IMU", "Real-time signal processing", "Embedded firmware", "The same founding team"];
  const card = (id: "ps" | "ts", name: string, role: string, color: string, img: string, rows: [string, string][], from: number) => (
    <motion.button initial={{ opacity: 0, x: from }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease, delay: 0.2 }}
      onClick={() => setFocus(focus === id ? null : id)} aria-pressed={focus === id}
      className="panel lift group flex flex-col p-6 text-left" style={{ borderColor: focus === id ? color : undefined }}>
      <Photo src={img} alt={`${name} prototype`} className="h-56 w-full" />
      <p className="t-h2 mt-5">{name}</p><p className="t-small" style={{ color }}>{role}</p>
      <dl className="t-small mt-4 space-y-2 text-mist">
        {rows.map(([k, v]) => <div key={k}><dt className="inline text-white">{k}: </dt><dd className="inline">{v}</dd></div>)}
      </dl>
    </motion.button>
  );
  return (
    <Frame label="One company, two products" title="Shared engineering, different customers" lead="The shared column is limited to what the evidence supports.">
      <div className="grid items-start gap-6 @5xl:grid-cols-[1fr_300px_1fr]">
        {card("ps", "ParkinSense", "Measure and understand movement", CYAN, "/images/parkinsense-wrist.jpg", [["Who", "anyone who wants activity, vitals and movement insight, from fitness users to people living with movement disorders"], ["Buys it", "the user, online or via clinics"], ["Value", "activity and vitals, with tremor detection as its standout feature"]], -40)}
        <div className="flex flex-col items-center gap-2 pt-6">
          <motion.img src="/brand/averra-mark-white.svg" alt="" className="h-16 w-16" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.4 }} />
          <p className="t-small mb-1 text-blue">Shared</p>
          {shared.map((s, i) => (
            <motion.p key={s} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.1 }}
              className="t-small w-full rounded-full border border-blue/50 bg-blue/10 px-3 py-1.5 text-center text-white">{s}</motion.p>
          ))}
          <p className="t-micro mt-2 text-center text-slate">No shared revenue or cost savings claimed.</p>
        </div>
        {card("ts", "TremoSense", "Assist people who live with tremor", VIOLET, "/images/tremosense-concept.jpg", [["Who", "people whose tremor disrupts eating, and their families"], ["Buys it", "families, via clinic or OT referral"], ["Value", "eat more independently, at an Indian price"]], 40)}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 5 ParkinSense */
function ParkinSense() {
  const [filter, setFilter] = useState<"all" | StatusKey>("all");
  const [zoom, setZoom] = useState(false);
  const feats = K.parkinsense.features as [string, StatusKey, string][];
  const keys = Array.from(new Set(feats.map((f) => f[1])));
  const shown = feats.filter((f) => filter === "all" || f[1] === filter);
  return (
    <Frame label="ParkinSense" title="A wearable for everyone, with tremor detection built in">
      <div className="grid h-full gap-6 @5xl:grid-cols-[250px_1fr]">
        <div className="space-y-3">
          <Photo src="/images/parkinsense-wrist.jpg" alt="ParkinSense prototype worn on the wrist" className="aspect-[5/4] w-full" />
          <button onClick={() => setZoom(true)} className="group relative block w-full overflow-hidden rounded-xl border hairline text-left" aria-label="Enlarge the ParkinSense dashboard screenshot">
            <img src="/images/parkinsense-dashboard-app.jpg" alt="ParkinSense dashboard showing tremor detected at 4.88 Hz" className="w-full transition-transform duration-500 group-hover:scale-105" />
            <span className="t-micro absolute bottom-1 right-1.5 rounded-full bg-navy/80 px-2 py-0.5 text-mist">Live dashboard ⤢</span>
          </button>
          <div className="rounded-2xl border border-amber/50 bg-amber/5 p-3">
            <p className="t-small flex items-center gap-2 text-amber"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-amber" /></span>{K.clinicalEvaluation.label}</p>
            <p className="t-micro mt-1 text-mist">{K.clinicalEvaluation.detail}</p>
          </div>
          <div className="rounded-2xl border border-violet/40 bg-violet/10 p-3">
            <p className="t-micro text-mist"><span className="text-violet">Research path, not a claim: </span>{K.parkinsense.researchPath.join(" → ")}. ParkinSense does not diagnose Parkinson's.</p>
          </div>
        </div>
        <div className="flex min-h-0 flex-col">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter features by status">
            {(["all", ...keys] as ("all" | StatusKey)[]).map((k) => (
              <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k}
                className={`t-micro rounded-full border px-3 py-1 transition-colors ${filter === k ? "border-white bg-white text-navy" : "hairline text-mist hover:text-white"}`}>
                {k === "all" ? "All features" : STATUS[k].label}
              </button>
            ))}
          </div>
          <ul className="mt-3 grid grid-cols-1 gap-2 @3xl:grid-cols-2 @5xl:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {shown.map(([name, st, note], i) => (
                <motion.li key={name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }} exit={{ opacity: 0 }}
                  className="rounded-xl border hairline bg-navy-2/80 px-3 py-2">
                  <Pill color={STATUS[st].color}>{STATUS[st].label}</Pill>
                  <p className="t-small mt-1 text-white">{name}</p>
                  <p className="t-micro mt-0.5 text-slate">{note}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
      <AnimatePresence>
        {zoom && (
          <motion.button onClick={() => setZoom(false)} className="fixed inset-0 z-50 grid cursor-zoom-out place-items-center bg-navy/85 p-10 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-label="Close the enlarged screenshot">
            <motion.figure initial={{ scale: 0.92, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} transition={{ ease }} className="max-w-[1240px]">
              <img src="/images/parkinsense-dashboard-app.jpg" alt="ParkinSense dashboard showing tremor detected at 4.88 Hz" className="w-full rounded-2xl border hairline shadow-2xl" />
              <figcaption className="t-small mt-3 text-left text-mist">ParkinSense dashboard (Python / Plotly Dash) reading the wearable over BLE: tremor detected at 4.88 Hz, tremor score 85, low-motion context. {K.parkinsense.hardware}</figcaption>
            </motion.figure>
          </motion.button>
        )}
      </AnimatePresence>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 6 TremoSense */
function TremoSense() {
  const [tab, setTab] = useState<"how" | "audit">("how");
  return (
    <Frame label="TremoSense" title="Active stabilisation at the spoon" lead={K.tremosense.pitch}>
      <div className="grid items-start gap-6 @5xl:grid-cols-[330px_250px_1fr]">
        <SpoonDemo />
        <Stagger className="flex flex-col gap-3">
          {K.tremosense.results.map(([v, l, st], i) => (
            <Item key={l} className={`panel lift p-5 ${i === 0 ? "border-violet/60" : ""}`}>
              <p className="t-h1 t-num" style={{ color: st === "planned" ? AMBER : i === 0 ? "#C4B5FD" : VIOLET }}>{v}</p>
              <p className="t-micro mt-1 text-mist">{l}</p>
            </Item>
          ))}
        </Stagger>
        <div>
          <Tabs label="TremoSense detail" value={tab} onChange={setTab} options={[{ id: "how", label: "How it works", color: VIOLET }, { id: "audit", label: "Current build vs paper", color: AMBER }]} />
          <div className="mt-4">
            <AnimatePresence mode="wait">
              {tab === "how" ? (
                <motion.div key="how" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Flow steps={K.tremosense.architecture} color={VIOLET} highlight={[1, 2]} /></motion.div>
              ) : (
                <motion.table key="audit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="t-small w-full border-collapse">
                  <thead><tr className="text-left text-white"><th className="p-2"> </th><th className="p-2">Current build</th><th className="p-2">Paper prototype</th></tr></thead>
                  <tbody>{K.tremosense.repoVsPaper.map(([k, a, b]) => <tr key={k} className="border-t hairline align-top"><td className="p-2 text-slate">{k}</td><td className="p-2 text-mist">{a}</td><td className="p-2 text-mist">{b}</td></tr>)}</tbody>
                </motion.table>
              )}
            </AnimatePresence>
          </div>
          <p className="t-small mt-4 text-coral">Next: publish bench logs (M3), then test with people (M6).</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 7 architecture */
function Architecture() {
  const [tab, setTab] = useState<"ps" | "ts">("ps");
  return (
    <Frame label="Technical architecture" title="From a moving hand to a decision, in milliseconds" lead="Both products start from the same physics: separate slow voluntary motion from 4–12 Hz tremor.">
      <Tabs label="architecture" value={tab} onChange={setTab} options={[{ id: "ps", label: "ParkinSense", color: CYAN }, { id: "ts", label: "TremoSense", color: VIOLET }]} />
      <div className="mt-6 grid gap-6 @5xl:grid-cols-2">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            {tab === "ps" ? <Flow steps={K.parkinsense.architecture} color={CYAN} highlight={[3]} /> : <Flow steps={K.tremosense.architecture} color={VIOLET} highlight={[1, 2]} />}
            <p className="t-small mt-4 text-slate">{tab === "ps" ? "Analysis runs in the host runtime today; on-wrist processing is not yet implemented." : "The current build runs a lighter 2-state EKF at 208 Hz on Zephyr; the paper prototype used a 4-state bias-tracking EKF at 100 Hz."}</p>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {tab === "ps" ? (
            <motion.figure key="dash" className="panel p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <img src="/images/parkinsense-dashboard-app.jpg" alt="ParkinSense dashboard showing tremor detected at 4.88 Hz" className="w-full rounded-xl border hairline" />
              <figcaption className="t-micro mt-3 text-mist">The working ParkinSense dashboard: tremor detected at 4.88 Hz with a tremor score of 85, while the motion classifier reports low motion, so the shaking is not counted as steps.</figcaption>
            </motion.figure>
          ) : (
            <motion.div key="spec" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><SignalToSpectrum /></motion.div>
          )}
        </AnimatePresence>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 8 competition */
function Competition() {
  const [tab, setTab] = useState<"parkinsense" | "tremosense">("parkinsense");
  const cmp = K.competitors[tab];
  const color = tab === "parkinsense" ? CYAN : VIOLET;
  const priceRows = tab === "parkinsense"
    ? [...D.competitors.filter((c) => ["WHOOP One (WHOOP 5.0)", "Fitbit Charge 6", "Amazfit Bip 6"].includes(c.name)).map((c) => ({ name: c.name.replace(" (WHOOP 5.0)", " (12-mo)"), inr: c.inr, src: c.source, ours: false })), { name: "ParkinSense (hypothesis)", inr: D.assumptions.P3 as number, src: "", ours: true }]
    : [...D.competitors.filter((c) => ["GyroGlove", "Liftware (stabilising handle)", "Weighted soup spoon (225 g)"].includes(c.name)).map((c) => ({ name: c.name.replace(" (stabilising handle)", " (2015 price)").replace(" (225 g)", ""), inr: c.inr, src: c.source, ours: false })), { name: "TremoSense (hypothesis)", inr: ts.launchPrice, src: "", ours: true }];
  const max = Math.log10(Math.max(...priceRows.map((r) => r.inr)));
  const min = Math.log10(1000);
  return (
    <Frame label="Competition" title="Where we can compete, and what we still have to prove" lead={`Prices checked ${K.competitors.checked}. Benchmarks only; they do not drive AVERRA revenue.`}
      aside={<Tabs label="competitors" value={tab} onChange={setTab} options={[{ id: "parkinsense", label: "ParkinSense vs wearables", color: CYAN }, { id: "tremosense", label: "TremoSense vs tremor aids", color: VIOLET }]} />}>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-6 @5xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
          <div className="panel p-5">
            <p className="t-micro mb-4 text-slate">Price in India, ₹ (log scale)</p>
            <ul className="space-y-3">
              {priceRows.map((r, i) => (
                <li key={r.name}>
                  <div className="t-small flex justify-between"><span className={r.ours ? "font-semibold text-white" : "text-mist"}>{r.name}</span><span className="t-num text-white">{inr(r.inr)}</span></div>
                  <div className="mt-1.5 h-2.5 rounded-full bg-navy-3">
                    <motion.div className="h-full rounded-full" style={{ background: r.ours ? `linear-gradient(90deg, ${color}, #fff)` : "#475569", boxShadow: r.ours ? `0 0 16px ${color}` : undefined }} initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, ((Math.log10(r.inr) - min) / (max - min)) * 100)}%` }} transition={{ delay: 0.2 + i * 0.12, duration: 0.9, ease }} />
                  </div>
                  {r.src && <a href={r.src} target="_blank" rel="noreferrer" className="t-micro text-slate underline hover:text-white">source</a>}
                </li>
              ))}
            </ul>
            <p className="t-micro mt-3 text-slate">{tab === "tremosense" ? "Different products: a spoon is not a whole-hand glove. Price context only." : "WHOOP's price is a 12-month membership that includes the strap."}</p>
          </div>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border hairline">
              <table className="t-small w-full border-collapse">
                <thead><tr>{cmp.columns.map((c, j) => <th key={c + j} className="bg-navy-3/90 p-2.5 text-left font-semibold" style={{ color: j === 4 ? color : "#fff" }}>{c}</th>)}</tr></thead>
                <tbody>{cmp.rows.map((r, ri) => <motion.tr key={r[0]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + ri * 0.08 }} className="border-t hairline align-top">{r.map((c, j) => <td key={j} className={`p-2.5 ${j === 0 ? "text-slate" : j === 4 ? "text-white" : "text-mist"}`} style={j === 4 ? { background: `${color}17` } : { background: "rgba(19,29,51,.6)" }}>{c}</td>)}</motion.tr>)}</tbody>
              </table>
            </div>
            <dl className="grid gap-3 @3xl:grid-cols-2">
              {cmp.positioning.map(([k, v]) => <div key={k} className="panel p-3.5"><dt className="t-small font-medium" style={{ color }}>{k}</dt><dd className="t-micro mt-1 text-mist">{v}</dd></div>)}
            </dl>
          </div>
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 9 market */
function Market() {
  const T = MK.totals;
  const layers = [["TAM", T.tam, "Patients × annual revenue per customer", BLUE, 100], ["SAM", T.sam, "Urban and under neurologist follow-up", CYAN, 76], ["SOM · Year 3", T.som, "30 clinics in Mumbai and Pune, plus online", VIOLET, 52]] as const;
  return (
    <Frame label="Market opportunity" title="Bottom-up, product by product" lead="Customer counts come from sourced prevalence and IDC shipments; prices are hypotheses. The general-wearable column is upside, not in the plan totals.">
      <div className="grid items-center gap-8 @5xl:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col items-center gap-3">
          {layers.map(([k, v, l, c, w], i) => (
            <motion.div key={k} initial={{ opacity: 0, scaleX: 0.5 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.2 + i * 0.35, duration: 0.7, ease }}
              className="rounded-2xl border px-6 py-4 text-center backdrop-blur" style={{ width: `${w}%`, borderColor: `${c}AA`, background: `linear-gradient(180deg, ${c}30, ${c}10)`, boxShadow: `0 20px 50px -30px ${c}` }}>
              <p className="t-small" style={{ color: c }}>{k}</p>
              <p className="t-h1 t-num"><CountUp to={v} delay={0.2 + i * 0.35} format={(n) => (k.startsWith("SOM") ? lakh(n) : crore(n))} /></p>
              <p className="t-micro text-mist">{l}</p>
            </motion.div>
          ))}
        </div>
        <div className="panel p-5">
          <table className="t-small w-full border-collapse">
            <thead><tr className="text-left align-bottom"><th className="p-2"></th><th className="p-2 text-cyan">ParkinSense (PD households)</th><th className="p-2 text-violet">TremoSense</th><th className="p-2 text-mint">ParkinSense as a general wearable <span className="t-micro block font-normal text-slate">upside, not in plan totals</span></th></tr></thead>
            <tbody>
              {[["TAM customers", MK.parkinsense.customers.toLocaleString("en-IN"), MK.tremosense.customers.toLocaleString("en-IN"), `${(MK.general.customers / 1e6).toFixed(1)}M buyers/yr`],
                ["₹ per customer per year", inr(MK.parkinsense.revPerCustomer), inr(MK.tremosense.revPerCustomer), inr(MK.general.revPerCustomer)],
                ["TAM", crore(MK.parkinsense.tam), crore(MK.tremosense.tam), crore(MK.general.tam, 0)], ["SAM", crore(MK.parkinsense.sam), crore(MK.tremosense.sam), crore(MK.general.sam)],
                ["SOM customers per year", MK.parkinsense.somCustomers.toLocaleString("en-IN"), MK.tremosense.somCustomers.toLocaleString("en-IN"), MK.general.somCustomers.toLocaleString("en-IN")], ["SOM", lakh(MK.parkinsense.som), lakh(MK.tremosense.som), lakh(MK.general.som)]].map((r) => (
                <tr key={r[0]} className="border-t hairline"><td className="p-2 text-slate">{r[0]}</td><td className="t-num p-2 text-white">{r[1]}</td><td className="t-num p-2 text-white">{r[2]}</td><td className="t-num p-2 text-mint" style={{ background: "rgba(52,211,153,.07)" }}>{r[3]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Src>Sources: UNFPA India Ageing Report 2023; Khurana &amp; Gourie-Devi, Cureus 2025; Chin et al., Mov Disord 2021; Census 2011; IDC India wearables 2024 (35.0M smartwatches, 2.8% advanced). Estimates: 40% under follow-up, 50% with eating-disruptive tremor, 0.25% SOM share for the general-wearable column.</Src>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 10 MVP */
function MVP() {
  const rows = [
    { name: "TremoSense", color: VIOLET, cells: ["Motorised tremor simulator, 4/6/8 Hz, ±5°; 2 people with tremor tried it informally", "≈90% tremor rejection on the current build (founder-reported); positive informal feedback, no metric", "Self-feeding task, n ≥ 10: median reduction ≥50% and ≥60% would pay (M6)", "Persevere: validate on people before any claim"] },
    { name: "ParkinSense", color: CYAN, cells: ["Bench conditions, BLE soak, power profiling; clinical evaluation with ICMR in progress", "8/8 bench conditions correct; ≈7 mA. ICMR results pending", "Dominant-frequency error ≤5% vs reference; 0 false steps in tremor (M10)", "Persevere: wellness launch; no clinical claim until results"] },
  ];
  const head = ["Experiment run", "Result so far", "Pre-registered next metric", "Decision"];
  return (
    <Frame label="MVP and validation" title="Bench-proven, clinical evaluation under way" lead="No metric was pre-registered before the bench tests. These are the first pre-registered tests.">
      <div className="mb-3 hidden grid-cols-[160px_repeat(4,1fr)] gap-3 @3xl:grid">
        <span />{head.map((h, j) => <p key={h} className="t-micro flex items-center gap-2 text-slate"><span className="t-num grid h-5 w-5 place-items-center rounded-full border hairline">{j + 1}</span>{h}</p>)}
      </div>
      <div className="space-y-5">
        {rows.map((r, ri) => (
          <div key={r.name} className="grid gap-3 @3xl:grid-cols-[160px_repeat(4,1fr)]">
            <motion.p className="t-h2 self-center" style={{ color: r.color }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + ri * 0.4 }}>{r.name}</motion.p>
            {r.cells.map((c, j) => (
              <motion.div key={j} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + ri * 0.4 + j * 0.12, ease }}
                className={`rounded-2xl border p-4 backdrop-blur ${j === 3 ? "border-mint/50 bg-mint/10" : j === 2 ? "border-amber/50 bg-amber/5" : "hairline bg-navy-2/80"}`}>
                <p className="t-micro text-slate @3xl:hidden">{head[j]}</p>
                <p className={`t-small ${j === 3 ? "text-mint" : "text-white"}`}>{c}</p>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      <motion.div className="mt-8 flex items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
        {["Bench", "Pre-registered user study (M6)", "Clinical evidence (ICMR results)", "Claims"].map((s, i) => (
          <div key={s} className="flex items-center gap-4"><span className={`t-small rounded-full border px-3 py-1 ${i === 0 ? "border-mint/60 text-mint" : "hairline text-mist"}`}>{s}</span>{i < 3 && <span className="text-slate">→</span>}</div>
        ))}
      </motion.div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 11 business model */
function BusinessModel() {
  const fc = D.forecast as typeof D.forecast & { revTs: number[]; revKits: number[]; revPs: number[]; revSub: number[] };
  const y3 = (a: number[]) => a.slice(24, 36).reduce((x, v) => x + v, 0);
  const streams = [
    { k: "TremoSense sale or rental", price: inr(ts.launchPrice), sub: `${inr(ts.postCostPrice)} from M19 · rental ${inr(D.assumptions.P11 as number)}/mo`, when: "From M12", v: y3(fc.revTs), c: VIOLET },
    { k: "ParkinSense device", price: inr(D.assumptions.P3 as number), sub: "one-time, sold online and via clinics", when: "From M25", v: y3(fc.revPs), c: CYAN },
    { k: "Research-use kits for labs", price: inr(UE.ruoKit.price), sub: "per kit, no medical claim", when: "From M10", v: y3(fc.revKits), c: BLUE },
    { k: "ParkinSense subscription", price: `${inr(D.assumptions.P4 as number)}/mo`, sub: "optional insights plan", when: "From M25", v: y3(fc.revSub), c: MINT },
  ];
  const tot = streams.reduce((x, r) => x + r.v, 0);
  const B = ({ k, v, c, className = "" }: { k: string; v: string; c?: string; className?: string }) => (
    <Item className={`panel lift flex flex-col p-3.5 ${className}`} style={c ? { borderColor: `${c}88`, background: `linear-gradient(180deg, ${c}26, rgba(19,29,51,.75))` } : undefined}>
      <p className="t-micro font-medium uppercase tracking-wide" style={{ color: c ?? "#94A3B8" }}>{k}</p>
      <p className="t-small mt-1 text-white">{v}</p>
    </Item>
  );
  return (
    <Frame label="Business model" title="Clinics bring patients, families buy, labs fund early data">
      <Stagger className="grid grid-cols-1 gap-2.5 @5xl:grid-cols-5">
        <B k="Key partners" v="Neurology clinics, OT centres, university labs, a test lab, a contract assembler" className="@5xl:row-span-2" />
        <B k="Key activities" v="User studies, CDSCO and ISO 13485, firmware, small-batch assembly" />
        <B k="Value propositions" v="ParkinSense: a wearable for everyone with built-in tremor detection. TremoSense: active tremor assistance at an Indian price" c={CYAN} className="@5xl:row-span-2" />
        <B k="Relationships" v="Clinic-assisted trials, caregiver onboarding" />
        <B k="Customer segments" v="Everyday wearable users, households living with PD or ET, research labs" className="@5xl:row-span-2" />
        <B k="Key resources" v="Sensing and control know-how, bench evidence, two papers, prototypes" />
        <B k="Channels" v="Clinic and OT referral, direct online, institutional procurement" />
        <B k="Cost structure" v="Phase 1: team, study units, user study, IP. Then quality system, EMC testing, inventory and tooling, clinic outreach. Revenue streams below." className="@5xl:col-span-5" />
      </Stagger>
      <div className="mt-5 flex items-baseline justify-between">
        <h2 className="t-h2">Revenue streams and Year-3 revenue</h2>
        <p className="t-small text-slate">Year 3 cash in <span className="t-num text-white">{crore(tot, 2)}</span> · no reimbursement assumed</p>
      </div>
      <div className="mt-3 flex h-3 w-full gap-1 overflow-hidden rounded-full">
        {streams.map((r, i) => <motion.div key={r.k} initial={{ width: 0 }} animate={{ width: `${(r.v / tot) * 100}%` }} transition={{ delay: 0.6 + i * 0.12, duration: 0.7, ease }} style={{ background: r.c }} />)}
      </div>
      <div className="mt-3 grid gap-3 @3xl:grid-cols-4">
        {streams.map((r, i) => (
          <motion.div key={r.k} className="panel lift p-4" style={{ borderColor: `${r.c}77` }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.12, ease }}>
            <div className="flex items-center justify-between"><p className="t-small font-medium" style={{ color: r.c }}>{r.k}</p><span className="t-micro rounded-full border hairline px-2 py-0.5 text-slate">{r.when}</span></div>
            <p className="t-h2 t-num mt-1 text-white">{r.price}</p>
            <p className="t-micro text-slate">{r.sub}</p>
            <div className="mt-3 border-t hairline pt-2">
              <p className="t-micro text-slate">Year 3</p>
              <p className="t-small t-num text-white"><CountUp to={r.v} delay={0.8} format={(n) => lakh(n)} /> <span className="text-slate">· {pct(r.v / tot)}</span></p>
            </div>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 12 pricing */
function Pricing() {
  const [scen, setScen] = useState<"A" | "B" | "C">("B");
  const [price, setPrice] = useState<number>(ts.launchPrice);
  const row = ts.priceMatrix.find((r) => r.price === price)!;
  const contrib = row[scen], margin = row[`${scen}m` as "Am" | "Bm" | "Cm"];
  const s = sc[scen];
  const maxCost = Math.max(...(["A", "B", "C"] as const).map((k) => sc[k].cogs));
  const tl = UE.tremosenseLtv, pl = UE.parkinsenseLtv;
  return (
    <Frame label="Pricing and unit economics" title="Profitable from the first unit, with a path to lower prices" lead={`Prototype parts cost ${inr(ts.prototypePartsCost)} today. ₹2,000 is a volume-production target for the electronics, not today's cost.`}>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="panel p-5">
          <Tabs label="cost scenario" value={scen} onChange={setScen} options={[{ id: "A", label: "A · prototype" }, { id: "B", label: "B · small batch" }, { id: "C", label: "C · scaled" }]} />
          <div className="mt-4 space-y-1.5">
            {s.lines.map((l, i) => (
              <div key={l.item} className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div><p className="t-micro text-mist">{l.item.split(" (")[0]}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-navy-3"><motion.div className="h-full rounded-full bg-gradient-to-r from-blue to-cyan" initial={{ width: 0 }} animate={{ width: `${(l.cost / 1700) * 100}%` }} transition={{ duration: 0.6, ease, delay: i * 0.04 }} /></div></div>
                <span className="t-small t-num text-white">{inr(l.cost)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-end justify-between border-t hairline pt-3">
            <div><p className="t-micro text-slate">Unit cost (COGS)</p><p className="t-h2 t-num"><CountUp key={scen} to={s.cogs} format={inr} /></p></div>
            <div className="text-right"><p className="t-micro text-slate">Electronics incl. PCB</p><p className="t-h2 t-num text-mist">{inr(s.electronics)}</p></div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-navy-3"><motion.div className="h-full rounded-full bg-cyan" animate={{ width: `${(s.cogs / maxCost) * 100}%` }} transition={{ duration: 0.6 }} /></div>
        </div>
        <div className="space-y-4">
          <div className="panel p-5">
            <label className="t-micro text-slate" htmlFor="price">Retail price including GST</label>
            <div className="mt-2 flex flex-wrap gap-1.5" id="price" role="group" aria-label="Retail price">
              {ts.priceMatrix.map((r) => (
                <button key={r.price} onClick={() => setPrice(r.price)} aria-pressed={price === r.price}
                  className={`t-micro t-num rounded-full border px-2.5 py-1 transition-colors ${price === r.price ? "border-cyan bg-cyan text-navy" : "hairline text-mist hover:text-white"}`}>
                  {inr(r.price)}{r.price === ts.launchPrice ? " · launch" : r.price === ts.postCostPrice ? " · M19" : ""}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div><p className="t-micro text-slate">Contribution per unit</p><p className={`t-h1 t-num ${contrib < 0 ? "text-coral" : "text-cyan"}`}><CountUp key={`${scen}${price}`} to={contrib} format={inr} /></p></div>
              <div><p className="t-micro text-slate">Contribution margin</p><p className={`t-h1 t-num ${margin < 0.2 ? "text-amber" : "text-white"}`}>{pct(margin)}</p></div>
            </div>
            <p className="t-micro mt-2 text-mist">{row.verdict}. After 5% GST, 15% clinic margin, warranty and ₹250 fulfilment.</p>
          </div>
          <div className="panel px-4 py-2">
            <table className="t-small w-full border-collapse">
              <thead><tr className="text-left"><th className="p-1.5"></th><th className="p-1.5 text-violet">TremoSense</th><th className="p-1.5 text-cyan">ParkinSense</th></tr></thead>
              <tbody>
                {[["Gross margin", pct(UE.tremosense.grossMargin), pct(UE.parkinsenseDevice.grossMargin)], ["Contribution margin", pct(UE.tremosense.contributionMargin), pct(UE.parkinsenseDevice.contributionMargin)],
                  ["CAC", inr(tl.cac), inr(pl.cac)], ["LTV", inr(tl.ltv), inr(pl.ltv)], ["LTV : CAC", `${tl.ltvCac.toFixed(1)}×`, `${pl.ltvCac.toFixed(1)}×`], ["Payback", "first sale", pl.paybackMonths > 0 ? `${pl.paybackMonths} months` : "first sale"]].map((r) => (
                  <tr key={r[0]} className="border-t hairline"><td className="p-1.5 text-slate">{r[0]}</td><td className="t-num p-1.5 text-white">{r[1]}</td><td className="t-num p-1.5 text-white">{r[2]}</td></tr>))}
              </tbody>
            </table>
          </div>
          <p className="t-micro text-slate">Formulas: contribution = net price − COGS − warranty − fulfilment · CAC = outreach spend ÷ customers · LTV = contribution × expected purchases (+ subscription) · payback = CAC ÷ contribution per sale · LTV:CAC above 3× is healthy. Estimates; no customers yet.</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 13 financials */
function Financials() {
  const fc = D.forecast;
  const [view, setView] = useState<"net" | "cum">("net");
  const W = 900, Hc = 330, pad = 28;
  const n = fc.costs.length;
  const maxV = Math.max(...fc.costs, ...fc.cashIn);
  const series = view === "net" ? fc.net : fc.cumulative;
  const sMin = Math.min(0, ...series), sMax = Math.max(0, ...series);
  const bw = (W - pad) / n;
  const yBar = (v: number) => (v / maxV) * (Hc - 40);
  const yLine = (v: number) => Hc - 20 - ((v - sMin) / (sMax - sMin || 1)) * (Hc - 60);
  const pts = series.map((v, i) => [pad + i * bw + bw / 2, yLine(v)] as const);
  const path = "M" + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L");
  const area = `${path} L${pts[pts.length - 1][0].toFixed(1)},${yLine(0).toFixed(1)} L${pts[0][0].toFixed(1)},${yLine(0).toFixed(1)} Z`;
  const beIdx = fc.months.findIndex((_, i) => fc.net.slice(i).every((v) => v >= 0) && i >= 12);
  const Y = fc.years;
  return (
    <Frame label="Financial outlook" title={`Operating break-even in ${beMonthName}, then profitable`} lead="36 months from July 2027. Phase 1 proves the product; TremoSense sales start in month 12; ParkinSense launches in month 25.">
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="panel p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <Tabs label="forecast line" value={view} onChange={setView} options={[{ id: "net", label: "Monthly operating profit" }, { id: "cum", label: "Cumulative cash" }]} />
            <p className="t-micro text-slate"><span className="mr-2 inline-block h-2 w-3 rounded-sm bg-violet" />Costs <span className="ml-3 mr-2 inline-block h-2 w-3 rounded-sm bg-cyan" />Cash in <span className="ml-3 mr-2 inline-block h-0.5 w-4 bg-white align-middle" />{view === "net" ? "Profit" : "Cumulative"}</p>
          </div>
          <svg viewBox={`0 0 ${W} ${Hc}`} className="w-full" role="img" aria-label="Monthly costs, cash in and operating profit over 36 months">
            <defs><linearGradient id="areaG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.22" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
            {[0, 1, 2, 3].map((g) => <line key={g} x1={pad} x2={W} y1={20 + g * ((Hc - 40) / 3)} y2={20 + g * ((Hc - 40) / 3)} stroke="#2B3A5C" strokeOpacity="0.5" />)}
            {fc.costs.map((c, i) => (
              <g key={i}>
                <motion.rect x={pad + i * bw + 1} width={bw / 2 - 1} y={Hc - 20 - yBar(c)} height={yBar(c)} rx={1.5} fill={VIOLET} fillOpacity={0.7} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: 1, transformBox: "fill-box" }} transition={{ delay: i * 0.02, duration: 0.5 }} />
                <motion.rect x={pad + i * bw + bw / 2} width={bw / 2 - 1} y={Hc - 20 - yBar(fc.cashIn[i])} height={yBar(fc.cashIn[i])} rx={1.5} fill={CYAN} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: 1, transformBox: "fill-box" }} transition={{ delay: 0.3 + i * 0.02, duration: 0.5 }} />
              </g>
            ))}
            <line x1={pad} x2={W} y1={yLine(0)} y2={yLine(0)} stroke="#94A3B8" strokeDasharray="4 4" strokeWidth="1" />
            <motion.path key={`a${view}`} d={area} fill="url(#areaG)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }} />
            <motion.path key={view} d={path} fill="none" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease, delay: 0.6 }} />
            {beIdx >= 0 && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
                <line x1={pad + beIdx * bw} x2={pad + beIdx * bw} y1={10} y2={Hc - 20} stroke={MINT} strokeWidth="1.5" />
                <circle cx={pts[beIdx][0]} cy={pts[beIdx][1]} r="5" fill={MINT}><animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" /></circle>
                <text x={pad + beIdx * bw + 8} y={24} fill={MINT} fontSize="14" fontWeight="600">Break-even {fc.months[beIdx]}</text>
              </motion.g>
            )}
            {[0, 12, 24, 35].map((i) => <text key={i} x={pad + i * bw} y={Hc - 4} fill="#94A3B8" fontSize="12">{fc.months[i]}</text>)}
          </svg>
          <p className="t-micro mt-2 text-slate">Cash basis: inventory is expensed when bought. The dashed line is zero for the white line.</p>
        </div>
        <Stagger className="grid grid-cols-2 gap-3 self-start">
          {[["Year 1 costs", lakh(H.costs12), "text-white"], ["Year 1 gross burn", `${lakh(H.grossBurn12, 2)}/mo`, "text-white"], ["Year 2 result", lakh(Y.net.y2), "text-amber"], ["Break-even", beLabel, "text-mint"],
            ["Year 3 cash in", crore(Y.cashIn.y3, 2), "text-cyan"], ["Year 3 operating profit", `${lakh(H.y3Profit)} · ${pct(H.y3Margin, 1)}`, "text-mint"], ["Zero-cash date (this round only)", "January 2028", "text-coral"], ["Needed to reach profit", lakh(H.fullRequirement), "text-violet"]].map(([k, v, c]) => (
            <Item key={k} className="panel lift p-3.5"><p className="t-micro text-slate">{k}</p><p className={`t-h2 t-num mt-1 ${c}`}>{v}</p></Item>
          ))}
          <p className="t-micro col-span-2 text-slate">Volumes: TremoSense {Y.tsUnits.y2} units in Year 2 and {Y.tsUnits.y3} in Year 3 (SOM capacity {MK.tremosense.somCustomers}/year); ParkinSense {Y.psUnits.y3} in Year 3.</p>
        </Stagger>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 14 team & growth */
function TeamGrowth() {
  return (
    <Frame label="Team and growth" title="A builder team, growing through clinics">
      <div className="grid gap-8 @5xl:grid-cols-2">
        <div>
          <div className="grid gap-4 @2xl:grid-cols-2">
            {[["PK", "Pranshu Kumar", "Co-founder · hardware engineer", "Wearable electronics, sensors and embedded firmware. Built ParkinSense; co-built TremoSense.", CYAN], ["PS", "Pawan Shinde", "Co-founder · hardware engineer", "Control, gimbal and power electronics. Co-built TremoSense (EKF + LQR platform).", VIOLET]].map(([ini, n, r, e, c], i) => (
              <motion.div key={n} className="panel lift p-5" style={{ borderColor: `${c}88` }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15, ease }}>
                <span className="t-small grid h-11 w-11 place-items-center rounded-full font-semibold text-navy" style={{ background: c, boxShadow: `0 0 24px ${c}66` }}>{ini}</span>
                <p className="t-h2 mt-3">{n}</p><p className="t-small" style={{ color: c }}>{r}</p><p className="t-small mt-3 text-mist">{e}</p>
              </motion.div>
            ))}
          </div>
          <div className="mx-auto h-6 w-px bg-line" />
          <div className="panel mx-auto max-w-sm border-dashed p-4 text-center"><p className="t-small text-white">Hardware and test engineer</p><p className="t-micro text-slate">Hire at M7 · support and sales hires from M19</p></div>
          <p className="t-micro mt-4 text-mist">Contract support as needed: regulatory consultant, industrial designer.</p>
          <p className="t-micro mt-1 text-amber">Equity split is set in a founders' agreement (not yet signed). ESOP 5%. Inventor assignments before any filing.</p>
        </div>
        <div>
          <ol className="flex flex-col items-center gap-2">
            {K.growth.funnel.map(([k, d, v], i) => (
              <motion.li key={k} initial={{ opacity: 0, scaleX: 0.6 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.3 + i * 0.15, ease }}
                className="flex items-center justify-between rounded-xl border px-4 py-2.5" style={{ width: `${100 - i * 10}%`, borderColor: i % 2 ? `${VIOLET}AA` : `${BLUE}AA`, background: i % 2 ? `${VIOLET}22` : `${BLUE}22` }}>
                <span className="t-small"><span className="text-white">{k}</span> <span className="text-slate">· {d}</span></span>
                <span className="t-small t-num font-semibold text-cyan">{v}</span>
              </motion.li>
            ))}
          </ol>
          <p className="t-micro mt-2 text-center text-slate">Targets, not observed data</p>
          <ol className="mt-4 space-y-2">
            {K.growth.experiments.map(([k, s, p], i) => <motion.li key={k} className="panel p-3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 + i * 0.12 }}><p className="t-small text-white">{i + 1}. {k} <span className="text-slate">· {s}</span></p><p className="t-micro text-mist">{p}</p></motion.li>)}
          </ol>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 15 funding */
function Funding() {
  const V = D.valuation;
  const opts = V.options;
  const [sel, setSel] = useState(opts.findIndex((o) => o.pre === V.proposed));
  const [more, setMore] = useState(false);
  const o = opts[sel];
  const I = F.C.equity, post = o.pre + I, esop = F.C.esop;
  const eq = [["Pre-money P", inr(o.pre), o.basis], ["Equity I", inr(I), "Milestone-1 requirement (peak gap × 1.2)"], ["Post-money", inr(post), "P + I"],
    ["Investor ownership", pct(o.investor, 1), "I ÷ (P + I)"], ["Founders", pct(o.founders, 1), `100% − investor − ${pct(esop)} ESOP`]];
  const segs = [["Founders", o.founders, MINT], ["ESOP", esop, BLUE], ["Investor", o.investor, CYAN]] as const;
  // donut
  const R = 70, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <Frame label="Funding ask and valuation" title={`Raise ${lakh(I, 2)} at a ${lakh(V.proposed, 0)} pre-money`} lead={`${lakh(V.proposed, 0)} is a working negotiation target, framed by a cost-to-duplicate floor (${lakh(V.floor, 2)}) and a Berkus-style cross-check (${lakh(V.berkus, 0)}). The ₹20 L Startup India grant is applied for, not awarded.`}>
      <div className="grid gap-3 @2xl:grid-cols-3">
        {[["This round · Milestone 1 (M1–M6)", lakh(I), "text-cyan"], ["Year-1 cash costs", lakh(H.costs12), "text-white"], ["Total to reach profitability", lakh(H.fullRequirement), "text-violet"]].map(([k, v, c], i) => (
          <motion.div key={k} className={`panel p-4 ${i === 0 ? "border-cyan/60" : ""}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.1 }}><p className="t-micro text-slate">{k}</p><p className={`t-h2 t-num ${c}`}>{v}</p></motion.div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Pre-money option">
        {opts.map((x, i) => (
          <button key={x.pre} role="tab" aria-selected={sel === i} onClick={() => setSel(i)} className={`t-micro rounded-full border px-3.5 py-1.5 transition-colors ${sel === i ? "border-cyan bg-cyan text-navy" : "hairline text-mist hover:text-white"}`}>{lakh(x.pre, 2)} · {x.basis}</button>
        ))}
        <button onClick={() => setMore((v) => !v)} aria-expanded={more} className="t-micro ml-auto rounded-full border border-violet/60 px-3.5 py-1.5 text-violet hover:bg-violet/10">{more ? "Back to the equation" : "Berkus cross-check and scenarios A–D"}</button>
      </div>
      <div className="mt-4 grid gap-6 @5xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <AnimatePresence mode="wait">
          {!more ? (
            <motion.ol key={`eq${sel}`} className="space-y-2" initial="hidden" animate="show" exit={{ opacity: 0 }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}>
              {eq.map(([a, b, c]) => (
                <motion.li key={a} variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0 } }} className="grid grid-cols-[9rem_1fr] items-baseline gap-4 rounded-xl border hairline bg-navy-2/80 px-4 py-2.5 @3xl:grid-cols-[11rem_12rem_1fr]">
                  <span className="t-small text-slate">{a}</span><span className="t-h2 t-num text-white">{b}</span><span className="t-micro col-span-2 text-slate @3xl:col-span-1">{c}</span>
                </motion.li>
              ))}
            </motion.ol>
          ) : (
            <motion.div key="more" className="panel p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ul className="t-micro space-y-1 text-mist">{V.berkusFactors.map((b) => <li key={b.factor}><span className="text-white">{b.factor}: {lakh(b.value)}</span> · {b.evidence}</li>)}</ul>
              <table className="t-micro mt-3 w-full border-collapse"><thead><tr className="text-left text-white"><th className="p-1.5">Scenario</th><th className="p-1.5">Equity</th><th className="p-1.5">Investor</th><th className="p-1.5">Founders</th></tr></thead>
                <tbody>{(["A", "B", "C", "D"] as const).map((k) => <tr key={k} className="border-t hairline"><td className="p-1.5 text-slate">{k} · {F[k].grantStatus}</td><td className="t-num p-1.5">{lakh(F[k].equity)}</td><td className="t-num p-1.5">{pct(F[k].investor, 1)}</td><td className="t-num p-1.5">{pct(F[k].founders, 1)}</td></tr>)}</tbody></table>
              <p className="t-micro mt-2 text-slate">All at the proposed pre-money. Raising everything up front (A/B) dilutes far more, which is why only Milestone 1 is raised now.</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="panel flex items-center gap-6 p-5">
          <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0 -rotate-90" aria-label="Cap table after this round">
            <circle cx="90" cy="90" r={R} fill="none" stroke="#1B2847" strokeWidth="26" />
            {segs.map(([nm, v, c]) => {
              const off = acc; acc += v;
              return <motion.circle key={nm} cx="90" cy="90" r={R} fill="none" stroke={c} strokeWidth="26"
                initial={{ strokeDasharray: `0 ${C}`, strokeDashoffset: -C * off }} animate={{ strokeDasharray: `${Math.max(0, C * v - 2)} ${C}`, strokeDashoffset: -C * off }} transition={{ duration: 0.9, ease }} />;
            })}
          </svg>
          <div>
            <p className="t-micro text-slate">Cap table after this round</p>
            <ul className="mt-2 space-y-1.5">{segs.map(([nm, v, c]) => <li key={nm} className="t-small flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} /><span className="text-mist">{nm}</span><span className="t-num ml-auto pl-4 text-white">{pct(v, 1)}</span></li>)}</ul>
            <p className="t-micro mt-3 text-slate">The next round is priced on the user-study result, not on this target.</p>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <p className="t-small mb-2 text-white">Where the {lakh(I)} goes <span className="t-micro text-slate">· Phase 1, M1–M6 · details on the next slide</span></p>
        <div className="flex h-9 w-full gap-1 overflow-hidden rounded-xl">
          {D.useOfFunds.filter((u) => u.phase1 > 0).concat([{ category: "Buffer (20%)", phase1: I - D.useOfFunds.reduce((x, u) => x + u.phase1, 0), phase2: 0 }]).map((u, k, arr) => {
            const pal = [BLUE, CYAN, VIOLET, "#60A5FA", "#64748B", "#94A3B8", "#334155"];
            return (
              <motion.div key={u.category} className="t-micro flex items-center overflow-hidden whitespace-nowrap px-2 text-navy" initial={{ width: 0 }} animate={{ width: `${(u.phase1 / I) * 100}%` }} transition={{ delay: 0.5 + k * 0.08, duration: 0.6, ease }} style={{ background: pal[k], color: k >= 4 ? "#fff" : "#0b1222" }} title={`${u.category}: ${lakh(u.phase1)}`}>
                {u.phase1 / I > 0.07 ? `${u.category.split(" (")[0]} ${lakh(u.phase1)}` : ""}
              </motion.div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 16 milestones & use of funds */
function Milestones() {
  const uf = D.useOfFunds.filter((u) => u.phase1 > 0);
  const tot = uf.reduce((a, u) => a + u.phase1, 0);
  const pal = [BLUE, CYAN, VIOLET, "#60A5FA", "#64748B", "#94A3B8"];
  const NM = K.milestones.length;
  return (
    <Frame label="Use of funds and milestones" title={`How the ${lakh(F.C.equity)} grows the business`} lead={`Phase 1 (M1–M6) costs ${lakh(tot)}; the round adds a 20% buffer.`}>
      <div className="flex h-12 w-full gap-1 overflow-hidden rounded-xl">
        {uf.map((u, i) => (
          <motion.div key={u.category} initial={{ width: 0 }} animate={{ width: `${(u.phase1 / tot) * 100}%` }} transition={{ delay: 0.2 + i * 0.12, duration: 0.6, ease }} style={{ background: pal[i] }} className="first:rounded-l-xl last:rounded-r-xl" title={`${u.category}: ${lakh(u.phase1)}`} />
        ))}
      </div>
      <Stagger as="ul" className="mt-3 grid gap-2 @3xl:grid-cols-3">
        {uf.map((u, i) => (
          <Item as="li" key={u.category} className="rounded-xl border hairline bg-navy-2/70 px-3 py-2">
            <p className="t-small"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: pal[i] }} /><span className="text-white">{u.category}</span> <span className="t-num text-mist">{lakh(u.phase1)} · {pct(u.phase1 / tot)}</span></p>
            <p className="t-micro mt-0.5 text-slate">{(K.fundsBuy as Record<string, string>)[u.category]}</p>
          </Item>
        ))}
      </Stagger>
      <div className="relative mt-8">
        <div className="absolute left-0 right-0 top-[5px] hidden h-[2px] bg-line @5xl:block" />
        <motion.div className="absolute left-0 right-0 top-[5px] hidden h-[2px] @5xl:block" style={{ background: `linear-gradient(90deg, ${CYAN}, ${VIOLET} 60%, ${MINT})`, originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2, ease, delay: 0.5 }} />
        <ol className="relative grid gap-4 @2xl:grid-cols-3 @3xl:grid-cols-6 @5xl:grid-cols-11">
          {K.milestones.map(([m, t, tag], i) => {
            const last = i === NM - 1;
            const c = last ? MINT : i <= 3 ? CYAN : VIOLET;
            return (
              <motion.li key={m + t} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * (1.6 / NM) }}>
                <span className="block h-3 w-3 rounded-full" style={{ background: c, boxShadow: `0 0 0 4px ${c}33${last ? `, 0 0 18px ${c}` : ""}` }} />
                <p className="t-h2 t-num mt-3" style={{ color: last ? c : "#fff" }}>{m}</p>
                <p className="t-micro" style={{ color: c }}>{tag}</p>
                <p className="t-micro mt-0.5 text-mist">{t}</p>
              </motion.li>
            );
          })}
        </ol>
      </div>
      <p className="t-small mt-6 text-mist"><span className="text-mint">Then: </span>{K.fundsGrowth}</p>
      <motion.div className="mt-3 grid gap-3 @3xl:grid-cols-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
        {[["Why this could fail", K.brand.failRisk, "#F87171"], ["Continue", "median tremor reduction ≥50% and ≥60% would pay", MINT], ["Kill or pivot", "below 30% → stop TremoSense; works but under 60% would pay → clinic rental", AMBER]].map(([k, v, c]) => (
          <div key={k} className="rounded-xl border px-4 py-2.5" style={{ borderColor: `${c}66`, background: `${c}10` }}><p className="t-small"><span className="font-semibold" style={{ color: c }}>{k}: </span><span className="text-mist">{v}</span></p></div>
        ))}
      </motion.div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 17 advantage & close */
function Advantage() {
  const [tab, setTab] = useState<"tremosense" | "parkinsense">("tremosense");
  const color = tab === "tremosense" ? VIOLET : CYAN;
  const rows = K.advantage[tab];
  return (
    <Frame label="Competitive advantage" title="Why people will choose AVERRA"
      aside={<Tabs label="product" value={tab} onChange={setTab} options={[{ id: "tremosense", label: "TremoSense vs tremor aids", color: VIOLET }, { id: "parkinsense", label: "ParkinSense vs wearables", color: CYAN }]} />}>
      <AnimatePresence mode="wait">
        <motion.ul key={tab} className="grid gap-4 @5xl:grid-cols-3" initial="hidden" animate="show" exit={{ opacity: 0 }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}>
          {rows.map(([name, ours, theirs]) => (
            <motion.li key={name} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { ease } } }} className="panel lift flex flex-col p-5" style={{ borderColor: `${color}55` }}>
              <p className="t-small font-medium" style={{ color }}>vs {name}</p>
              <p className="t-body mt-2 flex-1 text-white">{ours}</p>
              <p className="t-micro mt-4 border-t hairline pt-3 text-slate"><span className="text-mist">Where they lead: </span>{theirs}</p>
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
      <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
        {K.advantage.shared.map((t) => <li key={t} className="t-small text-mist"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan align-middle" />{t}</li>)}
      </ul>
      <Src>{K.advantage.note}</Src>
      <motion.div className="panel mt-8 flex flex-col items-start gap-6 overflow-hidden p-6 @3xl:flex-row @3xl:items-center" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, ease }}
        style={{ background: "linear-gradient(110deg, rgba(6,182,212,.16), rgba(139,92,246,.14) 60%, rgba(19,29,51,.7))", borderColor: "rgba(6,182,212,.35)" }}>
        <img src="/brand/averra-mark-white.svg" alt="" className="h-14 w-14" />
        <div>
          <p className="t-h1 grad-text">{K.brand.tagline}</p>
          <p className="t-body mt-2 text-mist">Ask: {lakh(F.C.equity)} at a {lakh(D.valuation.proposed, 0)} pre-money ({pct(F.C.investor, 1)}), to reach a clear answer on a product that is profitable on every unit. Break-even in {beMonthName}.</p>
        </div>
      </motion.div>
    </Frame>
  );
}

export const SLIDES: { id: string; title: string; notes: number[]; extraNote?: string; accent: string; Component: () => React.ReactElement }[] = [
  { id: "opening", title: "AVERRA", notes: [1], accent: CYAN, Component: Opening },
  { id: "problem", title: "Problem", notes: [2], accent: BLUE, Component: Problem },
  { id: "why-now", title: "Why now", notes: [], extraNote: "Why-now is spoken at the end of deck slide 2's script.", accent: CYAN, Component: WhyNow },
  { id: "portfolio", title: "Two-product portfolio", notes: [3], accent: BLUE, Component: Portfolio },
  { id: "parkinsense", title: "ParkinSense", notes: [4], accent: CYAN, Component: ParkinSense },
  { id: "tremosense", title: "TremoSense", notes: [5], accent: VIOLET, Component: TremoSense },
  { id: "architecture", title: "Technical architecture", notes: [], extraNote: "Optional deep-dive for the viva; not part of the timed script.", accent: BLUE, Component: Architecture },
  { id: "competition", title: "Competition", notes: [6], accent: CYAN, Component: Competition },
  { id: "market", title: "Market opportunity", notes: [8], accent: BLUE, Component: Market },
  { id: "mvp", title: "MVP and validation", notes: [7], accent: MINT, Component: MVP },
  { id: "business-model", title: "Business model", notes: [9], accent: CYAN, Component: BusinessModel },
  { id: "pricing", title: "Pricing and unit economics", notes: [10], accent: VIOLET, Component: Pricing },
  { id: "financials", title: "Financial outlook", notes: [11], accent: MINT, Component: Financials },
  { id: "team", title: "Team and growth", notes: [12], accent: BLUE, Component: TeamGrowth },
  { id: "funding", title: "Funding ask and valuation", notes: [13], accent: CYAN, Component: Funding },
  { id: "milestones", title: "Milestones and use of funds", notes: [14], accent: VIOLET, Component: Milestones },
  { id: "advantage", title: "Competitive advantage", notes: [], extraNote: "The advantage and closing lines are the end of deck slide 14's script.", accent: CYAN, Component: Advantage },
];
