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
  const glowP = useRef<SVGPathElement>(null);
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
    glowP.current?.setAttribute("d", b);
  });
  return (
    <motion.svg viewBox={`0 0 ${W} ${Hh}`} className="w-full overflow-visible" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
      <defs>
        <linearGradient id="rawg" x1="0" x2="1"><stop offset="0" stopColor="#8B5CF6" stopOpacity="0" /><stop offset="0.35" stopColor="#8B5CF6" stopOpacity="0.9" /><stop offset="1" stopColor="#A78BFA" /></linearGradient>
              </defs>
      <path ref={raw} fill="none" stroke="url(#rawg)" strokeWidth="2.6" strokeLinejoin="round" />
      <path ref={glowP} fill="none" stroke="#67E8F9" strokeOpacity="0.18" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" />
      <path ref={calm} fill="none" stroke="#67E8F9" strokeWidth="3.2" strokeLinejoin="round" />
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
          className="t-small relative flex items-center gap-3 rounded-xl border px-3 py-2.5"
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
  const traceRaw = useRef<SVGPathElement>(null);
  const trace = useRef<SVGPathElement>(null);
  const sim = useRef({ k: 0, r: 0, last: 0, acc: 0, a: 0, b: 0, raw: Array(150).fill(0) as number[], out: Array(150).fill(0) as number[] });
  const state = useRef({ on, hz });
  state.current = { on, hz };
  useTicker((t) => {
    const { on: s, hz: f } = state.current;
    const m = sim.current;
    const dt = Math.min(0.1, Math.max(0, t - m.last)); m.last = t;
    // fixed 60 Hz simulation steps: same speed and smoothness on 60, 120 and 144 Hz screens
    const STEP = 1 / 60;
    m.acc += dt;
    let a = m.a, bowl = m.b;
    while (m.acc >= STEP) {
      m.acc -= STEP;
      const ts = t - m.acc;
      // handle angle: tremor (shown at half speed) plus a slow voluntary drift
      a = 7 * Math.sin(2 * Math.PI * f * ts * 0.5) + 1.5 * Math.sin(2 * Math.PI * 0.25 * ts);
      // ease the controller in/out so switching never snaps
      m.k += ((s ? 0 : 1) - m.k) * STEP * 6;
      // residual ≈10% of the tremor, low-passed so it reads as a gentle drift, not jitter
      m.r += (a * 0.1 - m.r) * STEP * 2.5;
      // a very slight residual shake at higher tremor frequencies (servo lag), none at 4 Hz
      const jit = (f >= 8 ? 0.7 : f >= 6 ? 0.4 : 0) * Math.sin(2 * Math.PI * f * ts * 0.5 + 0.6);
      bowl = m.k * a + (1 - m.k) * (m.r + jit);
      m.raw.push(a); m.out.push(bowl);
      if (m.raw.length > 150) { m.raw.shift(); m.out.shift(); }
    }
    m.a = a; m.b = bowl;
    hand.current?.setAttribute("transform", `rotate(${a.toFixed(2)} 150 168)`);
    head.current?.setAttribute("transform", `rotate(${(bowl - a).toFixed(2)} 150 168)`);
    const path = (arr: number[]) => "M" + arr.map((v, i) => `${(i * 2).toFixed(1)},${(30 - v * 2.4).toFixed(1)}`).join(" L");
    traceRaw.current?.setAttribute("d", path(m.raw));
    trace.current?.setAttribute("d", path(m.out));
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
        <defs>
          <radialGradient id="sdHalo"><stop offset="0" stopColor={on ? "#8B5CF6" : "#F87171"} stopOpacity="0.28" /><stop offset="1" stopColor={on ? "#8B5CF6" : "#F87171"} stopOpacity="0" /></radialGradient>
          <linearGradient id="sdSteel" x1="0" x2="1"><stop offset="0" stopColor="#94A3B8" /><stop offset="0.45" stopColor="#F1F5F9" /><stop offset="1" stopColor="#64748B" /></linearGradient>
          <linearGradient id="sdHandle" x1="0" x2="1"><stop offset="0" stopColor="#1E293B" /><stop offset="0.45" stopColor="#475569" /><stop offset="1" stopColor="#0F172A" /></linearGradient>
        </defs>
        <circle cx="150" cy="95" r="80" fill="url(#sdHalo)" style={{ transition: "all .4s" }} />
        <line x1="70" x2="230" y1="40" y2="40" stroke="#67E8F9" strokeOpacity={on ? 0.35 : 0} strokeDasharray="3 5" style={{ transition: "stroke-opacity .4s" }} />
        <g ref={hand}>
          <rect x="136" y="172" width="28" height="112" rx="14" fill="url(#sdHandle)" stroke="#64748B" strokeOpacity="0.6" />
          <rect x="142" y="196" width="16" height="5" rx="2.5" fill="#8B5CF6" />
          <circle cx="150" cy="222" r="4" fill="#06B6D4" />
          <rect x="132" y="156" width="36" height="22" rx="7" fill="#5B21B6" stroke="#A78BFA" strokeOpacity="0.6" />
          <g ref={head}>
            <rect x="146" y="96" width="8" height="74" rx="4" fill="url(#sdSteel)" />
            <ellipse cx="150" cy="78" rx="27" ry="34" fill="#E2E8F0" />
            <ellipse cx="150" cy="76" rx="19" ry="25" fill="#CBD5E1" />
            <circle cx="145" cy="72" r="4" fill="#F59E0B" /><circle cx="155" cy="78" r="3.5" fill="#F59E0B" /><circle cx="147" cy="84" r="3" fill="#FBBF24" />
          </g>
          <circle cx="150" cy="168" r="6" fill="#C4B5FD" />
        </g>
      </svg>
      <svg viewBox="0 0 300 60" className="h-12 w-full" aria-hidden="true"><line x1="0" x2="300" y1="30" y2="30" stroke="#2B3A5C" /><path ref={traceRaw} fill="none" stroke="#F87171" strokeOpacity="0.35" strokeWidth="1.5" /><path ref={trace} fill="none" stroke={on ? "#A78BFA" : "#F87171"} strokeWidth="2.2" strokeLinejoin="round" /></svg>
      <p className="t-micro text-slate"><span className="text-coral/70">Handle (tremor)</span> vs <span className="text-violet">spoon head</span></p>
      <div className="mt-3 flex gap-2" role="group" aria-label="Tremor frequency">
        {[4, 6, 8].map((f) => (
          <button key={f} onClick={() => setHz(f)} aria-pressed={hz === f} className={`t-micro flex-1 rounded-full border px-2 py-1 transition-colors ${hz === f ? "border-violet bg-violet/20 text-white" : "hairline text-mist hover:text-white"}`}>{f} Hz</button>
        ))}
      </div>
      <p className="t-micro mt-3 text-slate">Illustration at half speed, scaled to the ≈90% bench result. Not a recording.</p>
    </div>
  );
}

/** Illustration of ParkinSense: pick a situation and watch the wrist signal and what the band reports. */
function WristDemo() {
  const [mode, setMode] = useState<"rest" | "tremor" | "walk">("tremor");
  const line = useRef<SVGPathElement>(null);
  const heart = useRef<SVGPathElement>(null);
  const [steps, setSteps] = useState(0);
  const sim = useRef({ buf: Array(130).fill(0) as number[], last: 0, stepAcc: 0, hb: 0, acc: 0 });
  const st = useRef(mode);
  st.current = mode;
  const hr = mode === "walk" ? 98 : mode === "tremor" ? 76 : 68;
  useTicker((t) => {
    const m = sim.current, md = st.current;
    const dt = Math.min(0.1, Math.max(0, t - m.last)); m.last = t;
    const STEP = 1 / 60;
    m.acc += dt;
    while (m.acc >= STEP) {
      m.acc -= STEP;
      const ts = t - m.acc;
      const noise = (Math.sin(ts * 37.1) + Math.sin(ts * 53.7)) * 0.6;
      const v = md === "rest" ? noise * 0.8 : md === "tremor" ? 14 * Math.sin(2 * Math.PI * 4.9 * ts * 0.5) + noise : 18 * Math.max(0, Math.sin(2 * Math.PI * 0.9 * ts)) ** 3 - 4 + noise;
      m.buf.push(v); if (m.buf.length > 130) m.buf.shift();
    }
    line.current?.setAttribute("d", "M" + m.buf.map((y, i) => `${(i * 2).toFixed(1)},${(35 - y).toFixed(1)}`).join(" L"));
    if (md === "walk") { m.stepAcc += dt * 1.8; if (m.stepAcc >= 1) { m.stepAcc -= 1; setSteps((x) => x + 1); } }
    const bpm = md === "walk" ? 98 : md === "tremor" ? 76 : 68;
    m.hb = (m.hb + dt * bpm / 60) % 1;
    heart.current?.setAttribute("transform", `scale(${(1 + 0.18 * Math.exp(-m.hb * 9)).toFixed(3)})`);
  });
  const status = mode === "tremor" ? ["Tremor detected", "#C4B5FD"] : mode === "walk" ? ["Walking", CYAN] : ["Resting", MINT];
  return (
    <div className="panel flex flex-col p-4">
      <p className="t-small mb-3 flex items-center gap-2 font-medium text-white"><span className="h-1.5 w-1.5 rounded-full bg-cyan" />Try it</p>
      <div className="flex gap-1.5" role="group" aria-label="Situation">
        {([["rest", "Resting"], ["tremor", "Tremor"], ["walk", "Walking"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} aria-pressed={mode === k} className={`t-micro flex-1 rounded-full border px-2 py-1 transition-colors ${mode === k ? "border-cyan bg-cyan/20 text-white" : "hairline text-mist hover:text-white"}`}>{l}</button>
        ))}
      </div>
      <svg viewBox="0 0 260 70" preserveAspectRatio="none" className="mt-4 h-[120px] w-full rounded-xl bg-navy-3/40" aria-label="Animated wrist motion signal">
        <line x1="0" x2="260" y1="35" y2="35" stroke="#2B3A5C" />
        <path ref={line} fill="none" stroke={status[1]} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" style={{ transition: "stroke .3s" }} />
      </svg>
      <p className="t-micro text-slate">Wrist motion, live</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border hairline bg-navy-2/80 p-2.5"><p className="t-micro text-slate">Band reports</p><p className="t-small font-semibold" style={{ color: status[1] }}>{status[0]}</p></div>
        <div className="rounded-xl border hairline bg-navy-2/80 p-2.5"><p className="t-micro text-slate">Steps</p><p className="t-small t-num font-semibold text-white">{steps}{mode === "tremor" && <span className="t-micro ml-1 font-normal text-slate">not counted</span>}</p></div>
        <div className="rounded-xl border hairline bg-navy-2/80 p-2.5"><p className="t-micro text-slate">Tremor</p><p className="t-small t-num font-semibold text-white">{mode === "tremor" ? "4.9 Hz · score 85" : "none"}</p></div>
        <div className="rounded-xl border hairline bg-navy-2/80 p-2.5"><p className="t-micro text-slate">Heart rate</p><p className="t-small t-num flex items-center gap-1.5 font-semibold text-white"><svg viewBox="-12 -12 24 24" className="h-4 w-4"><path ref={heart} d="M0,8 C-9,1 -9,-7 -3.5,-7 C-1.5,-7 0,-5 0,-4 C0,-5 1.5,-7 3.5,-7 C9,-7 9,1 0,8Z" fill="#F87171" /></svg>{hr} bpm</p></div>
      </div>
      <p className="t-micro mt-auto pt-3 text-slate">Illustration (tremor at half speed), values from the bench dashboard. Not a recording.</p>
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
      <Photo src={img} alt={id === "ts" ? "TremoSense concept render" : `${name} prototype`} className={`h-56 w-full`} />
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
        {card("ts", "TremoSense", "Assist people who live with tremor", VIOLET, "/images/tremosense-concept-wide.jpg", [["Who", "people whose tremor disrupts eating, and their families"], ["Buys it", "families, via clinic or OT referral"], ["Value", "eat more independently, at an Indian price"]], 40)}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 5 ParkinSense */
const PS_STATUS: [string, string, string][] = [
  ["Steps, distance, active minutes", "Bench-tested", MINT],
  ["Tremor detection: score, frequency, burden", "Bench-tested", MINT],
  ["Rest vs movement (tremor never counted as steps)", "Bench-tested", MINT],
  ["Heart rate, HRV, blood oxygen", "Needs validation", CYAN],
  ["Live dashboard with history", "Needs user testing", CYAN],
  ["Mobile app", "In progress", AMBER],
  ["Clinical evaluation with ICMR", "Results pending", AMBER],
  ["Sleep, battery monitoring, cloud sync", "Next", "#94A3B8"],
];
function ParkinSense() {
  const [zoom, setZoom] = useState(false);
  const steps = ["Wear it on the wrist", "Sensors stream over Bluetooth", "Software spots tremor", "Results on a live dashboard"];
  return (
    <Frame label="ParkinSense" title="A wearable for everyone, with tremor detection built in" lead="Like a fitness band for activity and vitals, with one thing others don't do: it detects and measures tremor.">
      <ol className="mb-5 grid grid-cols-4 gap-2">
        {steps.map((t, i) => (
          <motion.li key={t} className="t-small flex items-center gap-2 rounded-full border hairline bg-navy-2/70 px-3 py-1.5 text-mist" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.1 }}>
            <span className="t-num grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan text-[0.7rem] font-semibold text-navy">{i + 1}</span>{t}
          </motion.li>
        ))}
      </ol>
      <div className="grid items-stretch gap-5 @5xl:grid-cols-3">
        <div className="panel flex flex-col p-4">
          <p className="t-small mb-3 flex items-center gap-2 font-medium text-white"><span className="h-1.5 w-1.5 rounded-full bg-cyan" />The real prototype</p>
          <div className="grid grid-cols-[0.915fr_1.121fr] gap-2">
            <img src="/images/parkinsense-wrist.jpg" alt="ParkinSense prototype worn on the wrist" className="aspect-[903/987] w-full rounded-xl border hairline object-cover" />
            <img src="/images/parkinsense-enclosure.jpg" alt="ParkinSense prototype enclosure" className="aspect-[1000/892] w-full rounded-xl border hairline object-cover" />
          </div>
          <button onClick={() => setZoom(true)} className="group relative mt-2 block overflow-hidden rounded-xl border hairline" aria-label="Enlarge the ParkinSense dashboard screenshot">
            <img src="/images/parkinsense-dashboard-app.jpg" alt="ParkinSense dashboard showing tremor detected at 4.88 Hz" className="aspect-[1456/500] w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]" />
            <span className="t-micro absolute bottom-1.5 right-1.5 rounded-full bg-navy/85 px-2 py-0.5 text-mist">Live dashboard ⤢</span>
          </button>
          <p className="t-micro mt-auto pt-3 text-slate">The band on a wrist, its 3D-printed enclosure, and the real dashboard reading tremor at 4.88 Hz.</p>
        </div>
        <WristDemo />
        <div className="panel flex flex-col p-4">
          <p className="t-small mb-3 flex items-center gap-2 font-medium text-white"><span className="h-1.5 w-1.5 rounded-full bg-cyan" />What it does, and where it stands</p>
          <ul className="divide-y divide-white/5">
            {PS_STATUS.map(([f, st, c], i) => (
              <motion.li key={f} className="flex items-center justify-between gap-3 py-2" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}>
                <span className={`t-small ${i === 1 ? "font-medium text-white" : "text-mist"}`}>{i === 1 && <span className="mr-1 text-violet">★</span>}{f}</span>
                <Pill color={c}>{st}</Pill>
              </motion.li>
            ))}
          </ul>
          <p className="t-micro mt-auto pt-3 text-slate">Bench-tested means verified on a test rig, not yet on people. Wellness product: it does not diagnose Parkinson's; clinical claims wait for the ICMR results.</p>
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
  const [tab, setTab] = useState<"video" | "how" | "audit">("video");
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
          <Tabs label="TremoSense detail" value={tab} onChange={setTab} options={[{ id: "video", label: "Real demo", color: VIOLET }, { id: "how", label: "How it works", color: VIOLET }, { id: "audit", label: "Build vs paper", color: AMBER }]} />
          <div className="mt-4">
            <AnimatePresence mode="wait">
              {tab === "video" ? (
                <motion.figure key="video" className="flex items-start gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <video src="/videos/tremosense-demo.mp4" poster="/videos/tremosense-demo-poster.jpg" autoPlay muted loop playsInline className="h-[330px] w-auto rounded-2xl border hairline" aria-label="TremoSense bench demo video" />
                  <figcaption className="t-small text-mist">
                    <span className="block font-medium text-white">The current build on the bench</span>
                    <span className="mt-1 block">The servo gimbal counter-rotates the spoon head as the handle moves. Footage from the TremoSense repository (assets/tremosense.gif).</span>
                    <span className="t-micro mt-3 block text-slate">Bench footage, not a user trial. The ≈90% figure is founder-reported; logs to be published.</span>
                  </figcaption>
                </motion.figure>
              ) : tab === "how" ? (
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
    ? [...D.competitors.filter((c) => ["WHOOP One (WHOOP 5.0)", "Garmin Cirqa", "Google Fitbit Air", "Amazfit Helio Strap"].includes(c.name)).map((c) => ({ name: c.name.replace(" (WHOOP 5.0)", " (12-mo plan)"), inr: c.inr, src: c.source, ours: false })), { name: "ParkinSense (planned price)", inr: D.assumptions.P3 as number, src: "", ours: true }]
    : [...D.competitors.filter((c) => ["GyroGlove", "Imported active spoon (desertcart.in)", "Steady Spoon (imported, desertcart.in)", "Weighted soup spoon (225 g)"].includes(c.name)).map((c) => ({ name: c.name.replace(" (desertcart.in)", "").replace(", desertcart.in", "").replace(" (225 g)", ""), inr: c.inr, src: c.source, ours: false })), { name: "TremoSense (planned price)", inr: ts.launchPrice, src: "", ours: true }];
  const max = Math.log10(Math.max(...priceRows.map((r) => r.inr)));
  const min = Math.log10(1000);
  return (
    <Frame label="Competition" title="Who we compete with" lead="Latest Indian prices, checked 16 Oct 2026. Benchmarks only; they do not drive AVERRA revenue."
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
            <p className="t-micro mt-3 text-slate">{tab === "tremosense" ? "Active spoons are imported listings in India (desertcart.in). The glove covers the whole hand; the weighted spoon is passive." : "All four are screenless bands, like ParkinSense. WHOOP's price includes a 12-month plan that renews."}</p>
          </div>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border hairline">
              <table className="t-small w-full border-collapse">
                <thead><tr>{cmp.columns.map((c, j) => <th key={c + j} className="bg-navy-3/90 p-2.5 text-left font-semibold" style={{ color: j === cmp.columns.length - 1 ? color : "#fff" }}>{c}</th>)}</tr></thead>
                <tbody>{cmp.rows.map((r, ri) => <motion.tr key={r[0]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + ri * 0.08 }} className="border-t hairline align-top">{r.map((c, j) => <td key={j} className={`p-2.5 ${j === 0 ? "text-slate" : j === r.length - 1 ? "text-white" : "text-mist"}`} style={j === r.length - 1 ? { background: `${color}17` } : { background: "rgba(19,29,51,.6)" }}>{c}</td>)}</motion.tr>)}</tbody>
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
  const T = MK.totals, A = D.assumptions as Record<string, number>, G = (MK as typeof MK & { general: { customers: number; revPerCustomer: number; tam: number; samCustomers: number; sam: number; somCustomers: number; som: number; somRange: { share: number; customers: number; som: number }[] } }).general;
  const R = G.somRange, rv = (x: number) => (x >= 1e7 ? crore(x) : lakh(x));
  const n = (x: number) => Math.round(x).toLocaleString("en-IN");
  const P = MK.parkinsense, Tt = MK.tremosense;
  const pop = A.M1 / A.M2;
  const layers = [["TAM", T.tam, BLUE], ["SAM", T.sam, CYAN], ["SOM · Year 3", T.som, VIOLET]] as const;
  const calc: [string, string, [string, string][]][] = [
    ["TremoSense", VIOLET, [
      ["Customers", `PD 60+ = 14.9 Cr × 308.9 per lakh = ${n(MK.pd60)}; ET = ${(pop / 1e7).toFixed(0)} Cr × 89.96 per lakh = ${n(MK.et)}; (PD + ET) × 50% with eating-disruptive tremor = ${n(Tt.customers)}`],
      ["₹ per year", `${inr(ts.launchPrice)} ÷ 1.05 GST = ₹9,523, spread over a ${A.M8}-year life = ${inr(Tt.revPerCustomer)}`],
      ["TAM", `${n(Tt.customers)} × ${inr(Tt.revPerCustomer)} = ${crore(Tt.tam)}`],
      ["SAM", `× 31.1% urban × 40% under neurologist care = ${n(Tt.samCustomers)} people = ${crore(Tt.sam)}`],
      ["SOM", `30 clinics × 4/month × 12 + 50 online/month × 12 = ${n(Tt.somCustomers)} × ${inr(Tt.revPerCustomer)} = ${lakh(Tt.som)}`]]],
    ["ParkinSense (PD households)", CYAN, [
      ["Customers", `Indians aged 60+ with Parkinson's = ${n(P.customers)}`],
      ["₹ per year", `${inr(D.assumptions.P3 as number)} ÷ 1.18 GST ÷ ${A.M8} years + 40% × ₹169 plan × 12 = ${inr(P.revPerCustomer)}`],
      ["TAM", `${n(P.customers)} × ${inr(P.revPerCustomer)} = ${crore(P.tam)}`],
      ["SAM", `× 31.1% urban × 40% under care = ${n(P.samCustomers)} = ${crore(P.sam)}`],
      ["SOM", `30 clinics × 2/month × 12 + 60 online/month × 12 = ${n(P.somCustomers)} × ${inr(P.revPerCustomer)} = ${lakh(P.som)}`]]],
    ["ParkinSense as a general wearable (upside)", MINT, [
      ["Customers", `Smartwatches sold in India in 2024 (IDC) = ${(G.customers / 1e7).toFixed(1)} Cr buyers a year`],
      ["₹ per year", `same as above = ${inr(G.revPerCustomer)}`],
      ["TAM", `${(G.customers / 1e7).toFixed(1)} Cr × ${inr(G.revPerCustomer)} = ₹${n(G.tam / 1e7)} Cr`],
      ["SAM", `× 2.8% premium ("advanced") watches = ${n(G.samCustomers)} = ${crore(G.sam)}`],
      ["SOM", `${R.map((r) => `${+(r.share * 100).toFixed(2)}%`).join(" / ")} of SAM buyers = ${R.map((r) => n(r.customers)).join(" / ")} × ${inr(G.revPerCustomer)} = ${R.map((r) => rv(r.som)).join(" / ")} (plan / upside / strong)`]]],
  ];
  return (
    <Frame label="Market opportunity" title="Bottom-up, product by product" aside={
      <div className="flex gap-2">
        {layers.map(([k, v, c], i) => (
          <motion.div key={k} className="rounded-xl border px-4 py-2 text-center" style={{ borderColor: `${c}AA`, background: `${c}22` }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.2 }}>
            <p className="t-micro" style={{ color: c }}>{k} · company</p>
            <p className="t-h2 t-num"><CountUp to={v} delay={0.2 + i * 0.2} format={(x) => (k.startsWith("SOM") ? lakh(x) : crore(x))} /></p>
          </motion.div>
        ))}
      </div>}>
      <p className="t-small -mt-2 mb-3 text-mist">Company totals add TremoSense and ParkinSense (PD households). The general-wearable column is upside and is not in the totals or the plan.</p>
      <div className="grid gap-3 @5xl:grid-cols-3">
        {calc.map(([name, c, steps], i) => (
          <motion.div key={name} className="panel p-4" style={{ borderColor: `${c}66` }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15, ease }}>
            <p className="t-small font-semibold" style={{ color: c }}>{name}</p>
            <dl className="mt-2 space-y-1.5">
              {steps.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[72px_1fr] gap-2">
                  <dt className={`t-micro ${["TAM", "SAM", "SOM"].includes(k) ? "font-semibold text-white" : "text-slate"}`}>{k}</dt>
                  <dd className={`t-num ${["TAM", "SAM", "SOM"].includes(k) ? "t-small text-white" : "t-micro text-mist"}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        ))}
      </div>
      <motion.div className="panel mt-3 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
        <table className="t-small t-num w-full border-collapse">
          <thead><tr className="bg-navy-3/80 text-left"><th className="px-4 py-2 text-white">Result</th><th className="px-3 py-2 text-violet">TremoSense</th><th className="px-3 py-2 text-cyan">ParkinSense (PD households)</th><th className="px-3 py-2 text-white">Company total</th><th className="px-3 py-2 text-mint">ParkinSense general wearable (upside)</th></tr></thead>
          <tbody>
            {[["TAM", crore(Tt.tam), crore(P.tam), crore(T.tam), `₹${n(G.tam / 1e7)} Cr`], ["SAM", crore(Tt.sam), crore(P.sam), crore(T.sam), crore(G.sam)], ["SOM · Year 3", lakh(Tt.som), lakh(P.som), lakh(T.som), `${lakh(G.som)} plan · ${R.slice(1).map((r) => rv(r.som)).join(" · ")} upside`], ["SOM customers / year", n(Tt.somCustomers), n(P.somCustomers), "—", R.map((r) => n(r.customers)).join(" · ")]].map((r) => (
              <tr key={r[0]} className="border-t hairline"><td className="px-4 py-1.5 text-slate">{r[0]}</td><td className="px-3 py-1.5 text-white">{r[1]}</td><td className="px-3 py-1.5 text-white">{r[2]}</td><td className="px-3 py-1.5 font-semibold text-white">{r[3]}</td><td className="px-3 py-1.5 text-mint" style={{ background: "rgba(52,211,153,.07)" }}>{r[4]}</td></tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      <Src>Sources: UNFPA India Ageing Report 2023 (14.9 Cr aged 60+, 10.5% of population); PD 308.9 per lakh aged 60+ (Khurana &amp; Gourie-Devi, Cureus 2025); ET 89.96 per lakh (Chin et al., Mov Disord 2021); Census 2011 (31.1% urban); IDC India wearables 2024 (3.5 Cr smartwatches, 2.8% advanced). Estimates: 50% eating-disruptive tremor, 40% under neurologist care, 3-year device life, 40% subscription take-up, clinic and online volumes, 0.25% SOM share (0.5% and 1% shown as upside).</Src>
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
                className={`rounded-2xl border p-4 ${j === 3 ? "border-mint/50 bg-mint/10" : j === 2 ? "border-amber/50 bg-amber/5" : "hairline bg-navy-2/80"}`}>
                <p className="t-micro text-slate @3xl:hidden">{head[j]}</p>
                <p className={`t-small ${j === 3 ? "text-mint" : "text-white"}`}>{c}</p>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      <motion.div className="panel mt-6 p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, ease }}>
        <div className="flex items-baseline justify-between">
          <p className="t-h2">Kill or persevere: the thresholds, set before the study</p>
          <p className="t-micro text-slate">Decided at M6 by the TremoSense self-feeding study (n ≥ 10)</p>
        </div>
        <div className="mt-4 grid gap-6 @5xl:grid-cols-2">
          {[["Median tremor reduction while eating", [[0, 30, "#F87171", "Kill TremoSense · focus on ParkinSense"], [30, 50, AMBER, "Redesign and re-test once"], [50, 100, MINT, "Persevere"]], 90, "Bench today ≈90% (simulator)"],
            ["Users who would pay ₹9,999", [[0, 60, AMBER, "Pivot to clinic rental (₹799/mo)"], [60, 100, MINT, "Persevere with the sale"]], null, "Not yet measured"]].map(([label, zones, mark, now], gi) => (
            <div key={label as string}>
              <p className="t-small text-white">{label as string}</p>
              <div className="relative mt-2 flex h-8 overflow-hidden rounded-lg">
                {(zones as [number, number, string, string][]).map(([x0, x1, c, t], zi) => (
                  <motion.div key={t} className="t-micro flex items-center justify-center px-1 text-center font-medium text-navy" style={{ width: `${x1 - x0}%`, background: c, originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.4 + gi * 0.3 + zi * 0.12, duration: 0.5, ease }}>{t}</motion.div>
                ))}
                {mark !== null && <motion.span className="absolute top-0 h-full w-0.5 bg-white" style={{ left: `${mark}%` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} />}
              </div>
              <div className="t-micro mt-1 flex justify-between text-slate"><span>0%</span><span>{(zones as [number, number, string, string][]).slice(0, -1).map((z) => `${z[1]}%`).join(" · ")}</span><span>100%</span></div>
              <p className="t-micro mt-1 text-mist">Today: {now as string}</p>
            </div>
          ))}
        </div>
        <p className="t-micro mt-3 text-mist"><span className="text-cyan">ParkinSense pass mark: </span>dominant-frequency error within 5% of a reference device and zero false steps during tremor (M10). If it fails, it launches as a wellness band without tremor scores until fixed.</p>
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
  const [prod, setProd] = useState<"ts" | "ps">("ts");
  const [scen, setScen] = useState<"A" | "B" | "C">("B");
  const [tsPrice, setTsPrice] = useState<number>(ts.launchPrice);
  const [psPrice, setPsPrice] = useState<number>(UE.parkinsenseDevice.price);
  const isTs = prod === "ts";
  const price = isTs ? tsPrice : psPrice;
  const setPrice = isTs ? setTsPrice : setPsPrice;
  const A = D.assumptions as Record<string, number>;
  const PD = UE.parkinsenseDevice, PL = UE.parkinsenseLtv;
  const gst = isTs ? A.P6 : A.P7, chan = isTs ? A.P8 : PD.channel / PD.exGst, ful = 250, rep = A.U2;
  const cac = isTs ? UE.tremosenseLtv.cac : PL.cac;
  const subLife = PL.ltv - PD.contribution; // subscription contribution per customer (attach × months × margin), from the model
  const warr = isTs && scen === "A" ? 0.08 : A.U1;
  const psPrices = [5999, 6999, 7999, 8999, 9999];
  const calc = (p: number, k: "A" | "B" | "C") => {
    const ex = p / (1 + gst), ch = ex * chan, net = ex - ch, cogs = isTs ? sc[k].cogs : PD.cogs, gp = net - cogs, w = ex * (isTs && k === "A" ? 0.08 : A.U1);
    const con = gp - w - ful, ltv = isTs ? con * (1 + rep) : con + subLife;
    return { ex, gstAmt: p - ex, ch, net, cogs, gp, w, con, ltv, gm: gp / net, cm: con / net, ltvCac: ltv / cac, pay: con > 0 ? cac / con : Infinity };
  };
  const rowsP = isTs ? ts.priceMatrix.map((r) => r.price) : psPrices;
  const u = calc(price, scen);
  const steps: [string, number, string, "in" | "out" | "sum"][] = [
    ["Customer pays (incl. GST)", price, "", "in"],
    [`GST ${pct(gst)}`, -u.gstAmt, "to government", "out"],
    [isTs ? `Clinic margin ${pct(chan)}` : `Online channel and payment fees ${pct(chan)}`, -u.ch, "of ex-GST price", "out"],
    ["Net revenue to AVERRA", u.net, "", "sum"],
    [isTs ? `Unit cost (COGS, scenario ${scen})` : "Unit cost (COGS)", -u.cogs, isTs ? sc[scen].lines.slice(0, 3).map((l) => `${l.item.split(" (")[0].split(":")[0]} ${inr(l.cost)}`).join(" · ") + " …" : "nRF52840 board, PPG sensor, battery, housing, strap, assembly", "out"],
    ["Gross profit", u.gp, `gross margin ${pct(u.gm)}`, "sum"],
    [`Warranty reserve ${pct(warr)}`, -u.w, "of ex-GST price", "out"],
    ["Fulfilment and shipping", -ful, "per unit", "out"],
    ["Contribution per unit", u.con, `contribution margin ${pct(u.cm)}`, "sum"],
  ];
  const max = price;
  return (
    <Frame label="Pricing and unit economics" title="What one sale earns, at every price"
      aside={<div className="flex flex-col items-end gap-2"><Tabs label="product" value={prod} onChange={setProd} options={[{ id: "ts", label: "TremoSense", color: VIOLET }, { id: "ps", label: "ParkinSense", color: CYAN }]} />
        {isTs ? <Tabs label="cost scenario" value={scen} onChange={setScen} options={[{ id: "A", label: `A · prototype ${inr(sc.A.cogs)}` }, { id: "B", label: `B · small batch ${inr(sc.B.cogs)}` }, { id: "C", label: `C · scaled ${inr(sc.C.cogs)}` }]} /> : <p className="t-micro text-slate">18% GST · sold online · COGS {inr(PD.cogs)}</p>}</div>}>
      <div className="grid gap-5 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="panel p-5">
          <p className="t-micro text-slate">One {isTs ? "TremoSense" : "ParkinSense"} at <span className="t-num text-white">{inr(price)}</span>{isTs ? `, cost scenario ${scen}` : ""}</p>
          <ol className="mt-2 space-y-1">
            {steps.map(([k, v, note, t], i) => (
              <motion.li key={k} className={`grid grid-cols-[1fr_88px] items-center gap-3 ${t === "sum" ? "rounded-lg bg-white/5 px-2 py-1" : "px-2"}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                <div className="min-w-0">
                  <p className={`t-small ${t === "sum" ? "font-semibold text-white" : "text-mist"}`}>{t === "out" ? "− " : t === "sum" ? "= " : ""}{k} {note && <span className="t-micro text-slate">· {note}</span>}</p>
                  <div className="mt-0.5 h-1.5 rounded-full bg-navy-3"><motion.div className="h-full rounded-full" style={{ background: t === "out" ? "#F87171" : t === "sum" ? (v < 0 ? "#F87171" : CYAN) : BLUE }} animate={{ width: `${Math.min(100, (Math.abs(v) / max) * 100)}%` }} transition={{ duration: 0.5, ease }} /></div>
                </div>
                <span className={`t-small t-num text-right ${t === "sum" ? (v < 0 ? "text-coral" : "text-cyan") : t === "out" ? "text-coral/90" : "text-white"}`}>{inr(v)}</span>
              </motion.li>
            ))}
          </ol>
          <div className="mt-3 grid grid-cols-4 gap-2 border-t hairline pt-3">
            {[["CAC", inr(cac), "outreach ÷ customers"], ["LTV", inr(u.ltv), isTs ? `${inr(u.con)} × ${(1 + rep).toFixed(1)} purchases` : `${inr(u.con)} + ${inr(subLife)} subscription`], ["LTV : CAC", `${u.ltvCac.toFixed(1)}×`, u.ltvCac >= 3 ? "healthy (≥3×)" : u.ltvCac >= 1 ? "positive, below 3×" : "loses money"], ["Payback", u.pay <= 1 ? "first sale" : u.pay === Infinity ? "never" : `${u.pay.toFixed(1)} sales`, `${inr(cac)} ÷ ${inr(u.con)}`]].map(([k, v, n]) => (
              <div key={k}><p className="t-micro text-slate">{k}</p><p className="t-h2 t-num text-white">{v}</p><p className="t-micro text-slate">{n}</p></div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="panel overflow-hidden">
            <table className="t-small w-full border-collapse">
              <thead><tr className="bg-navy-3/80 text-left text-white"><th className="px-3 py-2">Price</th><th className="px-2 py-2">Net revenue</th><th className="px-2 py-2">Gross margin</th><th className="px-2 py-2">Contribution</th><th className="px-2 py-2">LTV:CAC</th><th className="px-2 py-2">Verdict</th></tr></thead>
              <tbody>
                {rowsP.map((rp) => {
                  const r = { price: rp };
                  const x = calc(r.price, scen), on = r.price === price;
                  return (
                    <tr key={r.price} onClick={() => setPrice(r.price)} className={`cursor-pointer border-t hairline transition-colors ${on ? "bg-cyan/15" : "hover:bg-white/5"}`}>
                      <td className="t-num px-3 py-1.5 text-white">{inr(r.price)}{isTs && r.price === ts.launchPrice ? <span className="t-micro ml-1 text-cyan">launch</span> : isTs && r.price === ts.postCostPrice ? <span className="t-micro ml-1 text-violet">M19</span> : !isTs && r.price === PD.price ? <span className="t-micro ml-1 text-cyan">plan</span> : null}</td>
                      <td className="t-num px-2 py-1.5 text-mist">{inr(x.net)}</td>
                      <td className="t-num px-2 py-1.5 text-mist">{pct(x.gm)}</td>
                      <td className={`t-num px-2 py-1.5 font-medium ${x.con < 0 ? "text-coral" : "text-cyan"}`}>{inr(x.con)} <span className="t-micro text-slate">{pct(x.cm)}</span></td>
                      <td className={`t-num px-2 py-1.5 ${x.ltvCac >= 3 ? "text-mint" : x.ltvCac >= 1 ? "text-amber" : "text-coral"}`}>{x.ltvCac.toFixed(1)}×</td>
                      <td className="t-micro px-2 py-1.5 text-slate">{x.con < 0 ? "Loses money" : x.ltvCac >= 3 ? "Healthy" : "Thin"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="panel p-4">
            <p className="t-small font-medium" style={{ color: isTs ? VIOLET : CYAN }}>{isTs ? "Why ₹9,999 now and ₹8,999 later" : "Why ₹7,999"}</p>
            <p className="t-micro mt-1 text-mist">{isTs ? `At small-batch cost (${inr(sc.B.cogs)}), ₹9,999 is the lowest price with LTV:CAC above 3×. Once tooling and supplier quotes bring cost to ${inr(sc.C.cogs)} (scenario C), ₹8,999 earns more per unit than ₹9,999 does today.` : `Below every screenless band: Amazfit Helio Strap ₹12,000+, Google Fitbit Air ₹13,999, WHOOP One ₹20,890 a year and Garmin Cirqa ₹25,990, with no mandatory subscription. At ₹7,999 each device earns ${inr(PD.contribution)}, and the optional ${inr(D.assumptions.P4 as number)}/month plan (40% take-up assumed) lifts LTV to ${inr(PL.ltv)}.`}</p>
          </div>
          <p className="t-micro text-slate">Click a price to see its breakdown. Sources: XIAO nRF52840 Sense list price (Seeed), MG92B retail price; other costs are estimates awaiting supplier quotes. CAC = planned outreach ÷ planned customers; LTV assumes 40% repurchase at end of life. No customers yet.</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 13 financials */
function Financials() {
  const fc = D.forecast as typeof D.forecast & { costLines: { label: string; y1: number; y2: number; y3: number }[]; revLines: { label: string; units: { y1: number; y2: number; y3: number } | null; y1: number; y2: number; y3: number }[] };
  const [view, setView] = useState<"net" | "cum">("net");
  const W = 900, Hc = 250, pad = 28;
  const n = fc.costs.length;
  const maxV = Math.max(...fc.costs, ...fc.cashIn);
  const series = view === "net" ? fc.net : fc.cumulative;
  const sMin = Math.min(0, ...series), sMax = Math.max(0, ...series);
  const bw = (W - pad) / n;
  const yBar = (v: number) => (v / maxV) * (Hc - 40);
  const yLine = (v: number) => Hc - 20 - ((v - sMin) / (sMax - sMin || 1)) * (Hc - 60);
  const pts = series.map((v, i) => [pad + i * bw + bw / 2, yLine(v)] as const);
  const path = "M" + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L");
  const beIdx = fc.months.findIndex((_, i) => fc.net.slice(i).every((v) => v >= 0) && i >= 12);
  const Y = fc.years;
  const p1Burn = H.phase1Costs / 6;
  const runway = F.C.equity / p1Burn;
  const L = (v: number) => (v === 0 ? "–" : lakh(v));
  return (
    <Frame label="Financial outlook" title={`Operating break-even in ${beMonthName}, then profitable`}
      lead="36 months from July 2027. Every line below comes from the financial model; costs are grouped from 26 line items.">
      <div className="grid gap-5 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="space-y-3">
          <div className="panel p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <Tabs label="forecast line" value={view} onChange={setView} options={[{ id: "net", label: "Monthly profit" }, { id: "cum", label: "Cumulative cash" }]} />
              <p className="t-micro text-slate"><span className="mr-1.5 inline-block h-2 w-3 rounded-sm bg-violet" />Costs <span className="ml-2 mr-1.5 inline-block h-2 w-3 rounded-sm bg-cyan" />Cash in</p>
            </div>
            <svg viewBox={`0 0 ${W} ${Hc}`} className="w-full" role="img" aria-label="Monthly costs, cash in and operating profit over 36 months">
              {fc.costs.map((c, i) => (
                <g key={i}>
                  <motion.rect x={pad + i * bw + 1} width={bw / 2 - 1} y={Hc - 20 - yBar(c)} height={yBar(c)} rx={1.5} fill={VIOLET} fillOpacity={0.7} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: 1, transformBox: "fill-box" }} transition={{ delay: i * 0.02, duration: 0.5 }} />
                  <motion.rect x={pad + i * bw + bw / 2} width={bw / 2 - 1} y={Hc - 20 - yBar(fc.cashIn[i])} height={yBar(fc.cashIn[i])} rx={1.5} fill={CYAN} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: 1, transformBox: "fill-box" }} transition={{ delay: 0.3 + i * 0.02, duration: 0.5 }} />
                </g>
              ))}
              <line x1={pad} x2={W} y1={yLine(0)} y2={yLine(0)} stroke="#94A3B8" strokeDasharray="4 4" strokeWidth="1" />
              <motion.path key={view} d={path} fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease, delay: 0.6 }} />
              {beIdx >= 0 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
                  <line x1={pad + beIdx * bw} x2={pad + beIdx * bw} y1={10} y2={Hc - 20} stroke={MINT} strokeWidth="1.5" />
                  <text x={pad + beIdx * bw - 8} y={22} fill={MINT} fontSize="14" fontWeight="600" textAnchor="end">Break-even {fc.months[beIdx]}</text>
                </motion.g>
              )}
              {[0, 12, 24, 35].map((i) => <text key={i} x={pad + i * bw} y={Hc - 4} fill="#94A3B8" fontSize="12">{fc.months[i]}</text>)}
            </svg>
          </div>
          <div className="panel p-4">
            <p className="t-small font-medium text-white">Burn, runway and zero-cash date</p>
            <ul className="t-small t-num mt-2 space-y-1 text-mist">
              <li>Year-1 gross burn = {lakh(H.costs12)} ÷ 12 = <span className="text-white">{lakh(H.grossBurn12, 2)}/month</span>; net burn after {lakh(H.cashIn12)} cash in = <span className="text-white">{lakh(H.netBurn12, 2)}/month</span></li>
              <li>Phase-1 burn (M1–M6) = {lakh(H.phase1Costs, 2)} ÷ 6 = <span className="text-white">{lakh(p1Burn, 2)}/month</span></li>
              <li>Runway on this round = {lakh(F.C.equity, 2)} ÷ {lakh(p1Burn, 2)} = <span className="text-white">{runway.toFixed(1)} months</span></li>
              <li>Zero-cash date without tranche 2: <span className="font-semibold text-coral">January 2028</span>. Tranche 2 ({lakh(H.phase2Requirement)}) is raised on the M6 result.</li>
              <li>Total needed to reach profit: peak gap {lakh(H.fullGap)} × 1.2 buffer = <span className="text-violet">{lakh(H.fullRequirement)}</span></li>
            </ul>
          </div>
        </div>
        <div className="panel overflow-hidden">
          <table className="t-micro t-num w-full border-collapse">
            <thead><tr className="bg-navy-3/80 text-left text-white"><th className="px-3 py-2">₹, cash basis</th><th className="px-2 py-2 text-right">Year 1</th><th className="px-2 py-2 text-right">Year 2</th><th className="px-3 py-2 text-right">Year 3</th></tr></thead>
            <tbody>
              <tr><td colSpan={4} className="px-3 pt-2 font-semibold text-cyan">Cash in (units sold × price after GST and channel)</td></tr>
              {fc.revLines.map((r) => (
                <tr key={r.label} className="text-mist"><td className="px-3 py-1">{r.label}{r.units ? <span className="text-slate"> · {r.units.y1} / {r.units.y2} / {r.units.y3} units</span> : null}</td><td className="px-2 py-1 text-right">{L(r.y1)}</td><td className="px-2 py-1 text-right">{L(r.y2)}</td><td className="px-3 py-1 text-right">{L(r.y3)}</td></tr>
              ))}
              <tr className="border-t hairline font-semibold text-white"><td className="px-3 py-1.5">Total cash in</td><td className="px-2 py-1.5 text-right">{lakh(Y.cashIn.y1)}</td><td className="px-2 py-1.5 text-right">{lakh(Y.cashIn.y2)}</td><td className="px-3 py-1.5 text-right text-cyan">{lakh(Y.cashIn.y3)}</td></tr>
              <tr><td colSpan={4} className="px-3 pt-2 font-semibold text-violet">Costs</td></tr>
              {fc.costLines.map((r) => (
                <tr key={r.label} className="text-mist"><td className="px-3 py-1">{r.label}</td><td className="px-2 py-1 text-right">{L(r.y1)}</td><td className="px-2 py-1 text-right">{L(r.y2)}</td><td className="px-3 py-1 text-right">{L(r.y3)}</td></tr>
              ))}
              <tr className="border-t hairline font-semibold text-white"><td className="px-3 py-1.5">Total costs</td><td className="px-2 py-1.5 text-right">{lakh(Y.costs.y1)}</td><td className="px-2 py-1.5 text-right">{lakh(Y.costs.y2)}</td><td className="px-3 py-1.5 text-right">{lakh(Y.costs.y3)}</td></tr>
              <tr className="border-t hairline text-[1.1em] font-semibold"><td className="px-3 py-2 text-white">Operating profit</td>{(["y1", "y2", "y3"] as const).map((k, i) => <td key={k} className={`py-2 text-right ${i === 2 ? "px-3" : "px-2"} ${Y.net[k] < 0 ? "text-amber" : "text-mint"}`}>{lakh(Y.net[k])}</td>)}</tr>
            </tbody>
          </table>
          <p className="t-micro px-3 pb-3 text-slate">Year 3 margin {pct(H.y3Margin, 1)}; month-36 profit {lakh(H.m36Profit)}. Inventory is expensed when bought.</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 14 team & growth */
/** Team as a mind map: AVERRA in the centre, founders on either side with their skills, future hires below. */
function TeamMap() {
  const W = 640, Hh = 430, cx = 320, cy = 175;
  const founders = [
    { x: 125, y: 95, ini: "PK", name: "Pranshu Kumar", c: CYAN, leaves: [["Wearable electronics", 30, 205], ["Sensors & firmware", 125, 245], ["Built ParkinSense", 222, 205]] },
    { x: 515, y: 95, ini: "PS", name: "Pawan Shinde", c: VIOLET, leaves: [["Control & gimbal", 418, 205], ["Power electronics", 515, 245], ["Co-built TremoSense", 612, 205]] },
  ];
  const hires = [["Clinic sales lead", "M19", 150], ["Customer support", "M19", 320], ["App & firmware engineer", "M25", 490]] as const;
  const line = (x1: number, y1: number, x2: number, y2: number) => `M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2}`;
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full overflow-visible" role="img" aria-label="Team mind map">
      <defs>{founders.map((f) => <radialGradient key={f.ini} id={`tg-${f.ini}`}><stop offset="0.55" stopColor={f.c} stopOpacity="0.55" /><stop offset="1" stopColor={f.c} stopOpacity="0" /></radialGradient>)}</defs>
      {founders.map((f, i) => (
        <g key={f.ini}>
          <motion.path d={`M${cx},${cy} Q${(cx + f.x) / 2},${cy} ${f.x},${f.y + 32}`} fill="none" stroke={f.c} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: 0.3 + i * 0.15 }} />
          {f.leaves.map(([t, lx, ly], j) => (
            <g key={t as string}>
              <motion.path d={line(f.x, f.y + 34, lx as number, (ly as number) - 13)} fill="none" stroke={f.c} strokeOpacity="0.45" strokeWidth="1.4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.9 + j * 0.1 }} />
              <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: `${lx}px ${ly}px` }} transition={{ delay: 1.1 + j * 0.1 }}>
                <rect x={(lx as number) - 56} y={(ly as number) - 13} width="112" height="26" rx="13" fill={`${f.c}22`} stroke={f.c} strokeOpacity="0.6" />
                <text x={lx as number} y={(ly as number) + 4} textAnchor="middle" fontSize="11" fill="#E2E8F0">{t}</text>
              </motion.g>
            </g>
          ))}
          <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.15 }}>
            <circle cx={f.x} cy={f.y} r="46" fill={`url(#tg-${f.ini})`} />
            <circle cx={f.x} cy={f.y} r="26" fill={f.c} />
            <text x={f.x} y={f.y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#0B1222">{f.ini}</text>
            <text x={f.x} y={f.y - 54} textAnchor="middle" fontSize="17" fontWeight="600" fill="#fff">{f.name}</text>
            <text x={f.x} y={f.y - 37} textAnchor="middle" fontSize="11" fill={f.c}>Co-founder · hardware & test</text>
          </motion.g>
        </g>
      ))}
      {hires.map(([t, m, hx], i) => (
        <g key={t}>
          <motion.path d={line(cx, cy + 34, hx, 335)} fill="none" stroke="#94A3B8" strokeOpacity="0.5" strokeDasharray="4 5" strokeWidth="1.4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 1.4 + i * 0.12 }} />
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 + i * 0.12 }}>
            <rect x={hx - 75} y={335} width="150" height="44" rx="12" fill="rgba(19,29,51,.9)" stroke="#94A3B8" strokeOpacity="0.5" strokeDasharray="4 4" />
            <text x={hx} y={354} textAnchor="middle" fontSize="12" fill="#fff">{t}</text>
            <text x={hx} y={370} textAnchor="middle" fontSize="10.5" fill="#94A3B8">Hire at {m}</text>
          </motion.g>
        </g>
      ))}
      <text x={cx} y={410} textAnchor="middle" fontSize="11" fill="#94A3B8">Future hires fill the commercial gap; the founders stay the hardware and test engineers</text>
      <motion.g initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ transformOrigin: `${cx}px ${cy}px` }} transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}>
        <circle cx={cx} cy={cy} r="44" fill="#0B1222" stroke="#06B6D4" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="54" fill="none" stroke="#06B6D4" strokeOpacity="0.25" />
        <image href="/brand/averra-mark-white.svg" x={cx - 22} y={cy - 22} width="44" height="44" />
      </motion.g>
    </svg>
  );
}

function TeamGrowth() {
  return (
    <Frame label="Team and growth" title="A builder team, growing through clinics">
      <div className="grid gap-8 @5xl:grid-cols-2">
        <div>
          <TeamMap />
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
                <motion.li key={a} variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0 } }} className="grid grid-cols-[9rem_1fr] items-baseline gap-4 rounded-xl border hairline bg-navy-2/80 px-4 py-1.5 @3xl:grid-cols-[11rem_12rem_1fr]">
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
          <svg viewBox="0 0 180 180" className="h-36 w-36 shrink-0 -rotate-90" aria-label="Cap table after this round">
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
      <div className="mt-3 grid gap-2 @3xl:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {[
          [`Round 1 · now · ${lakh(I)}`, CYAN, "Funds M1–M6: both founders full-time, 12 study units, the user study, a provisional patent filing and a CDSCO classification opinion.", "Evidence by M6: user-study result against the kill / persevere thresholds, published bench logs, device class."],
          [`Tranche 2 · must close by M7 (Jan 2028) · ${lakh(H.phase2Requirement)}`, VIOLET, "Priced on the M6 evidence, not on today's target. Funds the pilot batch, EMC and CDSCO filing, first sales at M12 and the clinic network.", `Round 1 + tranche 2 = ${lakh(H.fullRequirement)}, the total needed to reach break-even.`],
          ["If tranche 2 is late", AMBER, `Pause hiring, inventory and testing; founders defer stipends. The ${lakh(I - H.phase1Costs)} buffer covers about 8 months of basic costs (≈₹0.2 L/month), so cash lasts to about M14.`, "The ₹20 L Startup India grant is applied for and never counted as secured; if awarded, it reduces tranche 2."],
        ].map(([k, c, a, b], i, arr) => (
          <div key={k} className="contents">
            <motion.div className="panel p-3" style={{ borderColor: `${c}88` }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.15 }}>
              <p className="t-small font-semibold" style={{ color: c as string }}>{k}</p>
              <p className="t-micro mt-1 text-mist">{a}</p>
              <p className="t-micro mt-1 text-white">{b}</p>
            </motion.div>
            {i < arr.length - 1 && <span className="hidden self-center text-xl text-slate @3xl:block">→</span>}
          </div>
        ))}
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
