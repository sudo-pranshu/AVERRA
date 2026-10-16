// AVERRA pitch deck generator. Reads ../data/averra-data.json (numbers) and ../data/content.json (claims + script).
// Run from deck/:  node build_deck.js && python add_motion.py AVERRA_Pitch_raw.pptx AVERRA_Pitch.pptx
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const D = JSON.parse(fs.readFileSync("../data/averra-data.json", "utf8"));
const K = JSON.parse(fs.readFileSync("../data/content.json", "utf8"));
const SIG = JSON.parse(fs.readFileSync("../data/signal-illustrative.json", "utf8"));
const IMG = "../public/images/", BR = "../public/brand/";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "AVERRA — Pitch";
pres.author = "Pranshu Kumar";
pres.company = "AVERRA";
pres.theme = { headFontFace: "Calibri", bodyFontFace: "Calibri" };

const C = { bg: "0F172A", card: "16213A", card2: "1B2847", line: "2B3A5C", blue: "3B82F6", cyan: "06B6D4", violet: "8B5CF6",
  white: "FFFFFF", muted: "94A3B8", light: "CBD5E1", amber: "F59E0B", red: "F87171", green: "34D399" };
const B = "Calibri", TOTAL = 14;
const inr = (x) => (x < 0 ? "-₹" : "₹") + Math.abs(Math.round(x)).toLocaleString("en-IN");
const lakh = (x, d = 1) => (x < 0 ? "-₹" : "₹") + (Math.abs(x) / 1e5).toFixed(d) + " L";
const crore = (x, d = 1) => (x < 0 ? "-₹" : "₹") + (Math.abs(x) / 1e7).toFixed(d) + " Cr";
const pct = (x, d = 0) => (x * 100).toFixed(d) + "%";
const SCRIPT = K.script;
const ts = D.tremosense, sA = ts.scenarios.A, sB = ts.scenarios.B, sC = ts.scenarios.C;
const ue = D.unitEconomics, F = D.funding, H = D.headline, V = D.valuation, MK = D.market;
const STATUS_C = { progress: C.amber, impl: C.blue, bench: C.cyan, partial: C.amber, planned: C.muted, depends: C.amber, sim: C.violet, research: C.violet };
const STATUS_S = { progress: "IN PROGRESS", impl: "IMPLEMENTED", bench: "BENCH-TESTED", partial: "IN DEVELOPMENT", planned: "PLANNED", depends: "NEEDS HW/FW", sim: "SIMULATION", research: "RESEARCH" };

function txt(s, text, o) { s.addText(text, Object.assign({ fontFace: B, fontSize: 14, color: C.light, margin: 0, isTextBox: true, valign: "top" }, o)); }
function card(s, x, y, w, h, name, fill = C.card, line = C.line) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.07, fill: { color: fill }, line: { color: line, width: 0.75 }, objectName: name });
}
function chip(s, x, y, label, col, name, w) {
  w = w || 0.16 + label.length * 0.075;
  s.addText(label, { x, y, w, h: 0.22, fontFace: B, fontSize: 8, bold: true, color: col, align: "center", valign: "middle", margin: 0, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.05,
    line: { color: col, width: 0.75 }, fill: { color: C.bg }, isTextBox: true, objectName: name });
  return w;
}
function src(s, text) { txt(s, text, { x: 0.55, y: 6.78, w: 9.6, h: 0.3, fontSize: 8.5, color: C.muted, objectName: "sources" }); }
function base(n, kicker, title) {
  const s = pres.addSlide();
  s.background = { color: C.bg };
  if (kicker) txt(s, kicker, { x: 0.55, y: 0.3, w: 8, h: 0.28, fontSize: 11, bold: true, color: C.cyan, charSpacing: 3, objectName: "!!kicker" });
  if (title) txt(s, title, { x: 0.55, y: 0.58, w: 11.2, h: 0.7, fontSize: 28, bold: true, color: C.white, objectName: "!!title" });
  if (n > 1) s.addImage({ path: BR + "averra-mark-white.png", x: 12.25, y: 0.32, w: 0.55, h: 0.55, objectName: "!!mark" });
  for (let i = 1; i <= TOTAL; i++) {
    const on = i === n;
    s.addShape(pres.shapes.OVAL, { x: 10.6 + (i - 1) * 0.16, y: 7.12, w: on ? 0.11 : 0.06, h: on ? 0.11 : 0.06, fill: { color: on ? C.cyan : C.line }, line: { color: on ? C.cyan : C.line, width: 0 }, objectName: "!!dot" + i });
  }
  if (n > 1) txt(s, "AVERRA", { x: 0.55, y: 7.05, w: 2, h: 0.22, fontSize: 9, bold: true, color: C.muted, charSpacing: 5, objectName: "!!brand" });
  const sc = SCRIPT[n - 1];
  let start = SCRIPT.slice(0, n - 1).reduce((a, x) => a + x.seconds, 0);
  const mmss = (t) => Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
  s.addNotes(`${sc.speaker.toUpperCase()} · [${mmss(start)}–${mmss(start + sc.seconds)} | ${sc.seconds} s] ${sc.title}\n${sc.text}`);
  return s;
}
// product photos that Morph across slides 3–7
function photos(s, ps, tsP) {
  if (ps) s.addImage({ path: IMG + "parkinsense-wrist.jpg", x: ps[0], y: ps[1], w: ps[2], h: ps[2] * 1.093, objectName: "!!ps_photo" });
  if (tsP) s.addImage({ path: IMG + "tremosense-concept.jpg", x: tsP[0], y: tsP[1], w: tsP[2], h: tsP[2] * 1.333, objectName: "!!ts_photo" });
}

// ===================================================================== 1 TITLE
{
  const s = base(1, null, null);
  s.addImage({ path: BR + "averra-mark-white.png", x: 0.7, y: 0.9, w: 1.05, h: 1.05, objectName: "!!mark" });
  s.addImage({ path: BR + "averra-wordmark-white.png", x: 1.95, y: 1.17, w: 3.9, h: 0.5, objectName: "wordmark" });
  txt(s, K.brand.tagline, { x: 0.75, y: 2.25, w: 7, h: 1.4, fontSize: 38, bold: true, color: C.white, objectName: "tagline" });
  txt(s, K.brand.descriptor, { x: 0.75, y: 3.65, w: 7, h: 0.35, fontSize: 15, color: C.cyan, objectName: "descriptor" });
  card(s, 0.75, 4.2, 6.9, 1.95, "pos_card", C.card, C.blue);
  txt(s, "POSITIONING", { x: 1.0, y: 4.33, w: 3, h: 0.22, fontSize: 9.5, bold: true, color: C.blue, charSpacing: 3 });
  txt(s, K.brand.positioning, { x: 1.0, y: 4.6, w: 6.45, h: 1.5, fontSize: 13.5, color: C.white, objectName: "pos_text" });
  photos(s, [8.2, 0.9, 2.3], [10.75, 0.9, 1.88]);
  txt(s, [{ text: "ParkinSense", options: { bold: true, color: C.white, breakLine: true } }, { text: "Measure and understand movement", options: { color: C.cyan, fontSize: 11 } }], { x: 8.2, y: 3.5, w: 2.4, h: 0.6, fontSize: 15, objectName: "!!ps_label" });
  txt(s, [{ text: "TremoSense", options: { bold: true, color: C.white, breakLine: true } }, { text: "Assist people with tremor", options: { color: C.violet, fontSize: 11 } }], { x: 10.75, y: 3.5, w: 2.2, h: 0.6, fontSize: 15, objectName: "!!ts_label" });
  txt(s, [{ text: "Pranshu Kumar · Pawan Shinde", options: { bold: true, color: C.white, breakLine: true } }, { text: "Co-founders · B.Tech EXTC, VJTI Mumbai · SEC-ENT-301", options: { color: C.muted } }], { x: 8.2, y: 4.6, w: 4.6, h: 0.7, fontSize: 12.5, objectName: "founders" });
  txt(s, "ParkinSense: real prototype photo. TremoSense: concept render.", { x: 8.2, y: 5.85, w: 4.6, h: 0.3, fontSize: 9, color: C.muted });
}

// ===================================================================== 2 PROBLEM + WHY NOW
{
  const s = base(2, "01 · PROBLEM & WHY NOW", "Movement is measured for minutes — and lived with all day");
  K.problem.stats.forEach((st, i) => {
    const x = 0.55 + i * 2.6;
    card(s, x, 1.55, 2.45, 1.45, "stat" + i);
    txt(s, st[0], { x: x + 0.2, y: 1.68, w: 2.1, h: 0.6, fontSize: 28, bold: true, color: i === 2 ? C.white : C.cyan, objectName: "stat_v" + i });
    txt(s, st[1], { x: x + 0.2, y: 2.3, w: 2.1, h: 0.65, fontSize: 11.5, color: C.light, objectName: "stat_l" + i });
  });
  txt(s, "WHAT THE RESEARCH SAYS", { x: 0.55, y: 3.25, w: 6, h: 0.25, fontSize: 10, bold: true, color: C.amber, charSpacing: 2 });
  K.problem.quotes.forEach((q, i) => {
    const y = 3.6 + i * 0.95;
    card(s, 0.55, y, 7.75, 0.82, "quote" + i, C.card2);
    txt(s, [{ text: q[0] + "  ", options: { bold: true, color: C.cyan, italic: false } }, { text: "“" + q[1] + "”", options: { italic: true, color: C.white } }], { x: 0.72, y: y + 0.05, w: 7.45, h: 0.52, fontSize: 10.5, valign: "top" });
    txt(s, q[2], { x: 0.72, y: y + 0.55, w: 7.45, h: 0.24, fontSize: 8, color: C.muted });
  });
  txt(s, K.problem.quotesNote, { x: 0.55, y: 6.45, w: 7.7, h: 0.28, fontSize: 9.5, color: C.amber });
  // why-now vertical timeline
  txt(s, "WHY NOW", { x: 8.75, y: 1.55, w: 3, h: 0.25, fontSize: 10, bold: true, color: C.cyan, charSpacing: 3 });
  s.addShape(pres.shapes.LINE, { x: 8.86, y: 2.0, w: 0, h: 4.4, line: { color: C.line, width: 1.5 }, objectName: "wn_line" });
  K.whyNow.forEach((w, i) => {
    const y = 1.95 + i * 0.9;
    s.addShape(pres.shapes.OVAL, { x: 8.76, y: y + 0.07, w: 0.2, h: 0.2, fill: { color: i % 2 ? C.violet : C.cyan }, line: { color: C.bg, width: 1.5 }, objectName: "wn_dot" + i });
    txt(s, [{ text: w[0], options: { bold: true, color: C.white, breakLine: true } }, { text: w[1], options: { color: C.light, fontSize: 11 } }], { x: 9.15, y, w: 3.65, h: 0.82, fontSize: 13, objectName: "wn_t" + i });
  });
  src(s, "Sources: UNFPA 2023; Khurana & Gourie-Devi, Cureus 2025; Chin et al. 2021; Engadget 2018; 9to5Mac 2022; Digital Health News; BMJ 2025. Full links in the companion guide.");
}

// ===================================================================== 3 PORTFOLIO / POSITIONING
{
  const s = base(3, "02 · ONE COMPANY, TWO PRODUCTS", "Shared engineering, different customers");
  card(s, 0.55, 1.55, 4.6, 4.95, "ps_card", C.card, C.cyan);
  photos(s, [0.85, 1.8, 1.55], null);
  txt(s, [{ text: "ParkinSense", options: { bold: true, color: C.white, fontSize: 20, breakLine: true } }, { text: "MEASURE & UNDERSTAND", options: { bold: true, color: C.cyan, fontSize: 10.5, charSpacing: 2 } }], { x: 2.55, y: 1.85, w: 2.5, h: 0.8, objectName: "!!ps_label" });
  txt(s, [{ text: "Who: ", options: { bold: true, color: C.white } }, { text: "anyone wanting activity, vitals and movement insight, from fitness users to people with movement disorders", options: { breakLine: true } },
    { text: "Buys it: ", options: { bold: true, color: C.white } }, { text: "the user, online", options: { breakLine: true } },
    { text: "Value: ", options: { bold: true, color: C.white } }, { text: "activity and vitals, with tremor detection as its standout feature", options: {} }], { x: 0.85, y: 3.65, w: 4.1, h: 2.6, fontSize: 13, paraSpaceAfter: 6, objectName: "ps_body" });
  card(s, 8.18, 1.55, 4.6, 4.95, "ts_card", C.card, C.violet);
  photos(s, null, [8.48, 1.8, 1.25]);
  txt(s, [{ text: "TremoSense", options: { bold: true, color: C.white, fontSize: 20, breakLine: true } }, { text: "ASSIST", options: { bold: true, color: C.violet, fontSize: 10.5, charSpacing: 2 } }], { x: 9.95, y: 1.85, w: 2.7, h: 0.8, objectName: "!!ts_label" });
  txt(s, [{ text: "Who: ", options: { bold: true, color: C.white } }, { text: "people whose tremor disrupts eating, and their families", options: { breakLine: true } },
    { text: "Buys it: ", options: { bold: true, color: C.white } }, { text: "family, via clinic or OT referral", options: { breakLine: true } },
    { text: "Value: ", options: { bold: true, color: C.white } }, { text: "eat more independently, at an Indian price", options: {} }], { x: 8.48, y: 3.65, w: 4.1, h: 2.6, fontSize: 13, paraSpaceAfter: 6, objectName: "ts_body" });
  // shared core
  s.addImage({ path: BR + "averra-mark-white.png", x: 6.17, y: 1.75, w: 1.0, h: 1.0, objectName: "core_mark" });
  txt(s, "SHARED", { x: 5.4, y: 2.9, w: 2.55, h: 0.25, fontSize: 10, bold: true, color: C.blue, align: "center", charSpacing: 3 });
  ["Nordic nRF52840 MCU family", "LSM6DS3 6-axis IMU", "Real-time signal processing", "Embedded firmware", "The same founding team"].forEach((t, i) => {
    s.addText(t, { x: 5.4, y: 3.25 + i * 0.5, w: 2.55, h: 0.4, fontFace: B, fontSize: 11.5, color: C.white, align: "center", valign: "middle", margin: 0, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, fill: { color: C.card2 }, line: { color: C.blue, width: 0.75 }, isTextBox: true, objectName: "core" + i });
  });
  txt(s, "No shared revenue or cost savings claimed.", { x: 5.35, y: 5.8, w: 2.65, h: 0.5, fontSize: 10, color: C.muted, align: "center", objectName: "core_note" });
  src(s, "ParkinSense: real prototype photo. TremoSense: concept render of the current build.");
}

// ===================================================================== 4 PARKINSENSE
{
  const s = base(4, "03 · PARKINSENSE", "A wearable for everyone, with tremor detection built in");
  photos(s, [0.55, 1.5, 1.6], null);
  txt(s, [{ text: "ParkinSense", options: { bold: true, color: C.white, fontSize: 17, breakLine: true } }, { text: "MEASURE", options: { bold: true, color: C.cyan, fontSize: 10, charSpacing: 2 } }], { x: 2.3, y: 1.55, w: 1.9, h: 0.7, objectName: "!!ps_label" });
  K.parkinsense.architecture.forEach((t, i) => {
    s.addText(t, { x: 0.55, y: 3.38 + i * 0.52, w: 3.75, h: 0.44, fontFace: B, fontSize: 10.5, color: C.white, valign: "middle", margin: [8, 6, 0, 0], shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.05,
      fill: { color: i === 3 ? "0E3A4A" : C.card }, line: { color: i === 3 ? C.cyan : C.line, width: 0.75 }, isTextBox: true, objectName: "ps_arch" + i });
  });
  // signal -> spectrum (illustrative)
  card(s, 4.5, 1.5, 2.9, 4.48, "sig_card", C.card2);
  txt(s, "MOVEMENT SIGNAL", { x: 4.65, y: 1.6, w: 2.6, h: 0.22, fontSize: 9, bold: true, color: C.muted, charSpacing: 2 });
  s.addChart(pres.charts.LINE, [{ name: "signal", labels: SIG.t.map(String), values: SIG.x }], { x: 4.55, y: 1.85, w: 2.8, h: 1.6, chartColors: [C.cyan], lineSize: 1.25, lineDataSymbol: "none",
    showLegend: false, catAxisHidden: true, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, objectName: "sig_chart" });
  txt(s, "↓ FFT", { x: 4.65, y: 3.47, w: 2.6, h: 0.25, fontSize: 10, bold: true, color: C.blue, align: "center", objectName: "sig_fft" });
  s.addChart(pres.charts.BAR, [{ name: "spectrum", labels: SIG.f.map(String), values: SIG.p }], { x: 4.55, y: 3.72, w: 2.8, h: 1.55, barDir: "col", barGapWidthPct: 30, chartColors: [C.violet],
    showLegend: false, catAxisHidden: true, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, objectName: "spec_chart" });
  txt(s, [{ text: "voluntary <2 Hz  ", options: { color: C.light } }, { text: "tremor peak ≈5 Hz", options: { color: C.violet, bold: true } }], { x: 4.65, y: 5.3, w: 2.65, h: 0.25, fontSize: 9.5, objectName: "spec_lbl" });
  txt(s, "Synthetic signal, for illustration", { x: 4.65, y: 5.6, w: 2.65, h: 0.22, fontSize: 8.5, color: C.muted });
  // feature status
  txt(s, "FEATURE STATUS (repository = source of truth)", { x: 7.6, y: 1.5, w: 5.2, h: 0.25, fontSize: 9.5, bold: true, color: C.muted, charSpacing: 1 });
  const pick = [0, 1, 2, 4, 5, 7, 8, 9, 10, 13];
  pick.forEach((k, i) => {
    const f = K.parkinsense.features[k], y = 1.82 + i * 0.42;
    card(s, 7.6, y, 5.2, 0.37, "feat" + i, C.card, k === 7 ? C.amber : C.line);
    txt(s, f[0], { x: 7.72, y: y + 0.07, w: 3.55, h: 0.26, fontSize: 10.5, color: C.white });
    chip(s, 11.33, y + 0.075, STATUS_S[f[1]], STATUS_C[f[1]], "feat_chip" + i, 1.38);
  });
  // research path
  card(s, 0.55, 6.08, 12.25, 0.6, "research", "201A3D", C.violet);
  txt(s, [{ text: "Research path, not a claim: ", options: { bold: true, color: C.violet } }, { text: K.parkinsense.researchPath.join("  →  "), options: { color: C.light } }], { x: 0.75, y: 6.15, w: 11.9, h: 0.48, fontSize: 10.5, valign: "middle", objectName: "research_t" });
  src(s, "ParkinSense does not diagnose, predict or clinically detect Parkinson's disease. Status from the ParkinSense repository (develop) and paper.");
}

// ===================================================================== 5 TREMOSENSE
{
  const s = base(5, "04 · TREMOSENSE", "TremoSense: ≈90% on the bench, first two users");
  photos(s, null, [0.55, 1.5, 1.4]);
  txt(s, [{ text: "TremoSense", options: { bold: true, color: C.white, fontSize: 17, breakLine: true } }, { text: "ASSIST", options: { bold: true, color: C.violet, fontSize: 10, charSpacing: 2 } }], { x: 2.1, y: 1.55, w: 2.1, h: 0.7, objectName: "!!ts_label" });
  K.tremosense.architecture.forEach((t, i) => {
    s.addText(t, { x: 0.55, y: 3.5 + i * 0.52, w: 3.75, h: 0.44, fontFace: B, fontSize: 10.5, color: C.white, valign: "middle", margin: [8, 6, 0, 0], shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.05,
      fill: { color: i === 1 || i === 2 ? "2A2350" : C.card }, line: { color: i === 1 || i === 2 ? C.violet : C.line, width: 0.75 }, isTextBox: true, objectName: "ts_arch" + i });
  });
  K.tremosense.results.forEach((r, i) => {
    const y = 1.5 + i * 1.5;
    card(s, 4.5, y, 2.9, 1.35, "res" + i, C.card2);
    txt(s, r[0], { x: 4.65, y: y + 0.08, w: 2.6, h: 0.55, fontSize: 26, bold: true, color: i === 2 ? C.amber : C.violet, objectName: "res_v" + i });
    txt(s, r[1], { x: 4.65, y: y + 0.65, w: 2.65, h: 0.65, fontSize: 9.5, color: C.light });
  });
  txt(s, "CURRENT BUILD vs PAPER PROTOTYPE", { x: 7.6, y: 1.5, w: 5.2, h: 0.25, fontSize: 9.5, bold: true, color: C.amber, charSpacing: 2 });
  const rows = [[{ text: "", options: {} }, { text: "Current build", options: { bold: true, color: C.white } }, { text: "Paper prototype", options: { bold: true, color: C.white } }]];
  K.tremosense.repoVsPaper.forEach((r) => rows.push(r.map((c, j) => ({ text: c, options: { color: j === 0 ? C.muted : C.light, bold: j === 0 } }))));
  s.addTable(rows, { x: 7.6, y: 1.82, w: 5.2, colW: [1.25, 2.0, 1.95], fontFace: B, fontSize: 9, fill: { color: C.bg }, border: { type: "solid", pt: 0.5, color: C.line }, rowH: 0.5, valign: "middle", margin: 0.04, objectName: "audit_table" });
  card(s, 0.55, 6.15, 6.85, 0.52, "ts_next", "2A1620", C.red);
  txt(s, "Next: publish the current build's bench logs (M3), then the user study with people (M6).", { x: 0.72, y: 6.22, w: 6.6, h: 0.4, fontSize: 11.5, color: C.white, valign: "middle", objectName: "ts_next_t" });
  src(s, "Current build: founder-reported bench result, logs to be published; firmware in tremosense-app/src. Paper prototype: TremoSense paper Table IV.");
}

// ===================================================================== 6 COMPETITION
{
  const s = base(6, "05 · COMPETITION", "Where we can compete — and what we still have to prove");
  const mkTable = (cmp, x, w, accent, name) => {
    const head = cmp.columns.map((c, j) => ({ text: c, options: { bold: true, color: j === 4 ? accent : C.white, fill: { color: j === 4 ? (accent === C.cyan ? "0E3A4A" : "2A2350") : C.card2 } } }));
    const body = cmp.rows.map((r) => r.map((c, j) => ({ text: c, options: { color: j === 0 ? C.muted : j === 4 ? C.white : C.light, bold: j === 0 || j === 4, fill: { color: j === 4 ? (accent === C.cyan ? "0B2A36" : "1E1A3A") : C.bg } } })));
    s.addTable([head, ...body], { x, y: 1.85, w, colW: [0.9, ...Array(head.length - 2).fill((w - 0.9 - 1.45) / (head.length - 2)), 1.45], fontFace: B, fontSize: head.length > 5 ? 8 : 9, border: { type: "solid", pt: 0.5, color: C.line }, valign: "middle", margin: 0.04, rowH: 0.5, objectName: name });
  };
  photos(s, [0.55, 1.45, 0.3], [6.8, 1.45, 0.25]);
  txt(s, "ParkinSense vs wellness wearables", { x: 0.95, y: 1.47, w: 5, h: 0.3, fontSize: 13, bold: true, color: C.cyan });
  txt(s, "TremoSense vs tremor aids", { x: 7.15, y: 1.47, w: 5, h: 0.3, fontSize: 13, bold: true, color: C.violet });
  mkTable(K.competitors.parkinsense, 0.55, 6.0, C.cyan, "comp_ps");
  mkTable(K.competitors.tremosense, 6.8, 6.0, C.violet, "comp_ts");
  const pos = [[K.competitors.parkinsense.positioning, 0.55, C.cyan], [K.competitors.tremosense.positioning, 6.8, C.violet]];
  pos.forEach(([p, x, col], k) => {
    card(s, x, 4.95, 6.0, 1.72, "pos" + k, C.card);
    txt(s, p.map((r, i) => [{ text: r[0] + ": ", options: { bold: true, color: col } }, { text: r[1], options: { color: C.light, breakLine: i < p.length - 1 } }]).flat(), { x: x + 0.15, y: 5.03, w: 5.7, h: 1.6, fontSize: 10, paraSpaceAfter: 2, objectName: "pos_t" + k });
  });
  src(s, "Prices checked 12 Oct 2026 (whoop.in, 91mobiles, smartprix, Parkinson's UK, MJFF 2015, WellBefore). Benchmarks only — links in the guide.");
}

// ===================================================================== 7 MVP & VALIDATION
{
  const s = base(7, "06 · MVP & VALIDATION", "Bench-proven, clinical evaluation under way");
  const cols = ["Experiment run", "Result so far", "Pre-registered next metric", "Decision"];
  cols.forEach((c, j) => txt(s, c.toUpperCase(), { x: 1.85 + j * 2.75, y: 1.5, w: 2.6, h: 0.25, fontSize: 9.5, bold: true, color: C.muted, charSpacing: 1 }));
  const rows = [
    ["ts", [1.0, 0.3], C.violet, ["Motorised tremor simulator, 4/6/8 Hz, ±5°; 2 people with tremor tried it", "≈90% tremor rejection on the current build (founder-reported)", "Self-feeding task, n ≥ 10: median tremor reduction ≥50% and ≥60% would pay (M6)", "PERSEVERE — validate on people before any claim"]],
    ["ps", [1.0, 0.3], C.cyan, ["Bench: rest, 5 Hz fixture, walking, arm motion; BLE soak; PPK II power. Clinical evaluation with ICMR in progress", "8/8 bench conditions correct; ≈7 mA. ICMR results pending (founder-reported)", "Dominant-frequency error ≤5% vs reference; 0 false steps in tremor (M10); add ICMR results when published", "PERSEVERE — wellness launch; no clinical claim until results"]],
  ];
  rows.forEach(([k, _, col, cells], i) => {
    const y = 1.85 + i * 2.15;
    if (k === "ts") photos(s, null, [0.55, y + 0.1, 1.0]); else photos(s, [0.55, y + 0.1, 1.15], null);
    cells.forEach((c, j) => {
      card(s, 1.85 + j * 2.75, y, 2.6, 1.95, `mvp_${k}${j}`, j === 3 ? "102A22" : C.card, j === 3 ? C.green : (j === 2 ? C.amber : C.line));
      txt(s, c, { x: 1.98 + j * 2.75, y: y + 0.15, w: 2.35, h: 1.7, fontSize: 12, color: j === 3 ? C.green : C.white, bold: j === 3 });
    });
  });
  txt(s, "No metric was pre-registered before the bench tests. These are the first pre-registered tests.", { x: 0.55, y: 6.25, w: 11, h: 0.3, fontSize: 11, color: C.amber, objectName: "mvp_note" });
  src(s, "TremoSense paper Table IV; ParkinSense paper Tables IV–VIII.");
}

// ===================================================================== 8 MARKET
{
  const T = MK.totals;
  const s = base(8, "07 · MARKET (BOTTOM-UP, INDIA)", `${crore(T.tam, 1)} TAM → ${crore(T.sam, 1)} SAM → ${lakh(T.som, 1)} Year-3 SOM`);
  [["TAM", crore(T.tam, 1), "Patients × annual revenue per customer", 6.0, C.blue], ["SAM", crore(T.sam, 1), "Urban × under neurologist follow-up", 4.6, C.cyan], ["SOM · Yr 3", lakh(T.som, 1), "30 clinics (Mumbai + Pune) + online", 3.2, C.violet]].forEach((f, i) => {
    const y = 1.55 + i * 1.6, w = f[3], x = 0.45 + (6.0 - w) / 2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 1.35, rectRadius: 0.08, fill: { color: f[4], transparency: 80 }, line: { color: f[4], width: 1.25 }, objectName: "fun" + i });
    txt(s, f[0], { x: x + 0.2, y: y + 0.12, w: 2, h: 0.25, fontSize: 10.5, bold: true, color: f[4], charSpacing: 2 });
    txt(s, f[1], { x: x + 0.2, y: y + 0.4, w: w - 0.4, h: 0.55, fontSize: 28, bold: true, color: C.white });
    txt(s, f[2], { x: x + 0.2, y: y + 0.95, w: w - 0.3, h: 0.3, fontSize: 10, color: C.light });
  });
  const P = MK.parkinsense, Tt = MK.tremosense;
  const G = MK.general;
  const rows = [["", "ParkinSense (PD households)", "TremoSense", "ParkinSense general wearable (upside)"],
    ["TAM customers", P.customers.toLocaleString("en-IN"), Tt.customers.toLocaleString("en-IN"), (G.customers / 1e6).toFixed(1) + "M / yr"],
    ["₹ / customer / year", inr(P.revPerCustomer), inr(Tt.revPerCustomer), inr(G.revPerCustomer)],
    ["TAM", crore(P.tam), crore(Tt.tam), "₹" + Math.round(G.tam / 1e7).toLocaleString("en-IN") + " Cr"], ["SAM", crore(P.sam), crore(Tt.sam), crore(G.sam)],
    ["SOM customers / yr", P.somCustomers.toLocaleString("en-IN"), Tt.somCustomers.toLocaleString("en-IN"), G.somRange.map((r) => r.customers.toLocaleString("en-IN")).join(" / ")], ["SOM", lakh(P.som), lakh(Tt.som), G.somRange.map((r) => (r.som >= 1e7 ? crore(r.som) : lakh(r.som))).join(" / ")]];
  s.addTable(rows.map((r, i) => r.map((c, j) => ({ text: c, options: { bold: i === 0 || j === 0, color: i === 0 ? (j === 1 ? C.cyan : j === 2 ? C.violet : j === 3 ? C.green : C.white) : j === 0 ? C.muted : C.white, fill: { color: i === 0 ? C.card2 : C.bg } } }))),
    { x: 6.9, y: 1.55, w: 5.9, colW: [1.45, 1.55, 1.3, 1.6], fontFace: B, fontSize: 10, border: { type: "solid", pt: 0.5, color: C.line }, rowH: 0.48, valign: "middle", margin: 0.05, objectName: "mk_table" });
  txt(s, [{ text: "How ₹ per customer is set: ", options: { bold: true, color: C.white } }, { text: `TremoSense ${inr(ts.launchPrice)} ÷ 1.05 GST = ₹9,523 ÷ 3-year life = ${inr(Tt.revPerCustomer)}/yr. ParkinSense ${inr(D.assumptions.P3)} ÷ 1.18 GST ÷ 3 years + 40% × ₹169 plan × 12 = ${inr(P.revPerCustomer)}/yr.`, options: { color: C.light, breakLine: true } },
    { text: "Customers: ", options: { bold: true, color: C.white } }, { text: `TS = (PD ${P.customers.toLocaleString("en-IN")} + ET ${MK.et.toLocaleString("en-IN")}) × 50% eating-disruptive. SAM = × 31.1% urban × 40% under care. SOM = 30 clinics × (4 TS / 2 PS) per month + online, × 12.`, options: { color: C.light, breakLine: true } },
    { text: "Upside column: ", options: { bold: true, color: C.green } }, { text: "IDC 2024: 3.5 Cr smartwatches × 2.8% premium; SOM 0.25% of SAM (plan), 0.5% and 1% upside. Not in plan totals.", options: { color: C.light } }],
    { x: 6.9, y: 4.95, w: 5.9, h: 1.3, fontSize: 9, objectName: "mk_note" });
  src(s, "UNFPA 2023 (149M aged 60+); PD 308.9/lakh aged 60+ (Je et al., via Cureus 2025); ET 89.96/lakh (Chin et al. 2021); Census 2011 (31.1% urban). Workings: model › Market.");
}

// ===================================================================== 9 BUSINESS MODEL
{
  const s = base(9, "08 · BUSINESS MODEL", "Clinics bring patients; families buy; labs fund early data");
  const boxes = [["Key partners", "Neurology clinics · OT centres · university labs · test lab · contract assembler", 0.55, 1.5, 2.35, 2.5],
    ["Key activities", "User studies · CDSCO + ISO 13485 · firmware & DSP · small-batch assembly", 3.0, 1.5, 2.35, 1.2],
    ["Key resources", "Sensing + control IP · bench evidence · two papers · prototypes", 3.0, 2.8, 2.35, 1.2],
    ["Value propositions", "ParkinSense: a wearable for everyone with built-in tremor detection\nTremoSense: active tremor assistance at an Indian price", 5.45, 1.5, 2.45, 2.5],
    ["Relationships", "Clinic-assisted trial · caregiver onboarding", 8.0, 1.5, 2.35, 1.2],
    ["Channels", "Clinic / OT referral · direct online · institutional procurement", 8.0, 2.8, 2.35, 1.2],
    ["Customer segments", "Everyday wearable users · households with PD / ET · research labs", 10.45, 1.5, 2.35, 2.5],
    ["Cost structure", "Phase 1: team, study units, user study, IP · Phase 2: QMS, EMC, inventory, outreach", 0.55, 4.1, 6.0, 1.15]];
  boxes.forEach((b, i) => {
    card(s, b[2], b[3], b[4], b[5], "bmc" + i, C.card, i === 3 ? C.cyan : C.line);
    txt(s, b[0].toUpperCase(), { x: b[2] + 0.14, y: b[3] + 0.1, w: b[4] - 0.25, h: 0.22, fontSize: 9, bold: true, color: i === 3 ? C.cyan : C.muted, charSpacing: 1 });
    txt(s, b[1], { x: b[2] + 0.14, y: b[3] + 0.36, w: b[4] - 0.25, h: b[5] - 0.42, fontSize: 11, color: C.white });
  });
  card(s, 6.65, 4.1, 6.15, 2.45, "rev", C.card2, C.violet);
  txt(s, "REVENUE STREAMS · IN LAUNCH ORDER", { x: 6.85, y: 4.2, w: 5.8, h: 0.22, fontSize: 9, bold: true, color: C.violet, charSpacing: 1 });
  const RU = ue.ruoKit;
  [["1", "Research-use kits for labs", `${inr(RU.price)} per kit · from M10 · no medical claim`, C.cyan],
   ["2", "TremoSense sale or rental", `${inr(ts.launchPrice)} planned · rental ${inr(D.assumptions.P11)}/mo · from M12`, C.violet],
   ["3", "ParkinSense device + optional subscription", `${inr(D.assumptions.P3)} + optional ${inr(D.assumptions.P4)}/mo · from M25`, C.blue]].forEach((r, i) => {
    const y = 4.55 + i * 0.62;
    s.addShape(pres.shapes.OVAL, { x: 6.9, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: r[3] }, line: { color: r[3], width: 0 }, objectName: "rev_n" + i });
    txt(s, r[0], { x: 6.9, y: y + 0.09, w: 0.36, h: 0.3, fontSize: 12, bold: true, color: C.bg, align: "center" });
    txt(s, [{ text: r[1], options: { bold: true, color: C.white, breakLine: true } }, { text: r[2], options: { color: C.light, fontSize: 10 } }], { x: 7.4, y: y - 0.02, w: 5.3, h: 0.55, fontSize: 12, objectName: "rev_t" + i });
  });
  txt(s, "No reimbursement assumed — out-of-pocket or institutional only.", { x: 0.55, y: 5.4, w: 6.0, h: 0.3, fontSize: 11, color: C.amber, objectName: "reimb" });
  src(s, "CAC = outreach ÷ customers · LTV = contribution × purchases · payback = CAC ÷ contribution per sale. Prices are planned and will be tested with customers. Model › Unit Economics.");
}

// ===================================================================== 10 PRICING & UNIT ECONOMICS
{
  const s = base(10, "09 · PRICING & UNIT ECONOMICS", `${inr(ts.launchPrice)} keeps a ${pct(sB.contributionMargin)} contribution margin at small-batch cost`);
  const groups = [["Electronics (MCU, servos, power)", [0, 1, 2]], ["PCB / interconnect", [3]], ["Enclosure & spoon", [4]], ["Assembly & QC", [5, 6]], ["Packaging", [7]]];
  const colsG = [C.blue, C.cyan, C.violet, "64748B", C.light];
  const data = groups.map((g, gi) => ({ name: g[0], labels: ["A · prototype", "B · small batch", "C · scaled (target)"], values: ["A", "B", "C"].map((k) => g[1].reduce((a, li) => a + ts.scenarios[k].lines[li].cost, 0)) }));
  s.addChart(pres.charts.BAR, data, { x: 0.45, y: 1.45, w: 5.6, h: 3.6, barDir: "col", barGrouping: "stacked", chartColors: colsG, showLegend: true, legendPos: "b", legendFontSize: 9, legendColor: C.light, legendFontFace: "+mn-lt",
    catAxisLabelColor: C.light, catAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", valAxisLabelColor: C.muted, valAxisLabelFontSize: 9, valAxisLabelFontFace: "+mn-lt", valGridLine: { color: "2B3A5C", size: 0.5 }, catGridLine: { style: "none" },
    showTitle: true, title: "TremoSense unit cost by scenario (₹)", titleColor: C.light, titleFontSize: 11, titleFontFace: "+mn-lt", objectName: "cost_chart" });
  txt(s, [{ text: `A ${inr(sA.cogs)} · B ${inr(sB.cogs)} · C ${inr(sC.cogs)}`, options: { bold: true, color: C.white, breakLine: true } },
    { text: `Prototype parts today ≈ ${inr(ts.prototypePartsCost)}. ₹2,000 = volume electronics TARGET (C: ${inr(sC.electronics)}), needs quotes.`, options: { color: C.amber } }], { x: 0.55, y: 5.1, w: 5.5, h: 0.75, fontSize: 10.5, objectName: "cost_note" });
  // price matrix
  const rows = [[{ text: "Price", options: { bold: true, color: C.white } }, { text: "B contribution", options: { bold: true, color: C.white } }, { text: "C contribution", options: { bold: true, color: C.white } }]];
  ts.priceMatrix.filter((r) => [5999, 6999, 7999, 8999, 9999].includes(r.price)).forEach((r) => {
    const hi = r.price === ts.launchPrice, hc = r.price === ts.postCostPrice;
    rows.push([{ text: inr(r.price) + (hi ? "  launch (B)" : hc ? "  from M19 (C)" : ""), options: { bold: hi || hc, color: hi ? C.cyan : hc ? C.violet : C.white } }, { text: `${inr(r.B)} (${pct(r.Bm)})`, options: { color: r.B < 500 ? C.red : C.light } }, { text: `${inr(r.C)} (${pct(r.Cm)})`, options: { color: C.light } }]);
  });
  s.addTable(rows, { x: 6.35, y: 1.5, w: 3.6, colW: [1.35, 1.15, 1.1], fontFace: B, fontSize: 10, fill: { color: C.bg }, border: { type: "solid", pt: 0.5, color: C.line }, rowH: 0.42, valign: "middle", margin: 0.04, objectName: "price_table" });
  txt(s, `Gross margin ${pct(sB.grossMargin)} · contribution ${pct(sB.contributionMargin)} at B. Below ${inr(ts.launchPrice)} needs verified C cost.`, { x: 6.35, y: 4.12, w: 3.6, h: 0.6, fontSize: 10, color: C.light, objectName: "gm_note" });
  // CAC/LTV
  const tl = ue.tremosenseLtv, pl = ue.parkinsenseLtv;
  const r2 = [["", "TremoSense", "ParkinSense"], ["CAC", inr(tl.cac), inr(pl.cac)], ["LTV", inr(tl.ltv), inr(pl.ltv)], ["LTV : CAC", tl.ltvCac.toFixed(1) + "×", pl.ltvCac.toFixed(1) + "×"], ["Payback", "first sale", pl.paybackMonths > 0 ? pl.paybackMonths.toFixed(1) + " mo" : "first sale"]];
  s.addTable(r2.map((r, i) => r.map((c, j) => ({ text: c, options: { bold: i === 0 || j === 0, color: i === 0 ? (j === 1 ? C.violet : j === 2 ? C.cyan : C.white) : j === 0 ? C.muted : C.white, fill: { color: i === 0 ? C.card2 : C.bg } } }))),
    { x: 10.2, y: 1.5, w: 2.6, colW: [0.85, 0.9, 0.85], fontFace: B, fontSize: 10, border: { type: "solid", pt: 0.5, color: C.line }, rowH: 0.42, valign: "middle", margin: 0.04, objectName: "ltv_table" });
  txt(s, "All estimates — no customers yet. ParkinSense launches at M25, after the wellness beta.", { x: 10.2, y: 3.75, w: 2.6, h: 1.0, fontSize: 9.5, color: C.muted, objectName: "ltv_note" });
  card(s, 6.35, 4.85, 6.45, 1.15, "channels", C.card);
  txt(s, [{ text: "Channels at launch price (none validated): ", options: { bold: true, color: C.white } }, { text: ts.channels.map((c) => `${c.channel} ${inr(c.contribution)}`).join(" · ") + ` · rental ${inr(ts.rental.netPerMonth)}/mo, device recovered in ${ts.rental.paybackMonths} mo`, options: { color: C.light } }],
    { x: 6.5, y: 4.93, w: 6.2, h: 1.0, fontSize: 10, objectName: "channels_t" });
  src(s, "GST 5% device / 18% wearable & software (verify HSN). Clinic margin 15%. Warranty 5% (8% in A). Model › TremoSense Costs, Price Matrix, Unit Economics.");
}

// ===================================================================== 11 FORECAST
{
  const s = base(11, "10 · FINANCIAL FORECAST", `Profitable from ${H.breakEvenMonth.split("\n")[1].replace("-", " 20")} — break-even in month ${H.breakEvenMonth.split("\n")[0].slice(1)}`);
  const fc = D.forecast;
  const labels = fc.months.map((m, i) => "M" + (i + 1));
  s.addChart([
    { type: pres.charts.BAR, data: [{ name: "Cash costs (₹ L)", labels, values: fc.costs.map((v) => +(v / 1e5).toFixed(2)) }, { name: "Cash in (₹ L)", labels, values: fc.cashIn.map((v) => +(v / 1e5).toFixed(2)) }], options: { barGapWidthPct: 30, chartColors: [C.violet, C.cyan] } },
    { type: pres.charts.LINE, data: [{ name: "Monthly operating profit (₹ L)", labels, values: fc.net.map((v) => +(v / 1e5).toFixed(2)) }], options: { chartColors: [C.white], lineSize: 2, lineDataSymbol: "none" } },
  ], { x: 0.45, y: 1.45, w: 8.2, h: 5.05, showLegend: true, legendPos: "b", legendFontSize: 9.5, legendColor: C.light, legendFontFace: "+mn-lt",
    catAxisLabelColor: C.muted, valAxisLabelColor: C.muted, catAxisLabelFontSize: 8, catAxisLabelFrequency: 3, valAxisLabelFontSize: 9, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", valGridLine: { color: "2B3A5C", size: 0.5 }, catGridLine: { style: "none" },
    showTitle: true, title: "36 months from July 2027: cash costs, cash in and monthly operating profit (₹ lakh)", titleColor: C.light, titleFontSize: 11, titleFontFace: "+mn-lt", objectName: "fc_chart" });
  const Y = fc.years;
  [["Year 1: costs · burn", `${lakh(H.costs12)} · ${lakh(H.grossBurn12, 2)}/mo`, C.white], ["Year 2: cash in · result", `${lakh(Y.cashIn.y2)} · ${lakh(Y.net.y2)}`, C.white],
   ["Sustained break-even", H.breakEvenMonth.replace("\n", " · "), C.green], ["Year 3: cash in", crore(Y.cashIn.y3, 2), C.cyan], ["Year 3: operating profit", `${lakh(H.y3Profit)} (${pct(H.y3Margin, 1)})`, C.green],
   ["Zero-cash date (this round)", "January 2028", C.red]].forEach((k, i) => {
    const y = 1.45 + i * 0.84;
    card(s, 8.95, y, 3.85, 0.74, "kpi" + i);
    txt(s, k[0], { x: 9.12, y: y + 0.1, w: 1.6, h: 0.55, fontSize: 10.5, color: C.muted, valign: "middle" });
    txt(s, k[1], { x: 10.6, y: y + 0.1, w: 2.1, h: 0.55, fontSize: 14.5, bold: true, color: k[2], align: "right", valign: "middle", objectName: "kpi_v" + i });
  });
  src(s, `Cash basis. TremoSense ${Y.tsUnits.y2} units (Y2), ${Y.tsUnits.y3} (Y3, SOM ${MK.tremosense.somCustomers}/yr); ParkinSense ${Y.psUnits.y3} (Y3). Requirement = peak gap × 1.2.`);
}

// ===================================================================== 12 TEAM + GROWTH
{
  const s = base(12, "11 · TEAM & GROWTH", "A builder team, growing through clinics");
  [[0.55, "Pranshu Kumar", "Co-founder · hardware & test", "Wearable electronics & firmware", "Built ParkinSense · co-built TremoSense", C.cyan],
   [3.6, "Pawan Shinde", "Co-founder · hardware & test", "Control, gimbal & power", "Co-built TremoSense (EKF + LQR platform)", C.violet]].forEach((f, i) => {
    card(s, f[0], 1.5, 2.9, 2.55, "founder" + i, C.card2, f[5]);
    txt(s, [{ text: f[1], options: { bold: true, color: C.white, fontSize: 16, breakLine: true } }, { text: f[2], options: { bold: true, color: f[5], fontSize: 11, breakLine: true } }, { text: f[3], options: { color: C.light, fontSize: 11 } }], { x: f[0] + 0.18, y: 1.62, w: 2.6, h: 1.1 });
    txt(s, f[4], { x: f[0] + 0.18, y: 2.85, w: 2.6, h: 1.1, fontSize: 9.5, color: C.muted });
  });
  s.addShape(pres.shapes.LINE, { x: 3.27, y: 4.05, w: 0, h: 0.35, line: { color: C.line, width: 1.25 }, objectName: "org_l" });
  card(s, 1.9, 4.4, 2.75, 0.75, "hire", C.card);
  txt(s, [{ text: "Next hires", options: { bold: true, color: C.white, breakLine: true } }, { text: "Sales lead + support (M19) · app engineer (M25)", options: { color: C.muted, fontSize: 10 } }], { x: 2.05, y: 4.47, w: 2.5, h: 0.62, fontSize: 12 });
  txt(s, "Contract support as needed: regulatory consultant, industrial designer.", { x: 0.55, y: 5.3, w: 5.95, h: 0.75, fontSize: 9.5, color: C.light, objectName: "collab" });
  txt(s, "Equity split: founders' agreement (not set) · ESOP 5% · inventor assignments before filing", { x: 0.55, y: 6.1, w: 5.95, h: 0.5, fontSize: 10, color: C.amber, objectName: "eq_note" });
  K.growth.funnel.forEach((a, i) => {
    const y = 1.5 + i * 0.66, w = 3.6 - i * 0.42, x = 6.75 + (3.6 - w) / 2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.58, rectRadius: 0.06, fill: { color: i % 2 ? C.violet : C.blue, transparency: 72 }, line: { color: i % 2 ? C.violet : C.blue, width: 1 }, objectName: "aarrr" + i });
    txt(s, [{ text: a[0].toUpperCase() + "  ", options: { bold: true, color: C.white, fontSize: 9.5 } }, { text: a[2], options: { bold: true, color: C.cyan, fontSize: 12 } }], { x: x + 0.1, y: y + 0.05, w: w - 0.2, h: 0.28, align: "center" });
    txt(s, a[1], { x: x + 0.1, y: y + 0.3, w: w - 0.2, h: 0.25, fontSize: 8.5, color: C.light, align: "center" });
  });
  txt(s, "Targets, not data", { x: 6.75, y: 4.85, w: 3.6, h: 0.25, fontSize: 9.5, color: C.muted, align: "center" });
  K.growth.experiments.forEach((e, i) => {
    const y = 1.5 + i * 1.22;
    card(s, 10.55, y, 2.25, 1.1, "exp" + i, C.card2, i === 0 ? C.cyan : C.line);
    txt(s, [{ text: `${i + 1}. ${e[0]}`, options: { bold: true, color: C.white, breakLine: true } }, { text: e[1], options: { color: C.muted, fontSize: 8.5, breakLine: true } }, { text: e[2], options: { color: C.light, fontSize: 8.5 } }], { x: 10.65, y: y + 0.07, w: 2.08, h: 0.98, fontSize: 10 });
  });
  src(s, "Role evidence: paper author lists, repository history, academic record.");
}

// ===================================================================== 13 FUNDING ASK & VALUATION
{
  const c = F.C;
  const s = base(13, "12 · FUNDING ASK & VALUATION", `Raise ${lakh(c.equity, 2)} at ${lakh(V.proposed, 0)} pre-money — ${pct(c.investor, 1)} to the investor`);
  [["This round · Milestone 1 (M1–M6)", lakh(c.equity, 1), C.cyan], ["Year-1 cash costs", lakh(H.costs12, 1), C.white], ["Total to reach profitability", lakh(H.fullRequirement, 1), C.violet]].forEach((k, i) => {
    card(s, 0.55 + i * 2.45, 1.45, 2.32, 0.82, "need" + i, C.card, i === 0 ? C.cyan : C.line);
    txt(s, k[0], { x: 0.68 + i * 2.45, y: 1.52, w: 2.1, h: 0.3, fontSize: 9, color: C.muted });
    txt(s, k[1], { x: 0.68 + i * 2.45, y: 1.8, w: 2.1, h: 0.4, fontSize: 18, bold: true, color: k[2] });
  });
  const vo = V.options;
  const rows = [["Pre-money", "Investor", "Founders*", "Basis"]].concat(vo.map((o) => [lakh(o.pre, 2), pct(o.investor, 1), pct(o.founders, 1), o.basis]));
  s.addTable(rows.map((r, i) => r.map((v, j) => {
    const prop = i > 0 && vo[i - 1].pre === V.proposed;
    return { text: v, options: { bold: i === 0 || prop, color: i === 0 ? C.white : prop ? C.cyan : C.light, fill: { color: i === 0 ? C.card2 : prop ? "0B2A36" : C.bg } } };
  })), { x: 0.55, y: 2.45, w: 7.2, colW: [1.25, 1.0, 1.05, 3.9], fontFace: B, fontSize: 10.5, border: { type: "solid", pt: 0.5, color: C.line }, rowH: 0.34, valign: "middle", margin: 0.05, objectName: "val_table" });
  txt(s, `* after 5% ESOP · equity fixed at ${lakh(c.equity, 2)} · Berkus-style cross-check ${lakh(V.berkus, 0)}; ${lakh(V.proposed, 0)} is a negotiation target, not an established value`, { x: 0.55, y: 4.2, w: 7.2, h: 0.3, fontSize: 9, color: C.muted });
  const eq = [["Pre-money P", inr(V.proposed), "proposed working target"], ["Equity I", inr(c.equity), "Milestone-1 requirement (gap × 1.2)"], ["Post-money", inr(c.post), "= P + I"],
    ["Investor", pct(c.investor, 2), "= I ÷ (P + I)"], ["Founders", pct(c.founders, 2), `= 100% − investor − ${pct(c.esop)} ESOP`]];
  eq.forEach((e, i) => {
    const y = 4.58 + i * 0.4;
    txt(s, e[0], { x: 0.55, y, w: 1.5, h: 0.35, fontSize: 12, bold: true, color: C.white, valign: "middle", objectName: "eq_l" + i });
    txt(s, e[1], { x: 2.05, y, w: 1.9, h: 0.35, fontSize: 15, bold: true, color: i === 4 ? C.green : C.cyan, valign: "middle", objectName: "eq_v" + i });
    txt(s, e[2], { x: 4.0, y, w: 3.75, h: 0.35, fontSize: 9.5, color: C.muted, valign: "middle", objectName: "eq_d" + i });
  });
  txt(s, "CAP TABLE", { x: 8.1, y: 1.5, w: 3, h: 0.25, fontSize: 10, bold: true, color: C.muted, charSpacing: 2 });
  txt(s, "Before", { x: 8.1, y: 1.85, w: 1.8, h: 0.3, fontSize: 12, bold: true, color: C.white });
  s.addShape(pres.shapes.RECTANGLE, { x: 8.1, y: 2.2, w: 1.8, h: 3.7, fill: { color: C.green, transparency: 45 }, line: { color: C.green, width: 1 }, objectName: "cap_before" });
  txt(s, "Founders\n100%", { x: 8.1, y: 3.7, w: 1.8, h: 0.7, fontSize: 13, bold: true, color: C.white, align: "center" });
  s.addShape(pres.shapes.RIGHT_ARROW, { x: 10.05, y: 3.9, w: 0.5, h: 0.3, fill: { color: C.line }, line: { color: C.line, width: 0 } });
  txt(s, `After (at ${lakh(V.proposed, 0)})`, { x: 10.7, y: 1.85, w: 2.1, h: 0.3, fontSize: 12, bold: true, color: C.white });
  let yy = 2.2;
  [["Founders", c.founders, C.green], ["ESOP", c.esop, C.blue], ["Investor", c.investor, C.cyan]].forEach((sg, i) => {
    const h = 3.7 * sg[1];
    s.addShape(pres.shapes.RECTANGLE, { x: 10.7, y: yy, w: 2.1, h, fill: { color: sg[2], transparency: 45 }, line: { color: sg[2], width: 1 }, objectName: "cap_after" + i });
    txt(s, `${sg[0]}  ${pct(sg[1], 1)}`, { x: 10.7, y: yy + h / 2 - 0.16, w: 2.1, h: 0.32, fontSize: 11, bold: true, color: C.white, align: "center", objectName: "cap_lbl" + i });
    yy += h;
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.1, y: 6.1, w: 4.7, h: 0.5, rectRadius: 0.06, fill: { color: C.cyan }, line: { color: C.cyan, width: 0 }, objectName: "!!fundbar" });
  txt(s, `Now ${lakh(c.equity, 1)} → tranche 2 ${lakh(H.phase2Requirement, 1)} by M7 · grant not counted`, { x: 8.2, y: 6.13, w: 4.5, h: 0.44, fontSize: 11, bold: true, color: C.bg, valign: "middle", objectName: "!!fundbar_t" });
  src(s, `Scenarios A–D in the model: grant + full raise ${pct(F.A.investor)}; no grant ${pct(F.B.investor)}; staged tranche 2 priced on evidence. Floor = cost-to-duplicate (${V.personMonths} PM × ${lakh(V.rate, 2)} + ${lakh(V.materials, 2)}).`);
}

// ===================================================================== 14 USE OF FUNDS + MILESTONES + RISKS + CLOSE
{
  const c = F.C;
  const s = base(14, "13 · USE OF FUNDS, MILESTONES & WHY THIS COULD FAIL", "Six months to a clear yes or no; month " + H.breakEvenMonth.split("\n")[0].slice(1) + " to profit");
  const uf = D.useOfFunds.filter((u) => u.phase1 > 0);
  const tot = uf.reduce((a, u) => a + u.phase1, 0);
  txt(s, `Phase 1 (M1–M6) costs ${lakh(tot, 1)} → funded by the ${lakh(c.equity, 1)} round (incl. buffer)`, { x: 0.55, y: 1.45, w: 12.2, h: 0.3, fontSize: 12, bold: true, color: C.white, objectName: "!!fundbar_t" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 1.85, w: 12.25, h: 0.5, rectRadius: 0.06, fill: { color: C.bg }, line: { color: C.line, width: 0.75 }, objectName: "!!fundbar" });
  const pal = [C.blue, C.cyan, C.violet, "60A5FA", "64748B", "94A3B8"];
  let x = 0.55;
  uf.forEach((u, i) => {
    const w = 12.25 * u.phase1 / tot;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.85, w, h: 0.5, fill: { color: pal[i % pal.length] }, line: { color: C.bg, width: 1 }, objectName: "alloc" + i });
    txt(s, [{ text: u.category, options: { bold: true, color: C.white, breakLine: true } }, { text: `${lakh(u.phase1, 1)} · ${pct(u.phase1 / tot)}`, options: { color: C.light } }], { x: x + 0.05, y: i % 2 ? 2.95 : 2.42, w: 2.3, h: 0.5, fontSize: 9.5, objectName: "alloc_l" + i });
    x += w;
  });
  s.addShape(pres.shapes.LINE, { x: 0.7, y: 4.15, w: 12.0, h: 0, line: { color: C.line, width: 2 }, objectName: "ms_line" });
  const NMS = K.milestones.length, SP = 12.25 / NMS;
  K.milestones.forEach((m, i) => {
    const xx = 0.55 + i * SP, ph1 = i <= 3;
    const last = i === NMS - 1;
    s.addShape(pres.shapes.OVAL, { x: xx + SP / 2 - 0.12, y: 4.03, w: 0.24, h: 0.24, fill: { color: last ? C.green : ph1 ? C.cyan : C.violet }, line: { color: C.bg, width: 2 }, objectName: "ms_dot" + i });
    txt(s, m[0], { x: xx, y: 3.62, w: SP, h: 0.35, fontSize: 13, bold: true, color: last ? C.green : C.white, align: "center" });
    txt(s, [{ text: m[2].toUpperCase(), options: { bold: true, color: last ? C.green : ph1 ? C.cyan : C.violet, fontSize: 7, breakLine: true } }, { text: m[1], options: { color: C.white, fontSize: 9 } }], { x: xx + 0.03, y: 4.33, w: SP - 0.06, h: 0.75, objectName: "ms_t" + i });
  });
  card(s, 0.55, 5.15, 7.6, 1.45, "kill", "2A1620", C.red);
  const gg = D.competitors.find((c) => c.name === "GyroGlove");
  txt(s, [{ text: "WHY THIS COULD FAIL", options: { bold: true, color: C.red, breakLine: true } },
    { text: K.brand.failRisk, options: { color: C.white, breakLine: true } },
    { text: "Kill / continue: ", options: { bold: true, color: C.amber } }, { text: K.brand.failKill, options: { color: C.light } }], { x: 0.75, y: 5.22, w: 7.3, h: 1.35, fontSize: 11.5, paraSpaceAfter: 4, valign: "top", objectName: "kill_t" });
  card(s, 8.35, 5.15, 4.45, 1.45, "close", "0E1F3A", C.blue);
  s.addImage({ path: BR + "averra-mark-white.png", x: 8.5, y: 5.3, w: 0.55, h: 0.55, objectName: "close_mark" });
  txt(s, [{ text: K.brand.tagline, options: { bold: true, color: C.white, fontSize: 14, breakLine: true } }, { text: `Ask: ${lakh(c.equity, 1)} for ${pct(c.investor, 1)}. Kill / continue decided by the M6 user study; risks and triggers in the companion guide.`, options: { color: C.light, fontSize: 9.5 } }],
    { x: 9.15, y: 5.25, w: 3.55, h: 1.3, objectName: "close_t" });
}

pres.writeFile({ fileName: "AVERRA_Pitch_raw.pptx" }).then((f) => console.log("written", f));
