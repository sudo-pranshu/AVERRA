"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
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

/* ------------------------------------------------------------------ shared drawing helpers */
function Wave({ className, draw = true }: { className?: string; draw?: boolean }) {
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const t = i / 240, x = t * 1200;
    const settle = 0.6;
    const y = t < settle ? 60 - 46 * Math.pow(1 - t / settle, 1.6) * Math.sin(2 * Math.PI * 3 * (t / settle)) : 60;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 1240 120" className={className} aria-hidden="true">
      <motion.path d={"M" + pts.join(" L")} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
        initial={draw ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 2.2, ease }} />
      <motion.circle cx="1205" cy="60" r="12" fill="#06B6D4" initial={draw ? { scale: 0, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2.0, duration: 0.5 }} />
    </svg>
  );
}

function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={`rounded-2xl border hairline object-cover ${className ?? ""}`} />;
}

function Flow({ steps, color, highlight = [] }: { steps: string[]; color: string; highlight?: number[] }) {
  return (
    <ol className="relative space-y-2">
      {steps.map((s, i) => (
        <motion.li key={s} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.12, duration: 0.45, ease }}
          className="t-small flex items-center gap-3 rounded-xl border px-3 py-2.5"
          style={{ borderColor: highlight.includes(i) ? color : "#2B3A5C", background: highlight.includes(i) ? `${color}1A` : "#16213A" }}>
          <span className="t-num grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-semibold text-navy" style={{ background: color }}>{i + 1}</span>
          <span className="text-white">{s}</span>
        </motion.li>
      ))}
    </ol>
  );
}

function SignalToSpectrum() {
  const W = 520, Hh = 120;
  const xs = SIG.x as number[], maxX = Math.max(...xs.map(Math.abs));
  const line = xs.map((v, i) => `${((i / (xs.length - 1)) * W).toFixed(1)},${(Hh / 2 - (v / maxX) * (Hh / 2 - 6)).toFixed(1)}`).join(" L");
  const ps = SIG.p as number[], fs = SIG.f as number[];
  return (
    <figure className="panel p-5">
      <figcaption className="t-small mb-2 text-slate">Raw movement (4 s) → frequency spectrum · synthetic signal for illustration</figcaption>
      <svg viewBox={`0 0 ${W} ${Hh}`} className="h-28 w-full" aria-label="Illustrative movement signal">
        <motion.path d={"M" + line} fill="none" stroke="#06B6D4" strokeWidth="1.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease }} />
      </svg>
      <div className="my-2 text-center text-sm text-blue">FFT</div>
      <svg viewBox={`0 0 ${W} 130`} className="h-32 w-full" aria-label="Illustrative spectrum with a tremor peak near 5 Hz">
        {ps.map((p, i) => {
          const bw = W / ps.length, h = (p / 100) * 110;
          return <motion.rect key={i} x={i * bw + 1} width={bw - 2} y={120 - h} height={h} rx={1.5} fill={fs[i] >= 4 && fs[i] <= 6.5 ? "#8B5CF6" : "#3B82F6"} fillOpacity={fs[i] >= 4 && fs[i] <= 6.5 ? 1 : 0.55}
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: 1, transformBox: "fill-box" }} transition={{ delay: 1.4 + i * 0.012, duration: 0.4 }} />;
        })}
        <text x="4" y="129" fill="#94A3B8" fontSize="10">0 Hz</text><text x={W - 34} y="129" fill="#94A3B8" fontSize="10">12 Hz</text>
      </svg>
      <p className="t-small mt-1 text-mist">Voluntary motion sits below 2 Hz; the tremor shows as its own peak near 5 Hz (violet).</p>
    </figure>
  );
}

/* ------------------------------------------------------------------ 1 opening */
function Opening() {
  return (
    <div className="mx-auto flex min-h-full max-w-[1360px] flex-col justify-center">
      <Wave className="mb-10 w-full max-w-4xl" />
      <motion.img src="/brand/averra-wordmark-white.svg" alt="AVERRA" className="h-10 w-auto self-start md:h-14" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.7 }} />
      <motion.h1 className="t-display mt-8 max-w-[14ch]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }}>{K.brand.tagline}</motion.h1>
      <motion.p className="t-body measure mt-6 text-mist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1, duration: 0.8 }}>{K.brand.positioning}</motion.p>
      <motion.div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
        <span><span className="text-white">ParkinSense</span> measures and helps people understand movement</span>
        <span><span className="text-white">TremoSense</span> assists people who live with tremor</span>
        <span>Pranshu Kumar and Pawan Shinde · VJTI Mumbai</span>
      </motion.div>
      <motion.p className="t-small mt-10 text-slate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}>Press → or Space to begin · N for presenter notes</motion.p>
    </div>
  );
}

/* ------------------------------------------------------------------ 2 problem */
function Problem() {
  const st = K.problem.stats;
  return (
    <Frame label="The problem" title="Movement is measured for minutes, and lived with all day" lead="Clinic visits sample a few minutes. At home, tremor in the 4–12 Hz band turns a spoon into a spill.">
      <Stagger className="grid gap-4 md:grid-cols-3">
        {[[MK.pd60 / 1e5, "Indians aged 60+ living with Parkinson's (derived from UNFPA 2023 × community prevalence)"], [MK.et / 1e5, "people with essential tremor (single rural-Gujarat study)"]].map(([v, l], i) => (
          <Item key={i} className="panel p-6">
            <p className="t-h1 text-cyan"><CountUp to={v as number} format={(n) => `≈${n.toFixed(1)} lakh`} /></p>
            <p className="t-small mt-2 text-mist">{l}</p>
          </Item>
        ))}
        <Item className="panel p-6"><p className="t-h1">{st[2][0]}</p><p className="t-small mt-2 text-mist">{st[2][1]}</p></Item>
      </Stagger>
      <h2 className="t-h2 mt-10">What we heard</h2>
      <p className="t-small mt-1 text-amber">No interviews were supplied; these slots stay empty until verbatim, consented quotes exist.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {K.problem.quotes.map(([who, q]) => (
          <blockquote key={who} className="rounded-2xl border border-dashed border-amber/60 p-5">
            <p className="t-body italic text-white">“{q}”</p>
            <footer className="t-small mt-3 text-slate">— {who}</footer>
          </blockquote>
        ))}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 3 why now */
function WhyNow() {
  return (
    <Frame label="Why now" title="Five dated shifts" lead="Wrist sensing is regulator-accepted, India has a clear device pathway, and the population most affected is growing fast.">
      <div className="relative mt-4">
        <motion.div className="absolute left-0 right-0 top-[11px] hidden h-px bg-line md:block" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ originX: 0 }} transition={{ duration: 1.2, ease }} />
        <ol className="grid gap-6 md:grid-cols-5">
          {K.whyNow.map(([date, text, url], i) => (
            <motion.li key={date + text} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.18, duration: 0.5, ease }}>
              <span className={`block h-[22px] w-[22px] rounded-full border-4 border-navy ${i % 2 ? "bg-violet" : "bg-cyan"}`} />
              <p className="t-h2 mt-4">{date}</p>
              <p className="t-body mt-2 text-mist">{text}</p>
              <a href={url} target="_blank" rel="noreferrer" className="t-small mt-2 inline-block text-slate underline hover:text-white">Source</a>
            </motion.li>
          ))}
        </ol>
      </div>
      <p className="t-body measure mt-12 text-mist">The microcontroller with an on-board 6-axis IMU used in both products lists at $15.90. Hardware is no longer the barrier; validation is.</p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 4 portfolio */
function Portfolio() {
  const [focus, setFocus] = useState<"ps" | "ts" | null>(null);
  const shared = ["Nordic nRF52840 microcontroller family", "LSM6DS3 6-axis IMU", "Real-time signal processing", "Embedded firmware", "The same founding team"];
  const card = (id: "ps" | "ts", name: string, role: string, color: string, img: string, rows: [string, string][]) => (
    <button onClick={() => setFocus(focus === id ? null : id)} aria-pressed={focus === id}
      className="panel group flex flex-col p-5 text-left transition-colors md:p-6" style={{ borderColor: focus === id ? color : undefined }}>
      <div className="flex items-center gap-4">
        <Photo src={img} alt={`${name} prototype`} className="h-24 w-20 md:h-28 md:w-24" />
        <div><p className="t-h2">{name}</p><p className="t-small" style={{ color }}>{role}</p></div>
      </div>
      <AnimatePresence initial={false}>
        {(focus === id || focus === null) && (
          <motion.dl initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="t-small mt-5 space-y-2 overflow-hidden text-mist">
            {rows.map(([k, v]) => <div key={k}><dt className="inline text-white">{k}: </dt><dd className="inline">{v}</dd></div>)}
          </motion.dl>
        )}
      </AnimatePresence>
    </button>
  );
  return (
    <Frame label="One company, two products" title="Shared engineering, different customers" lead="Select a product to see who it serves. The shared column is limited to what the evidence supports.">
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_auto_1fr]">
        {card("ps", "ParkinSense", "Measure and understand movement", "#06B6D4", "/images/parkinsense-wrist.jpg", [["Who", "wellness-minded adults and households living with movement disorders"], ["Buys it", "the user, online or via clinics"], ["Value", "activity and vitals plus movement-specific insight"]])}
        <div className="flex flex-col items-center gap-2 lg:w-64">
          <img src="/brand/averra-mark-white.svg" alt="" className="h-14 w-14" />
          <p className="t-small text-blue">Shared</p>
          {shared.map((s, i) => (
            <motion.p key={s} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="t-small w-full rounded-full border border-blue/60 bg-navy-3 px-3 py-1.5 text-center text-white">{s}</motion.p>
          ))}
          <p className="t-small mt-1 text-center text-slate">No shared revenue or cost savings claimed.</p>
        </div>
        {card("ts", "TremoSense", "Assist people who live with tremor", "#8B5CF6", "/images/tremosense-rig.jpg", [["Who", "older adults whose tremor disrupts eating"], ["Buys it", "families, via clinic or OT referral"], ["Value", "eat more independently, at an Indian price"]])}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 5 ParkinSense */
function ParkinSense() {
  const [filter, setFilter] = useState<"all" | StatusKey>("all");
  const feats = K.parkinsense.features as [string, StatusKey, string][];
  const keys = Array.from(new Set(feats.map((f) => f[1])));
  const shown = feats.filter((f) => filter === "all" || f[1] === filter);
  return (
    <Frame label="ParkinSense" title="A wellness wearable with movement intelligence" lead={K.parkinsense.pitch}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="space-y-4">
          <Photo src="/images/parkinsense-wrist.jpg" alt="ParkinSense prototype worn on the wrist" className="aspect-[4/5] w-full" />
          <p className="t-small text-slate">{K.parkinsense.hardware}</p>
          <div className="rounded-2xl border border-amber/60 p-4">
            <p className="t-small text-amber">{K.clinicalEvaluation.label}</p>
            <p className="t-small mt-1 text-mist">{K.clinicalEvaluation.detail}</p>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter features by status">
            {(["all", ...keys] as ("all" | StatusKey)[]).map((k) => (
              <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k}
                className={`t-small rounded-full border px-3 py-1 transition-colors ${filter === k ? "bg-white text-navy" : "hairline text-mist hover:text-white"}`}>
                {k === "all" ? "All features" : STATUS[k].label}
              </button>
            ))}
          </div>
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border hairline">
            <AnimatePresence initial={false}>
              {shown.map(([name, st, note]) => (
                <motion.li key={name} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-1 bg-navy-2 px-4 py-3 md:flex-row md:items-center md:gap-4">
                  <span className="t-small flex-1 text-white">{name}</span>
                  <span className="t-small flex-1 text-slate">{note}</span>
                  <Pill color={STATUS[st].color}>{STATUS[st].label}</Pill>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="mt-6 rounded-2xl border border-violet/50 bg-violet/10 p-4">
            <p className="t-small text-violet">Research path, not a claim</p>
            <ol className="t-small mt-2 flex flex-wrap gap-x-2 gap-y-1 text-mist">
              {K.parkinsense.researchPath.map((r, i) => <li key={r}>{i > 0 && <span className="mr-2 text-slate">→</span>}{r}</li>)}
            </ol>
            <p className="t-small mt-2 text-slate">{K.parkinsense.researchCaveat}</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 6 TremoSense */
function TremoSense() {
  const [audit, setAudit] = useState(false);
  return (
    <Frame label="TremoSense" title="Active stabilisation at the spoon" lead={K.tremosense.pitch}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <Photo src="/images/tremosense-rig.jpg" alt="TremoSense bench rig (frame from the repository video)" className="aspect-[3/4] w-full" />
          <p className="t-small text-slate">Bench rig from the public repository (FS90MG-class servo). The paper's MG92B build is not pictured.</p>
        </div>
        <div>
          <h2 className="t-h2 mb-3">How it works</h2>
          <Flow steps={K.tremosense.architecture} color="#8B5CF6" highlight={[1, 2]} />
        </div>
        <div>
          <div className="grid grid-cols-3 gap-3">
            {K.tremosense.results.map(([v, l, st]) => (
              <div key={l} className="panel p-4">
                <p className="t-h2 t-num" style={{ color: st === "planned" ? "#F59E0B" : "#8B5CF6" }}>{v}</p>
                <p className="t-small mt-1 text-mist">{l}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setAudit((v) => !v)} aria-expanded={audit} className="t-small mt-5 rounded-full border border-amber/70 px-4 py-1.5 text-amber hover:bg-amber/10">
            {audit ? "Hide" : "Show"} the repository vs paper audit
          </button>
          <AnimatePresence>
            {audit && (
              <motion.table initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="t-small mt-4 w-full border-collapse overflow-hidden rounded-xl">
                <thead><tr className="text-left text-white"><th className="p-2"> </th><th className="p-2">Public repository</th><th className="p-2">Paper</th></tr></thead>
                <tbody>{K.tremosense.repoVsPaper.map(([k, a, b]) => <tr key={k} className="border-t hairline align-top"><td className="p-2 text-slate">{k}</td><td className="p-2 text-mist">{a}</td><td className="p-2 text-mist">{b}</td></tr>)}</tbody>
              </motion.table>
            )}
          </AnimatePresence>
          <p className="t-small mt-5 text-coral">Next: reproduce the 77.3% bench result on the current build (M3), then the user study (M6).</p>
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
      <Tabs label="architecture" value={tab} onChange={setTab} options={[{ id: "ps", label: "ParkinSense", color: "#06B6D4" }, { id: "ts", label: "TremoSense", color: "#8B5CF6" }]} />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            {tab === "ps" ? <Flow steps={K.parkinsense.architecture} color="#06B6D4" highlight={[3]} /> : <Flow steps={K.tremosense.architecture} color="#8B5CF6" highlight={[1, 2]} />}
            <p className="t-small mt-4 text-slate">{tab === "ps" ? "Analysis runs in the host runtime today; on-wrist processing is not yet implemented." : "The public firmware uses a 2-state EKF; the paper describes a 4-state bias-tracking EKF."}</p>
          </motion.div>
        </AnimatePresence>
        <SignalToSpectrum />
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 8 competition */
function Competition() {
  const [tab, setTab] = useState<"parkinsense" | "tremosense">("parkinsense");
  const cmp = K.competitors[tab];
  const color = tab === "parkinsense" ? "#06B6D4" : "#8B5CF6";
  const priceRows = tab === "parkinsense"
    ? [...D.competitors.filter((c) => ["WHOOP One (WHOOP 5.0)", "Fitbit Charge 6", "Amazfit Bip 6"].includes(c.name)).map((c) => ({ name: c.name.replace(" (WHOOP 5.0)", " (12-mo)"), inr: c.inr, src: c.source, ours: false })), { name: "ParkinSense (hypothesis)", inr: D.assumptions.P3 as number, src: "", ours: true }]
    : [...D.competitors.filter((c) => ["GyroGlove", "Liftware (stabilising handle)", "Weighted soup spoon (225 g)"].includes(c.name)).map((c) => ({ name: c.name.replace(" (stabilising handle)", " (2015 price)").replace(" (225 g)", ""), inr: c.inr, src: c.source, ours: false })), { name: "TremoSense (hypothesis)", inr: ts.launchPrice, src: "", ours: true }];
  const max = Math.log10(Math.max(...priceRows.map((r) => r.inr)));
  const min = Math.log10(1000);
  return (
    <Frame label="Competition" title="Where we can compete, and what we still have to prove" lead={`Prices checked ${K.competitors.checked}. Benchmarks only; they do not drive AVERRA revenue.`}>
      <Tabs label="competitors" value={tab} onChange={setTab} options={[{ id: "parkinsense", label: "ParkinSense vs wearables", color: "#06B6D4" }, { id: "tremosense", label: "TremoSense vs tremor aids", color: "#8B5CF6" }]} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
          <div className="panel p-5">
            <p className="t-small mb-4 text-slate">Price in India, ₹ (log scale)</p>
            <ul className="space-y-3">
              {priceRows.map((r, i) => (
                <li key={r.name}>
                  <div className="t-small flex justify-between"><span className={r.ours ? "text-white" : "text-mist"}>{r.name}</span><span className="t-num text-white">{inr(r.inr)}</span></div>
                  <div className="mt-1 h-2.5 rounded-full bg-navy-3">
                    <motion.div className="h-full rounded-full" style={{ background: r.ours ? color : "#475569" }} initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, ((Math.log10(r.inr) - min) / (max - min)) * 100)}%` }} transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease }} />
                  </div>
                  {r.src && <a href={r.src} target="_blank" rel="noreferrer" className="text-[0.7rem] text-slate underline hover:text-white">source</a>}
                </li>
              ))}
            </ul>
            <p className="t-small mt-4 text-slate">{tab === "tremosense" ? "Different products: a spoon is not a whole-hand glove. Price context only." : "WHOOP's price is a 12-month membership that includes the strap."}</p>
          </div>
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border hairline">
              <table className="t-small w-full min-w-[640px] border-collapse">
                <thead><tr>{cmp.columns.map((c, j) => <th key={c + j} className="bg-navy-3 p-2.5 text-left font-semibold" style={{ color: j === 4 ? color : "#fff" }}>{c}</th>)}</tr></thead>
                <tbody>{cmp.rows.map((r) => <tr key={r[0]} className="border-t hairline align-top">{r.map((c, j) => <td key={j} className={`p-2.5 ${j === 0 ? "text-slate" : j === 4 ? "text-white" : "text-mist"}`} style={j === 4 ? { background: `${color}14` } : undefined}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <dl className="grid gap-3 md:grid-cols-2">
              {cmp.positioning.map(([k, v]) => <div key={k} className="panel p-4"><dt className="t-small" style={{ color }}>{k}</dt><dd className="t-small mt-1 text-mist">{v}</dd></div>)}
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
  const layers = [["TAM", T.tam, "Patients × annual revenue per customer", "#3B82F6", 100], ["SAM", T.sam, "Urban and under neurologist follow-up", "#06B6D4", 74], ["SOM · Year 3", T.som, "30 clinics in Mumbai and Pune, plus online", "#8B5CF6", 48]] as const;
  return (
    <Frame label="Market opportunity" title="Bottom-up, product by product" lead="Customer counts come from sourced prevalence; prices are hypotheses. The general wellness-wearable market is not sized here.">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-3">
          {layers.map(([k, v, l, c, w], i) => (
            <motion.div key={k} initial={{ opacity: 0, scaleX: 0.6 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.2 + i * 0.35, duration: 0.6, ease }}
              className="rounded-2xl border p-5" style={{ width: `${w}%`, borderColor: c, background: `${c}22` }}>
              <p className="t-small" style={{ color: c }}>{k}</p>
              <p className="t-h1 t-num"><CountUp to={v} format={(n) => (k.startsWith("SOM") ? lakh(n) : crore(n))} /></p>
              <p className="t-small text-mist">{l}</p>
            </motion.div>
          ))}
        </div>
        <table className="t-small h-fit w-full border-collapse">
          <thead><tr className="text-left"><th className="p-2"></th><th className="p-2 text-cyan">ParkinSense (PD households)</th><th className="p-2 text-violet">TremoSense</th></tr></thead>
          <tbody>
            {[["TAM customers", MK.parkinsense.customers.toLocaleString("en-IN"), MK.tremosense.customers.toLocaleString("en-IN")],
              ["₹ per customer per year", inr(MK.parkinsense.revPerCustomer), inr(MK.tremosense.revPerCustomer)],
              ["TAM", crore(MK.parkinsense.tam), crore(MK.tremosense.tam)], ["SAM", crore(MK.parkinsense.sam), crore(MK.tremosense.sam)],
              ["SOM customers per year", MK.parkinsense.somCustomers.toLocaleString("en-IN"), MK.tremosense.somCustomers.toLocaleString("en-IN")], ["SOM", lakh(MK.parkinsense.som), lakh(MK.tremosense.som)]].map((r) => (
              <tr key={r[0]} className="border-t hairline"><td className="p-2 text-slate">{r[0]}</td><td className="t-num p-2 text-white">{r[1]}</td><td className="t-num p-2 text-white">{r[2]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <Src>Sources: UNFPA India Ageing Report 2023; Khurana &amp; Gourie-Devi, Cureus 2025; Chin et al., Mov Disord 2021; Census 2011. Estimates: 40% under follow-up, 50% with eating-disruptive tremor.</Src>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 10 MVP */
function MVP() {
  const rows = [
    { name: "TremoSense", color: "#8B5CF6", cells: ["Motorised tremor simulator, 4/6/8 Hz, ±5° (paper)", "77.3% mean rejection; not yet reproduced in the public repository", "Self-feeding task, n ≥ 10: median reduction ≥50% and ≥60% would pay (M6)", "Persevere: validate on people before any claim"] },
    { name: "ParkinSense", color: "#06B6D4", cells: ["Bench conditions, BLE soak, power profiling; clinical evaluation with ICMR in progress", "8/8 bench conditions correct; ≈7 mA. ICMR results pending", "Dominant-frequency error ≤5% vs reference; 0 false steps in tremor (M10)", "Persevere: wellness launch; no clinical claim until results"] },
  ];
  const head = ["Experiment run", "Result so far", "Pre-registered next metric", "Decision"];
  return (
    <Frame label="MVP and validation" title="Bench-proven, clinical evaluation under way" lead="No metric was pre-registered before the bench tests. These are the first pre-registered tests.">
      <div className="space-y-6">
        {rows.map((r, ri) => (
          <div key={r.name}>
            <p className="t-h2 mb-3" style={{ color: r.color }}>{r.name}</p>
            <div className="grid gap-3 md:grid-cols-4">
              {r.cells.map((c, j) => (
                <motion.div key={j} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + ri * 0.4 + j * 0.12 }}
                  className={`rounded-2xl border p-4 ${j === 3 ? "border-mint/60 bg-mint/10" : j === 2 ? "border-amber/60" : "hairline bg-navy-2"}`}>
                  <p className="t-small text-slate">{head[j]}</p>
                  <p className={`t-small mt-1 ${j === 3 ? "text-mint" : "text-white"}`}>{c}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 11 business model */
function BusinessModel() {
  const boxes: [string, string, string?][] = [
    ["Key partners", "Neurology clinics, OT centres, university labs, a test lab, a contract assembler"], ["Key activities", "User studies, CDSCO and ISO 13485, firmware and signal processing, small-batch assembly"],
    ["Key resources", "Sensing and control know-how, bench evidence, two papers, prototypes"], ["Value propositions", "ParkinSense: movement insight on a wellness wearable. TremoSense: active tremor assistance at an Indian price", "#06B6D4"],
    ["Relationships", "Clinic-assisted trials, caregiver onboarding"], ["Channels", "Clinic and OT referral, direct online, institutional procurement"],
    ["Customer segments", "Households living with PD or ET, wellness-minded adults, research labs"], ["Cost structure", "Phase 1: team, study units, user study, IP. Then QMS, EMC, inventory, outreach"],
  ];
  const streams = [["Research-use kits for labs", `${inr(UE.ruoKit.price)} per kit, from M10, no medical claim`, "#06B6D4"], ["TremoSense sale or rental", `${inr(ts.launchPrice)} launch, ${inr(ts.postCostPrice)} from M19 · rental ${inr(D.assumptions.P11 as number)}/month`, "#8B5CF6"], ["ParkinSense device and optional subscription", `${inr(D.assumptions.P3 as number)} + ${inr(D.assumptions.P4 as number)}/month, from M25`, "#3B82F6"]];
  return (
    <Frame label="Business model" title="Clinics bring patients, families buy, labs fund early data">
      <Stagger className="grid gap-3 md:grid-cols-4">
        {boxes.map(([k, v, c]) => <Item key={k} className="panel p-4" ><p className="t-small" style={{ color: c ?? "#94A3B8" }}>{k}</p><p className="t-small mt-1 text-white">{v}</p></Item>)}
      </Stagger>
      <h2 className="t-h2 mt-8">Revenue streams, in launch order</h2>
      <ol className="mt-4 grid gap-3 md:grid-cols-3">
        {streams.map(([k, v, c], i) => (
          <motion.li key={k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.25 }} className="flex gap-3 rounded-2xl border p-4" style={{ borderColor: c }}>
            <span className="t-num grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-semibold text-navy" style={{ background: c }}>{i + 1}</span>
            <span><span className="t-small block text-white">{k}</span><span className="t-small text-mist">{v}</span></span>
          </motion.li>
        ))}
      </ol>
      <p className="t-small mt-4 text-amber">No reimbursement assumed: all revenue is out-of-pocket or institutional.</p>
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="panel p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Tabs label="cost scenario" value={scen} onChange={setScen} options={[{ id: "A", label: "A · prototype" }, { id: "B", label: "B · small batch" }, { id: "C", label: "C · scaled" }]} />
          </div>
          <div className="mt-5 space-y-2">
            {s.lines.map((l, i) => (
              <div key={l.item} className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div><p className="t-small text-mist">{l.item.split(" (")[0]}</p>
                  <div className="mt-1 h-2 rounded-full bg-navy-3"><motion.div className="h-full rounded-full bg-blue" animate={{ width: `${(l.cost / 1700) * 100}%` }} transition={{ duration: 0.6, ease, delay: i * 0.03 }} /></div></div>
                <span className="t-small t-num text-white">{inr(l.cost)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-end justify-between border-t hairline pt-4">
            <div><p className="t-small text-slate">Unit cost (COGS)</p><p className="t-h2 t-num"><CountUp key={scen} to={s.cogs} format={inr} /></p></div>
            <div className="text-right"><p className="t-small text-slate">Electronics incl. PCB</p><p className="t-h2 t-num text-mist">{inr(s.electronics)}</p></div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-navy-3"><motion.div className="h-full rounded-full bg-cyan" animate={{ width: `${(s.cogs / maxCost) * 100}%` }} transition={{ duration: 0.6 }} /></div>
        </div>
        <div className="space-y-4">
          <div className="panel p-5">
            <label className="t-small text-slate" htmlFor="price">Retail price including GST</label>
            <select id="price" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="t-body mt-2 w-full rounded-xl border hairline bg-navy-3 px-3 py-2 text-white">
              {ts.priceMatrix.map((r) => <option key={r.price} value={r.price}>{inr(r.price)}{r.price === ts.launchPrice ? " — launch price" : r.price === ts.postCostPrice ? " — from M19" : ""}</option>)}
            </select>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div><p className="t-small text-slate">Contribution per unit</p><p className={`t-h1 t-num ${contrib < 0 ? "text-coral" : "text-cyan"}`}>{inr(contrib)}</p></div>
              <div><p className="t-small text-slate">Contribution margin</p><p className={`t-h1 t-num ${margin < 0.2 ? "text-amber" : "text-white"}`}>{pct(margin)}</p></div>
            </div>
            <p className="t-small mt-2 text-mist">{row.verdict}. After 5% GST, 15% clinic margin, warranty and ₹250 fulfilment.</p>
          </div>
          <table className="t-small w-full border-collapse">
            <thead><tr className="text-left"><th className="p-2"></th><th className="p-2 text-violet">TremoSense</th><th className="p-2 text-cyan">ParkinSense</th></tr></thead>
            <tbody>
              {[["Gross margin", pct(UE.tremosense.grossMargin), pct(UE.parkinsenseDevice.grossMargin)], ["Contribution margin", pct(UE.tremosense.contributionMargin), pct(UE.parkinsenseDevice.contributionMargin)],
                ["CAC", inr(tl.cac), inr(pl.cac)], ["LTV", inr(tl.ltv), inr(pl.ltv)], ["LTV : CAC", `${tl.ltvCac.toFixed(1)}×`, `${pl.ltvCac.toFixed(1)}×`], ["Payback", "first sale", pl.paybackMonths > 0 ? `${pl.paybackMonths} months` : "first sale"]].map((r) => (
                <tr key={r[0]} className="border-t hairline"><td className="p-2 text-slate">{r[0]}</td><td className="t-num p-2 text-white">{r[1]}</td><td className="t-num p-2 text-white">{r[2]}</td></tr>))}
            </tbody>
          </table>
          <p className="t-small text-slate">Estimates; no customers yet. Gross margin excludes warranty and fulfilment; contribution margin includes them.</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 13 financials */
function Financials() {
  const fc = D.forecast;
  const [view, setView] = useState<"net" | "cum">("net");
  const W = 900, Hc = 300, pad = 28;
  const n = fc.costs.length;
  const maxV = Math.max(...fc.costs, ...fc.cashIn);
  const series = view === "net" ? fc.net : fc.cumulative;
  const sMin = Math.min(0, ...series), sMax = Math.max(0, ...series);
  const bw = (W - pad) / n;
  const yBar = (v: number) => (v / maxV) * (Hc - 40);
  const yLine = (v: number) => Hc - 20 - ((v - sMin) / (sMax - sMin || 1)) * (Hc - 60);
  const path = series.map((v, i) => `${(pad + i * bw + bw / 2).toFixed(1)},${yLine(v).toFixed(1)}`).join(" L");
  const beIdx = fc.months.findIndex((_, i) => fc.net.slice(i).every((v) => v >= 0) && i >= 12);
  const Y = fc.years;
  return (
    <Frame label="Financial outlook" title={`Operating break-even in ${beLabel.split(" · ")[1]}, then profitable`} lead={`36 months from July 2027. Phase 1 proves the product; TremoSense sales start in month 12; ParkinSense launches in month 25.`} wide>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="panel p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <Tabs label="forecast line" value={view} onChange={setView} options={[{ id: "net", label: "Monthly operating profit" }, { id: "cum", label: "Cumulative cash" }]} />
            <p className="t-small text-slate"><span className="mr-3 inline-block h-2 w-3 rounded-sm bg-violet" />Costs <span className="mx-3 inline-block h-2 w-3 rounded-sm bg-cyan" />Cash in</p>
          </div>
          <svg viewBox={`0 0 ${W} ${Hc}`} className="w-full" role="img" aria-label="Monthly costs, cash in and operating profit over 36 months">
            {fc.costs.map((c, i) => (
              <g key={i}>
                <motion.rect x={pad + i * bw + 1} width={bw / 2 - 1} y={Hc - 20 - yBar(c)} height={yBar(c)} fill="#8B5CF6" fillOpacity={0.75} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: 1, transformBox: "fill-box" }} transition={{ delay: i * 0.02, duration: 0.5 }} />
                <motion.rect x={pad + i * bw + bw / 2} width={bw / 2 - 1} y={Hc - 20 - yBar(fc.cashIn[i])} height={yBar(fc.cashIn[i])} fill="#06B6D4" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: 1, transformBox: "fill-box" }} transition={{ delay: 0.3 + i * 0.02, duration: 0.5 }} />
              </g>
            ))}
            <line x1={pad} x2={W} y1={yLine(0)} y2={yLine(0)} stroke="#94A3B8" strokeDasharray="4 4" strokeWidth="1" />
            <motion.path key={view} d={"M" + path} fill="none" stroke="#fff" strokeWidth="2.4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease, delay: 0.6 }} />
            {beIdx >= 0 && <g><line x1={pad + beIdx * bw} x2={pad + beIdx * bw} y1={10} y2={Hc - 20} stroke="#34D399" strokeWidth="1.5" /><text x={pad + beIdx * bw + 6} y={22} fill="#34D399" fontSize="13">Break-even {fc.months[beIdx]}</text></g>}
            {[0, 12, 24, 35].map((i) => <text key={i} x={pad + i * bw} y={Hc - 4} fill="#94A3B8" fontSize="12">{fc.months[i]}</text>)}
          </svg>
          <p className="t-small mt-2 text-slate">Cash basis: inventory is expensed when bought. The dashed line is zero for the white line.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 self-start">
          {[["Year 1 costs", lakh(H.costs12), "text-white"], ["Year 1 gross burn", `${lakh(H.grossBurn12, 2)}/mo`, "text-white"], ["Year 2 result", lakh(Y.net.y2), "text-amber"], ["Break-even", beLabel, "text-mint"],
            ["Year 3 cash in", crore(Y.cashIn.y3, 2), "text-cyan"], ["Year 3 operating profit", `${lakh(H.y3Profit)} · ${pct(H.y3Margin, 1)}`, "text-mint"], ["Month-36 profit", `${lakh(H.m36Profit)}/mo`, "text-mint"], ["Needed to reach profit", lakh(H.fullRequirement), "text-violet"]].map(([k, v, c]) => (
            <div key={k} className="panel p-4"><p className="t-small text-slate">{k}</p><p className={`t-h2 t-num mt-1 ${c}`}>{v}</p></div>
          ))}
          <p className="t-small col-span-2 text-slate">Volumes: TremoSense {Y.tsUnits.y2} units in Year 2 and {Y.tsUnits.y3} in Year 3 (SOM capacity {MK.tremosense.somCustomers}/year); ParkinSense {Y.psUnits.y3} in Year 3.</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 14 team & growth */
function TeamGrowth() {
  return (
    <Frame label="Team and growth" title="A builder team, growing through clinics">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[["Pranshu Kumar", "Co-founder, CEO", "Wearables, signal processing and firmware. ParkinSense lead author; TremoSense co-author; EXTC GPA 9.17; minor in AI/ML.", "#06B6D4"], ["Pawan Shinde", "Co-founder, CTO", "Control, gimbal and power electronics. TremoSense co-author (EKF + LQR platform).", "#8B5CF6"]].map(([n, r, e, c]) => (
              <div key={n} className="panel p-5" style={{ borderColor: c }}><p className="t-h2">{n}</p><p className="t-small" style={{ color: c }}>{r}</p><p className="t-small mt-3 text-mist">{e}</p></div>
            ))}
          </div>
          <div className="mx-auto h-6 w-px bg-line" />
          <div className="panel mx-auto max-w-sm p-4 text-center"><p className="t-small text-white">Hardware and test engineer</p><p className="t-small text-slate">Hire at M7 · support and sales hires from M19</p></div>
          <p className="t-small mt-4 text-mist">Collaborators, not founders: Prithvi Tambewagh; ParkinSense co-authors; VJTI supervisors. No advisory roles agreed yet.</p>
          <p className="t-small mt-2 text-amber">Equity split is set in a founders' agreement (not yet signed). ESOP 5%. Inventor assignments before any filing.</p>
        </div>
        <div>
          <ol className="flex flex-col items-center gap-2">
            {K.growth.funnel.map(([k, d, v], i) => (
              <motion.li key={k} initial={{ opacity: 0, scaleX: 0.7 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.2 + i * 0.15 }}
                className="flex items-center justify-between rounded-xl border px-4 py-2.5" style={{ width: `${100 - i * 11}%`, borderColor: i % 2 ? "#8B5CF6" : "#3B82F6", background: i % 2 ? "#8B5CF61F" : "#3B82F61F" }}>
                <span className="t-small"><span className="text-white">{k}</span> <span className="text-slate">· {d}</span></span>
                <span className="t-small t-num font-semibold text-cyan">{v}</span>
              </motion.li>
            ))}
          </ol>
          <p className="t-small mt-2 text-center text-slate">Targets, not observed data</p>
          <ol className="mt-5 space-y-2">
            {K.growth.experiments.map(([k, s, p], i) => <li key={k} className="panel p-3"><p className="t-small text-white">{i + 1}. {k} <span className="text-slate">· {s}</span></p><p className="t-small text-mist">{p}</p></li>)}
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
  const o = opts[sel];
  const I = F.C.equity, post = o.pre + I, esop = F.C.esop;
  const eq = [["Pre-money P", inr(o.pre), o.basis], ["Equity I", inr(I), "Milestone-1 requirement (peak gap × 1.2)"], ["Post-money", inr(post), "P + I"],
    ["Investor ownership", pct(o.investor, 1), "I ÷ (P + I)"], ["Founders", pct(o.founders, 1), `100% − investor − ${pct(esop)} ESOP`]];
  const segs = [["Founders", o.founders, "#34D399"], ["ESOP", esop, "#3B82F6"], ["Investor", o.investor, "#06B6D4"]] as const;
  return (
    <Frame label="Funding ask and valuation" title={`Raise ${lakh(I, 2)} at a ${lakh(V.proposed, 0)} pre-money`} lead={`${lakh(V.proposed, 0)} is a working negotiation target, framed by a cost-to-duplicate floor (${lakh(V.floor, 2)}) and a Berkus-style cross-check (${lakh(V.berkus, 0)}). The ₹20 L Startup India grant is applied for, not awarded.`} wide>
      <div className="grid gap-3 sm:grid-cols-3">
        {[["This round · Milestone 1 (M1–M6)", lakh(I), "text-cyan"], ["Year-1 cash costs", lakh(H.costs12), "text-white"], ["Total to reach profitability", lakh(H.fullRequirement), "text-violet"]].map(([k, v, c]) => (
          <div key={k} className="panel p-4"><p className="t-small text-slate">{k}</p><p className={`t-h2 t-num ${c}`}>{v}</p></div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Pre-money option">
        {opts.map((x, i) => (
          <button key={x.pre} role="tab" aria-selected={sel === i} onClick={() => setSel(i)} className={`t-small rounded-full border px-4 py-1.5 ${sel === i ? "border-cyan bg-cyan text-navy" : "hairline text-mist hover:text-white"}`}>{lakh(x.pre, 2)} · {x.basis}</button>
        ))}
      </div>
      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
          <AnimatePresence mode="wait">
            <motion.ol key={sel} className="space-y-2" initial="hidden" animate="show" exit={{ opacity: 0 }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.16 } } }}>
              {eq.map(([a, b, c]) => (
                <motion.li key={a} variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0 } }} className="grid grid-cols-[9rem_1fr] items-baseline gap-4 rounded-xl border hairline bg-navy-2 px-4 py-3 md:grid-cols-[11rem_12rem_1fr]">
                  <span className="t-small text-slate">{a}</span><span className="t-h2 t-num text-white">{b}</span><span className="t-small col-span-2 text-slate md:col-span-1">{c}</span>
                </motion.li>
              ))}
            </motion.ol>
          </AnimatePresence>
          <details className="panel mt-4 p-4">
            <summary className="t-small cursor-pointer text-mist">Berkus-style cross-check and funding scenarios A–D</summary>
            <ul className="t-small mt-3 space-y-1 text-mist">{V.berkusFactors.map((b) => <li key={b.factor}><span className="text-white">{b.factor}: {lakh(b.value)}</span> — {b.evidence}</li>)}</ul>
            <table className="t-small mt-4 w-full border-collapse"><thead><tr className="text-left text-white"><th className="p-1.5">Scenario</th><th className="p-1.5">Equity</th><th className="p-1.5">Investor</th><th className="p-1.5">Founders</th></tr></thead>
              <tbody>{(["A", "B", "C", "D"] as const).map((k) => <tr key={k} className="border-t hairline"><td className="p-1.5 text-slate">{k} · {F[k].grantStatus}</td><td className="t-num p-1.5">{lakh(F[k].equity)}</td><td className="t-num p-1.5">{pct(F[k].investor, 1)}</td><td className="t-num p-1.5">{pct(F[k].founders, 1)}</td></tr>)}</tbody></table>
            <p className="t-small mt-2 text-slate">All at the proposed pre-money. Raising everything up front (A/B) dilutes far more, which is why only Milestone 1 is raised now.</p>
          </details>
        </div>
        <div className="panel p-5">
          <p className="t-small text-slate">Cap table, before and after this round</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div><p className="t-small mb-2 text-mist">Before</p><div className="grid h-64 place-items-center rounded-xl bg-mint/40 text-sm font-semibold">Founders 100%</div></div>
            <div><p className="t-small mb-2 text-mist">After</p>
              <div className="flex h-64 flex-col overflow-hidden rounded-xl">
                {segs.map(([n, v, c]) => (
                  <motion.div key={n} layout animate={{ flexGrow: v }} transition={{ duration: 0.7, ease }} className="grid min-h-[1.6rem] place-items-center text-xs font-semibold" style={{ background: `${c}99`, flexBasis: 0 }}>{n} {pct(v, 1)}</motion.div>
                ))}
              </div>
            </div>
          </div>
          <p className="t-small mt-4 text-slate">The next round is priced on the user-study result, not on this target.</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 16 milestones & use of funds */
function Milestones() {
  const uf = D.useOfFunds.filter((u) => u.phase1 > 0);
  const tot = uf.reduce((a, u) => a + u.phase1, 0);
  const pal = ["#3B82F6", "#06B6D4", "#8B5CF6", "#60A5FA", "#64748B", "#94A3B8"];
  return (
    <Frame label="Milestones and use of funds" title="Six months to a clear yes or no" lead={`Phase 1 costs ${lakh(tot)}; the ${lakh(F.C.equity)} round adds a 20% buffer.`} wide>
      <div className="flex h-12 w-full overflow-hidden rounded-xl">
        {uf.map((u, i) => (
          <motion.div key={u.category} initial={{ width: 0 }} animate={{ width: `${(u.phase1 / tot) * 100}%` }} transition={{ delay: 0.2 + i * 0.12, duration: 0.6, ease }} style={{ background: pal[i] }} title={`${u.category}: ${lakh(u.phase1)}`} />
        ))}
      </div>
      <ul className="t-small mt-3 flex flex-wrap gap-x-6 gap-y-1">
        {uf.map((u, i) => <li key={u.category} className="text-mist"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: pal[i] }} />{u.category} <span className="t-num text-white">{lakh(u.phase1)} · {pct(u.phase1 / tot)}</span></li>)}
      </ul>
      <ol className="relative mt-12 grid gap-4 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11">
        {K.milestones.map(([m, t, tag], i) => {
          const last = i === K.milestones.length - 1;
          const c = last ? "#34D399" : i <= 3 ? "#06B6D4" : "#8B5CF6";
          return (
            <motion.li key={m + t} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}>
              <span className="block h-3 w-3 rounded-full" style={{ background: c }} />
              <p className="t-h2 t-num mt-2" style={{ color: last ? c : "#fff" }}>{m}</p>
              <p className="t-small" style={{ color: c }}>{tag}</p>
              <p className="t-small text-mist">{t}</p>
            </motion.li>
          );
        })}
      </ol>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 17 risks & close */
function Close() {
  return (
    <Frame label="Risks and closing vision" title="The one risk that decides everything: does it help real hands?" wide>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="rounded-2xl border border-coral/60 bg-coral/5 p-5">
          <p className="t-small text-coral">Kill or continue at M6 · TremoSense user study, n ≥ 10</p>
          <dl className="t-body mt-3 space-y-2">
            <div><dt className="inline font-semibold text-mint">Continue: </dt><dd className="inline text-white">median tremor reduction ≥50% and ≥60% would pay</dd></div>
            <div><dt className="inline font-semibold text-amber">Pivot: </dt><dd className="inline text-white">benefit holds but the price fails → clinic rental model</dd></div>
            <div><dt className="inline font-semibold text-coral">Stop: </dt><dd className="inline text-white">reduction below 30% → stop TremoSense, focus on ParkinSense</dd></div>
          </dl>
        </div>
        <ul className="space-y-2">
          {K.risks.filter(([k]) => k !== "Clinical").map(([k, r, t]) => <li key={k} className="panel p-3"><p className="t-small"><span className="text-violet">{k}</span> <span className="text-white">· {r}</span></p><p className="t-small text-slate">{t}</p></li>)}
        </ul>
      </div>
      <div className="mt-12 flex flex-col items-start gap-6 md:flex-row md:items-center">
        <img src="/brand/averra-mark-white.svg" alt="" className="h-16 w-16" />
        <div>
          <p className="t-h1">{K.brand.tagline}</p>
          <p className="t-body mt-2 text-mist">Ask: {lakh(F.C.equity)} at a {lakh(D.valuation.proposed, 0)} pre-money ({pct(F.C.investor, 1)}), to reach a clear answer on a product that is profitable on every unit. Break-even in {beLabel.split(" · ")[1]}.</p>
        </div>
      </div>
    </Frame>
  );
}

export const SLIDES: { id: string; title: string; notes: number[]; extraNote?: string; Component: () => React.ReactElement }[] = [
  { id: "opening", title: "AVERRA", notes: [1], Component: Opening },
  { id: "problem", title: "Problem", notes: [2], Component: Problem },
  { id: "why-now", title: "Why now", notes: [], extraNote: "Why-now is spoken at the end of deck slide 2's script.", Component: WhyNow },
  { id: "portfolio", title: "Two-product portfolio", notes: [3], Component: Portfolio },
  { id: "parkinsense", title: "ParkinSense", notes: [4], Component: ParkinSense },
  { id: "tremosense", title: "TremoSense", notes: [5], Component: TremoSense },
  { id: "architecture", title: "Technical architecture", notes: [], extraNote: "Optional deep-dive for the viva; not part of the timed script.", Component: Architecture },
  { id: "competition", title: "Competition", notes: [6], Component: Competition },
  { id: "market", title: "Market opportunity", notes: [8], Component: Market },
  { id: "mvp", title: "MVP and validation", notes: [7], Component: MVP },
  { id: "business-model", title: "Business model", notes: [9], Component: BusinessModel },
  { id: "pricing", title: "Pricing and unit economics", notes: [10], Component: Pricing },
  { id: "financials", title: "Financial outlook", notes: [11], Component: Financials },
  { id: "team", title: "Team and growth", notes: [12], Component: TeamGrowth },
  { id: "funding", title: "Funding ask and valuation", notes: [13], Component: Funding },
  { id: "milestones", title: "Milestones and use of funds", notes: [14], Component: Milestones },
  { id: "close", title: "Risks and closing", notes: [], extraNote: "Closing lines are the end of deck slide 14's script.", Component: Close },
];
