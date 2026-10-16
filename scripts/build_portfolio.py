"""Builds the AVERRA Practical Portfolio (15 mandatory models) as print-ready HTML for PDF and DOCX export.
Every figure is read from the financial model export (data/averra-data.json) or the workbook itself.
Nothing here is invented evidence: missing real-world evidence is shown as a fill-in template and flagged."""
import json, html
from pathlib import Path
from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
D = json.loads((ROOT / "data/averra-data.json").read_text())
K = json.loads((ROOT / "data/content.json").read_text())
WB = load_workbook(ROOT / "model/AVERRA_Financial_Model.xlsx", data_only=True)
FC = WB["Forecast"]
rows = {r[0].value: [c.value for c in r[3:39]] for r in FC.iter_rows(min_row=4, max_row=FC.max_row) if r[0].value}

inr = lambda x: ("-₹" if x < 0 else "₹") + f"{abs(round(x)):,}"
def inr_in(x):  # Indian digit grouping
    x = round(x); s = str(abs(x)); h = s[-3:]; r = s[:-3]
    while len(r) > 2: h = r[-2:] + "," + h; r = r[:-2]
    if r: h = r + "," + h
    return ("-₹" if x < 0 else "₹") + h
inr = inr_in
lakh = lambda x, d=2: ("-₹" if x < 0 else "₹") + f"{abs(x)/1e5:.{d}f} L"
crore = lambda x, d=2: ("-₹" if x < 0 else "₹") + f"{abs(x)/1e7:.{d}f} Cr"
pct = lambda x, d=1: f"{x*100:.{d}f}%"
num = lambda x: f"{round(x):,}"
e = html.escape

A = D["assumptions"]; H = D["headline"]; MK = D["market"]; TS = D["tremosense"]; UE = D["unitEconomics"]
sA, sB, sC = TS["scenarios"]["A"], TS["scenarios"]["B"], TS["scenarios"]["C"]
F = D["funding"]["C"]; V = D["valuation"]; fc = D["forecast"]
tsl, psl, psd = UE["tremosenseLtv"], UE["parkinsenseLtv"], UE["parkinsenseDevice"]
comp = {c["name"]: c for c in D["competitors"]}
BE = H["breakEvenMonth"].replace("\n", " · ")

AI_NOTE = "AI assistance: AI (Claude) helped structure and draft this sheet from the founders' own pitch deck, financial model and repositories. The founders must verify every source, supply the real-world evidence marked pending, and approve all conclusions."
STATUS = {"complete": ("Completed – supported by evidence", "#0E7490"), "partial": ("Partially completed", "#B45309"),
          "planned": ("Planned – protocol ready, not yet run", "#1D4ED8"), "awaiting": ("Awaiting real-world evidence", "#B91C1C")}

# ------------------------------------------------------------------ helpers
def table(head, body, cls="", widths=None):
    cg = "".join(f'<col style="width:{w}">' for w in widths) if widths else ""
    th = "".join(f"<th>{h}</th>" for h in head)
    tb = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in body)
    return f'<table class="{cls}"><colgroup>{cg}</colgroup><thead><tr>{th}</tr></thead><tbody>{tb}</tbody></table>'

def blanks(n, cols):
    return ["" for _ in range(cols)] and [["&nbsp;"] * cols for _ in range(n)]

def note(t, kind="info"):
    return f'<div class="note {kind}">{t}</div>'

ACTS = []
def activity(code, mod, act, title, status, body, subtitle=""):
    lab, col = STATUS[status]
    ACTS.append((code, title, status))
    return f'''<section class="act" id="{code}">
<div class="acthead"><div class="tag">M{mod} · Activity {act} · Mandatory Model {code}</div>
<h1>{e(title)}</h1>{f'<p class="sub">{subtitle}</p>' if subtitle else ''}
<table class="meta"><tr><td><b>Module</b> {mod}</td><td><b>Activity</b> {act}</td><td><b>Date completed</b> ____ / ____ / 2026</td><td><b>Venture</b> AVERRA</td></tr>
<tr><td colspan="4"><b>Evidence status:</b> <span class="st" style="background:{col}">{lab}</span></td></tr>
<tr><td colspan="4" class="ai">{AI_NOTE}</td></tr></table></div>
{body}</section>'''

# ------------------------------------------------------------------ M1.1
m11 = activity("M1.1", 1, 1, "Customer-Discovery Evidence Pack", "awaiting", f"""
<h2>1. Target customer and problem hypothesis</h2>
<p class="hyp"><b>TremoSense:</b> Adults in urban India living with Parkinson's disease or essential tremor whose hand tremor makes eating difficult, and the family members who help them at meals, regularly lose independence and dignity at mealtimes and currently rely on help from others, adapted cutlery or avoiding certain foods.</p>
<p class="hyp"><b>ParkinSense:</b> Wearable users, including people living with tremor and their families, want continuous insight into how they move between clinic visits, but today their movement is only observed for a few minutes during a consultation.</p>
<h2>2. Mom Test interview questions (past behaviour only)</h2>
<ol class="qs">
<li>Tell me about the last meal where your (or your family member's) tremor made eating harder. What happened?</li>
<li>What did you do about it at that meal? What do you usually do?</li>
<li>What have you already tried for eating with tremor (spoons, weighted cutlery, help from someone, changing food)? How did that go?</li>
<li>Have you spent money on anything to help with tremor or eating? What was it, roughly how much, and where did you hear about it?</li>
<li>How often in the last week did tremor change what or where you ate?</li>
<li>When did you last discuss tremor with a neurologist or therapist? What did they measure, and what happened next?</li>
<li>Do you currently track symptoms, activity or sleep in any way (watch, app, diary)? Show me the last thing you recorded.</li>
<li>Who else is involved when a decision about buying a health device is made in your home?</li>
</ol>
<p class="small">Rules followed: no pitching before the questions, no "would you buy", no leading questions; record exact words; ask for specifics (last time, how often, how much).</p>
<h2>3. Interview evidence log (minimum 5 real interviews)</h2>
{note("<b>Pending evidence.</b> AVERRA has not yet run its own customer interviews. The pitch currently quotes published research (Hadley et al. 2021; Kellner et al. 2017; Kurupath et al. 2020), which is secondary evidence, not interviews. Do not present this activity as complete until at least five real interviews are recorded below.", "warn")}
{table(["#", "Date", "Respondent type (no names needed; consent recorded)", "Exact words (verbatim)", "Pain · frequency · workaround · money/time spent"], [[str(i), "", "", "", ""] for i in range(1, 7)], "fill tall", ["4%", "10%", "22%", "36%", "28%"])}
<h2>4. Pattern analysis (complete after interviews)</h2>
{table(["Signal", "Count out of N", "Evidence (interview #)"], [["Same pain mentioned", "", ""], ["Weekly or more frequent", "", ""], ["Has an existing workaround", "", ""], ["Has already paid money/time/reputation", "", ""], ["Clinician measures movement only in clinic", "", ""]], "fill", ["40%", "20%", "40%"])}
<h2>5. Secondary evidence already in hand (labelled as published, not interviews)</h2>
{table(["Who", "Published statement", "Source"], [[e(q[0]), "“" + e(q[1]) + "”", f'{e(q[2])}<br><span class="url">{e(q[3])}</span>'] for q in K["problem"]["quotes"]], "", ["16%", "48%", "36%"])}
<h2>6. Continue / kill decision</h2>
<p><b>Provisional decision: CONTINUE, conditional.</b> Published studies show a real, repeated pain (embarrassment eating in public; only snapshot measurement in clinic; severe caregiver burden in India), and two people with tremor who tried TremoSense informally reacted positively (founder-reported). This is not yet our own interview evidence. <b>Kill trigger:</b> if fewer than 3 of 5+ interviewees describe tremor disrupting meals at least weekly, or none has spent money or effort on a workaround, we stop TremoSense as a consumer product.</p>
<p class="small">Final decision line (write after interviews): ________________________________________________</p>
""")

# ------------------------------------------------------------------ M1.2
P, T, G = MK["parkinsense"], MK["tremosense"], MK["general"]
m12 = activity("M1.2", 1, 2, "Opportunity Scorecard & “Why Now?” Memo", "partial", f"""
<h2>1. Bottom-up TAM, SAM and SOM (India, revenue per year)</h2>
<p class="small">All inputs are on the <i>Market</i> and <i>Assumptions</i> sheets of the financial model. Revenue per customer spreads the device price over a 3-year life, net of GST.</p>
{table(["Step", "TremoSense", "ParkinSense (PD households, beachhead)"], [
 ["Population base", f"Indians aged 60+ = 14.9 Cr (UNFPA 2023)", "Same base"],
 ["Patients", f"PD 308.9 per lakh aged 60+ → {num(MK['pd60'])}; ET 89.96 per lakh → {num(MK['et'])}", f"PD aged 60+ = {num(MK['pd60'])}"],
 ["Customers with the need", f"(PD + ET) × 50% eating-disruptive tremor = {num(T['customers'])}", f"{num(P['customers'])} households"],
 ["₹ per customer per year", f"₹9,999 ÷ 1.05 GST ÷ 3 yrs = {inr(T['revPerCustomer'])}", f"₹7,999 ÷ 1.18 ÷ 3 + 40% × ₹169 × 12 = {inr(P['revPerCustomer'])}"],
 ["<b>TAM</b>", f"<b>{num(T['customers'])} × {inr(T['revPerCustomer'])} = {crore(T['tam'])}</b>", f"<b>{num(P['customers'])} × {inr(P['revPerCustomer'])} = {crore(P['tam'])}</b>"],
 ["<b>SAM</b> (urban 31.1% × under neurologist care 40%)", f"<b>{num(T['samCustomers'])} people = {crore(T['sam'])}</b>", f"<b>{num(P['samCustomers'])} = {crore(P['sam'])}</b>"],
 ["<b>SOM</b> (Year 3, what our channels can reach)", f"<b>30 clinics × 4/month × 12 + 50 online/month × 12 = {num(T['somCustomers'])} = {lakh(T['som'])}</b> ({pct(T['somShare'])} of SAM)", f"<b>30 clinics × 2/month × 12 + 60 online/month × 12 = {num(P['somCustomers'])} = {lakh(P['som'])}</b> ({pct(P['somShare'])} of SAM)"],
], "", ["24%", "38%", "38%"])}
<p><b>Company totals:</b> TAM {crore(MK['totals']['tam'])} · SAM {crore(MK['totals']['sam'])} · Year-3 SOM {lakh(MK['totals']['som'])}. Customer counts are not summed (one household may buy both).</p>
<p><b>Upside, not in plan totals — ParkinSense as a general wearable:</b> IDC India 2024: 3.5 Cr smartwatches × {inr(G['revPerCustomer'])} = {crore(G['tam'], 0)} TAM; × 2.8% premium share = SAM {crore(G['sam'])}; SOM 0.25% / 0.5% / 1% of SAM buyers = {lakh(G['somRange'][0]['som'])} / {crore(G['somRange'][1]['som'])} / {crore(G['somRange'][2]['som'])}.</p>
{note("Estimates to state openly: 50% eating-disruptive share, 40% under neurologist care, 3-year device life, 40% subscription take-up, clinic and online volumes. ET prevalence comes from a single rural-Gujarat study. Year-3 SOM is a target, not data.", "warn")}
<h2>2. “Why Now?” memo</h2>
<p><b>The shift.</b> Movement sensing on the wrist became mainstream and regulator-accepted, and India created a defined approval route for devices like ours. Dated evidence: Apple opened a Movement Disorder API in ResearchKit (June 2018); Rune Labs' Apple Watch Parkinson's monitoring received FDA clearance (June 2022); licensing became mandatory for all medical devices in India from 1 October 2023; UNFPA projects India's 60+ population to rise from 14.9 Cr to 34.7 Cr by 2050 (September 2023); BMJ projects 25.2 million people with Parkinson's worldwide by 2050 (March 2025). Hardware cost collapsed too: the microcontroller with an on-board 6-axis IMU used in both products lists at US$15.90 (Seeed Studio).</p>
<p><b>Why it was harder three years ago.</b> Before October 2023 India had no mandatory, clearly defined licensing route for devices like ours, so a product could not be planned and costed end to end, and wrist-based PD monitoring had no regulatory precedent before 2022.</p>
<p><b>Why the window will not stay open.</b> Global wearable brands (WHOOP, Garmin, Google, Amazfit) already sense movement; if they add tremor features, or imported active spoons (₹35,980–₹58,480 in India today) become cheaper, the low-cost Indian gap closes.</p>
<h2>3. 90-second pitch (≈150 words; rehearse aloud, no notes)</h2>
<blockquote>About 4.6 lakh Indians over sixty live with Parkinson's, and more have essential tremor. Their movement is measured for a few minutes in a clinic, and at home a 4–12 hertz tremor turns a spoon into a spill. Published studies say a clinic visit is “only a snapshot”, and people with tremor are most embarrassed eating in public. AVERRA builds two products on one sensing stack. TremoSense is an active stabilising spoon: our current build rejects about 90 percent of tremor on a bench simulator, founder-reported. ParkinSense is a ₹7,999 wellness band with tremor detection. Bottom-up, our serviceable market is {crore(MK['totals']['sam'], 1)} a year, and through 30 clinics plus online we target {lakh(MK['totals']['som'], 0)} by year three. Next, we run a preregistered user study with at least ten people, and continue only if median tremor reduction reaches 50 percent.</blockquote>
<p class="small">Word count ≈ 150. Timed delivery: ______ s (fill in after practice).</p>
<h2>4. Opportunity scorecard (1 = weak, 5 = strong; every score cites its evidence)</h2>
{table(["Criterion", "Score", "Evidence behind the score"], [
 ["Size of the problem", "4", f"Bottom-up TAM {crore(MK['totals']['tam'], 1)}; PD and ET prevalence from published studies (Cureus 2025; Mov Disord 2021)"],
 ["Pain intensity", "4", "Most-endorsed ET item is embarrassment eating in public (Kellner 2017); 73/100 Indian caregivers report severe burden (JCDR 2020)"],
 ["Willingness to pay", "2", "Not yet measured; imported spoons sell at ₹35,980+ and GyroGlove at ≈₹5.6 L, but no AVERRA price test yet"],
 ["Timing (why now)", "4", "Dated regulatory and technology shifts 2018–2023 (memo above)"],
 ["Competition / differentiation", "3", "No screenless band lists tremor detection; active spoons exist but cost 4–6× our planned price"],
 ["Team fit", "4", "Founders built both prototypes; two papers; bench results"],
 ["Evidence from own customers", "1", "Own interviews pending (see M1.1)"],
 ["<b>Total</b>", "<b>22 / 35</b>", "Strong on problem and timing; weakest on own-customer and pricing evidence"]], "", ["26%", "10%", "64%"])}
""")

# ------------------------------------------------------------------ M1.3
lines3 = [k for k in rows if rows[k] and all(isinstance(rows[k][i], (int, float)) for i in range(3)) and k not in ("Subtotal", "Contingency", "TOTAL CASH COSTS") and any(rows[k][i] for i in range(3)) and not k.startswith(("Cumulative", "NET", "Closing", "TOTAL CASH IN", "TremoSense cash per unit"))]
rec, one = [], []
for k in lines3:
    v = rows[k][:3]
    (rec if v[0] == v[1] == v[2] and v[0] else one).append((k, v))
def brow(k, v): return [e(k), inr(v[0]), inr(v[1]), inr(v[2]), inr(sum(v))]
sub = [rows["Subtotal"][i] for i in range(3)]; cont = [rows["Contingency"][i] for i in range(3)]; tot = [rows["TOTAL CASH COSTS"][i] for i in range(3)]
m13 = activity("M1.3", 1, 3, "Venture Money-Model & First-Budget Pack", "partial", f"""
<h2>1. The money model on one page</h2>
{table(["What we sell", "Who pays", "How much", "How often", "Cost to deliver one unit"], [
 ["TremoSense active stabilising spoon (sale; rental option)", "Family of the person with tremor, referred by a clinic or OT centre", f"{inr(TS['launchPrice'])} incl. 5% GST (planned); {inr(TS['postCostPrice'])} from M19; rental ₹799/month", "Once per ≈3-year device life", f"{inr(sB['cogs'])} small-batch COGS + 15% clinic margin + 5% warranty + ₹250 shipping → contribution {inr(sB['contribution'])}"],
 ["ParkinSense wellness band + optional insights plan", "The user, online", f"₹7,999 incl. 18% GST + optional ₹199/month", "Device once; plan monthly (40% take-up assumed)", f"₹3,530 COGS + 10% online fees + warranty + shipping → contribution {inr(psd['contribution'])}"],
 ["Research-use (RUO) kits", "University labs", "₹74,999 per kit", "One-off", f"₹22,650 → contribution {inr(UE['ruoKit']['contribution'])}"]], "", ["20%", "18%", "20%", "14%", "28%"])}
<p><b>Revenue-model choice, defended:</b> a one-time device sale (with rental for families who cannot pay upfront) fits an assistive product bought once by a family, and keeps every unit profitable from the first sale. A subscription is offered only on ParkinSense, where ongoing insights create ongoing value; it is optional, so it never blocks access.</p>
<p><b>Brand positioning (Digital Marketing I):</b> {e(K['brand']['positioning'])} <b>Organic channels:</b> neurologist and OT referrals, Parkinson's and ET support groups, LinkedIn and YouTube demo videos of the bench rig, the AVERRA website.</p>
<h2>2. First three months (M1–M3, Jul–Sep 2027), zero-based from the financial model</h2>
<p class="small">Each line is justified from zero (what it buys), not copied forward. Source: Forecast sheet, rows for M1–M3.</p>
<h3>One-time costs</h3>
{table(["Line", "M1", "M2", "M3", "3-month total"], [brow(k, v) for k, v in one], "num", ["44%", "14%", "14%", "14%", "14%"])}
<h3>Monthly recurring costs</h3>
{table(["Line", "M1", "M2", "M3", "3-month total"], [brow(k, v) for k, v in rec], "num", ["44%", "14%", "14%", "14%", "14%"])}
{table(["", "M1", "M2", "M3", "3-month total"], [["Subtotal", *[inr(x) for x in sub], inr(sum(sub))], ["<b>Contingency 10%</b>", *[inr(x) for x in cont], inr(sum(cont))], ["<b>Total 3-month budget</b>", *[f"<b>{inr(x)}</b>" for x in tot], f"<b>{inr(sum(tot))}</b>"]], "num", ["44%", "14%", "14%", "14%", "14%"])}
<h2>3. Personal runway (each founder fills in their own; not invented here)</h2>
{table(["Founder", "Personal savings (₹)", "Personal monthly expenses (₹)", "Personal runway = savings ÷ expenses (months)"], [["Pranshu Kumar", "", "", ""], ["Pawan Shinde", "", "", ""]], "fill", ["25%", "25%", "25%", "25%"])}
<p class="small">Context from the plan: each founder draws a ₹15,000/month stipend in Phase 1 (M1–M6), ₹30,000 in M7–M24 and ₹45,000 in Year 3 (Forecast sheet). Personal runway shows how long each founder can continue if stipends are deferred.</p>
""")

# ------------------------------------------------------------------ M2.1
bmc = [("Customer segments", "Everyday wearable users; households living with Parkinson's or essential tremor; research labs", "Assumption (sizes from published prevalence)"),
       ("Value propositions", "ParkinSense: a wearable for everyone with built-in tremor detection. TremoSense: active tremor assistance at an Indian price", "Partly evidenced (bench results; no user study)"),
       ("Channels", "Clinic and OT referral; direct online; institutional procurement", "Assumption"),
       ("Customer relationships", "Clinic-assisted trial; caregiver onboarding; remote support", "Assumption"),
       ("Revenue streams", f"TremoSense sale {inr(TS['launchPrice'])} or rental ₹799/mo; ParkinSense ₹7,999 + optional ₹199/mo; RUO kits ₹74,999", "Assumption (prices planned, untested)"),
       ("Key resources", "Sensing and control know-how; two working prototypes; two papers; repositories", "Evidence-backed (repos, papers)"),
       ("Key activities", "User studies; CDSCO and ISO 13485; firmware and DSP; small-batch assembly", "Evidence-backed for engineering; assumption for regulatory route"),
       ("Key partners", "Neurology clinics; OT centres; university labs; a test lab; a contract assembler; ICMR (clinical evaluation in progress, founder-reported)", "Partly evidenced (ICMR founder-reported; no clinic partners yet)"),
       ("Cost structure", f"Phase 1 {lakh(H['phase1Costs'])}: team, study units, user study, IP. Then QMS, EMC, inventory and tooling, outreach", "Evidence-backed for component prices (Seeed, servo retailers); rest estimated")]
m21 = activity("M2.1", 2, 1, "Evidence-Backed Business Model Canvas + Value Proposition Canvas", "partial", f"""
<h2>1. Business Model Canvas (all nine blocks)</h2>
{table(["Block", "AVERRA", "Evidence-backed or assumption?"], [[f"<b>{a}</b>", e(b), e(c)] for a, b, c in bmc], "", ["20%", "52%", "28%"])}
<h2>2. Value Proposition Canvas</h2>
<h3>TremoSense — person with tremor and their family</h3>
{table(["Customer profile", "Value map"], [
 ["<b>Jobs:</b> eat independently; eat in public without embarrassment; reduce the help needed at every meal", "<b>Product:</b> active two-axis stabilising spoon (IMU → EKF → LQR → two servos)"],
 ["<b>Pains:</b> spills; embarrassment (Kellner 2017); imported active spoons cost ₹35,980–₹58,480; weighted spoons tire the hand", "<b>Pain relievers:</b> ≈90% tremor rejection on the bench (founder-reported); planned price ₹9,999; built and serviced in India"],
 ["<b>Gains:</b> dignity; fewer meals needing help; caregiver time back", "<b>Gain creators:</b> rental option ₹799/month; clinic-assisted trial before buying"]], "", ["50%", "50%"])}
<h3>ParkinSense — wearable user (including people living with tremor)</h3>
{table(["Customer profile", "Value map"], [
 ["<b>Jobs:</b> understand activity, vitals and movement every day; share a record with a clinician", "<b>Product:</b> screenless wrist band streaming IMU + PPG over BLE to a dashboard"],
 ["<b>Pains:</b> clinic sees only a snapshot (Hadley 2021); screenless bands cost ₹12,000–₹25,990 and none lists tremor detection", "<b>Pain relievers:</b> tremor score, frequency and burden; tremor never counted as steps; ₹7,999 with no mandatory subscription"],
 ["<b>Gains:</b> long battery; a clear history to discuss with a doctor", "<b>Gain creators:</b> live dashboard; optional ₹199/month insights plan"]], "", ["50%", "50%"])}
<h2>3. The three riskiest assumptions and how we test each</h2>
{table(["#", "Riskiest assumption", "Why it would sink us", "Test (one line)"], [
 ["1", "Bench tremor rejection turns into easier eating with real food and real hands", "No product without it", "Preregistered self-feeding study, n ≥ 10, M6: continue only if median reduction ≥50%"],
 ["2", "Families will pay ₹9,999 (or rent at ₹799/month)", "Unit economics fail", "In-clinic trial-to-purchase test, 10 clinics, 8 weeks: ≥30% buy at ₹9,999"],
 ["3", "Clinicians will refer patients", "Channel and CAC fail", "Outreach to 10 neurologists/OT centres: ≥5 agree to host a trial; track referrals per clinic per month"]], "", ["4%", "30%", "20%", "46%"])}
""")

# ------------------------------------------------------------------ M2.2
m22 = activity("M2.2", 2, 2, "MVP Validation Experiment & Decision", "planned", f"""
<h2>1. What exists today (evidence)</h2>
{table(["MVP", "What was run", "Result so far", "Status"], [
 ["TremoSense current build (Zephyr, 208 Hz, higher-torque servos)", "Motorised tremor simulator at 4, 6, 8 Hz, ±5°; 2 people with tremor tried it informally", "≈90% tremor rejection on the bench (founder-reported; logs to be published); positive informal feedback, no metric", "Bench evidence only"],
 ["ParkinSense prototype + dashboard", "Bench conditions (rest, 5 Hz fixture, walking, arm motion); BLE soak; power profiling", "8/8 bench conditions correct; ≈7 mA. Clinical evaluation with ICMR in progress, results pending (founder-reported)", "Bench evidence; clinical results pending"]], "", ["24%", "28%", "32%", "16%"])}
{note("No success metric was preregistered before the bench tests above, so they are reported as bench evidence, not as a validated MVP. The experiment below is the first preregistered test and has <b>not yet been run</b>.", "warn")}
<h2>2. Preregistered experiment (planned for M6)</h2>
{table(["Item", "Protocol"], [
 ["MVP being tested", "12 TremoSense study units (Scenario A build)"],
 ["Target user", "Adults with Parkinson's or essential tremor whose tremor disrupts eating; recruited via neurologists/OT centres; ethics approval first"],
 ["Hypothesis", "Using TremoSense reduces tremor amplitude at the spoon head during a standard self-feeding task, and users value it enough to pay ₹9,999"],
 ["Success metric 1", "Median reduction in spoon-head tremor amplitude (IMU) vs a normal spoon, same participant, same task"],
 ["Success metric 2", "Share of participants who say they would pay ₹9,999 (or rent at ₹799/month) after the session"],
 ["Preregistered thresholds", "Persevere: median reduction ≥50% AND ≥60% would pay · Redesign and re-test once: 30–50% · Kill TremoSense: <30% · Pivot to clinic rental: works but <60% would pay"],
 ["Procedure", "Each participant: 10 spoonfuls of a standard food with a normal spoon, then 10 with TremoSense (order randomised); log IMU on handle and head; short interview"],
 ["Duration and sample", "4 weeks in M5–M6; n ≥ 10"],
 ["ParkinSense pass mark (M10)", "Dominant-frequency error ≤5% vs a reference device; zero false steps during tremor"]], "", ["24%", "76%"])}
<h2>3. Results and decision (fill in only with real results)</h2>
{table(["Metric", "Preregistered threshold", "Actual result", "Met?"], [["Median tremor reduction", "≥50%", "", ""], ["Would pay ₹9,999 / rent", "≥60%", "", ""], ["Participants completed", "≥10", "", ""]], "fill", ["30%", "25%", "30%", "15%"])}
<p><b>Decision (to be written after the test, honouring the threshold even if it hurts):</b> PERSEVERE / REDESIGN / PIVOT / KILL — ______________________</p>
""")

# ------------------------------------------------------------------ M2.3
pm = {r["price"]: r for r in TS["priceMatrix"]}
p1, p2 = TS["launchPrice"], TS["postCostPrice"]
def cm(p, sc):  # contribution for TremoSense via clinic
    ex = p / 1.05; ch = ex * 0.15; net = ex - ch; cogs = TS["scenarios"][sc]["cogs"]; w = ex * (0.08 if sc == "A" else 0.05)
    return ex, ch, net, cogs, w, net - cogs - w - 250
m23 = activity("M2.3", 2, 3, "Pricing, Margin & Funnel Performance Pack", "partial", f"""
<h2>1. Two candidate prices for TremoSense</h2>
{table(["", f"Price 1: {inr(p1)} (value-based, launch)", f"Price 2: {inr(p2)} (cost-plus after cost reduction)"], [
 ["Rationale", "Lowest price with LTV:CAC above 3× at small-batch cost; ≈¼ of the cheapest imported active spoon (₹35,980)", f"Cost-plus once tooling and supplier quotes bring COGS to {inr(sC['cogs'])} (Scenario C, from M19)"],
 *[[lab, f"{inr(cm(p1,'B')[i])}", f"{inr(cm(p2,'B')[i])} at B · {inr(cm(p2,'C')[i])} at C"] for lab, i in (("Price ex-GST (÷ 1.05)", 0), ("Clinic margin 15%", 1), ("Net revenue", 2), ("COGS", 3), ("Warranty 5%", 4))],
 ["Fulfilment", "₹250", "₹250"],
 ["<b>Contribution per unit</b>", f"<b>{inr(cm(p1,'B')[5])} ({pct(pm[p1]['Bm'])})</b>", f"<b>{inr(pm[p2]['B'])} ({pct(pm[p2]['Bm'])}) at B · {inr(pm[p2]['C'])} ({pct(pm[p2]['Cm'])}) at C</b>"]], "num", ["30%", "35%", "35%"])}
<p class="small">Contribution margin = selling price − all variable costs of one unit (GST is collected for the government and excluded). Source: Price Matrix and TremoSense Costs sheets. ParkinSense at ₹7,999: net {inr(psd['net'])} − COGS ₹3,530 − warranty − shipping = {inr(psd['contribution'])} ({pct(psd['contributionMargin'])}).</p>
<h2>2. Funnel (AARRR) — assumed targets, not measured</h2>
{table(["Stage", "Assumed target", "Count (per 1,000 reached)", "Conversion formula", "Measured (fill in)"], [
 ["Reach (Acquisition)", "1,000 caregivers via 10 clinics", "1,000", "—", ""],
 ["Enquiry / trial (Activation)", "25% try it in clinic", "250", "trials ÷ reached", ""],
 ["Purchase (Revenue)", "40% of trials buy", "100", "buyers ÷ trials; overall = buyers ÷ reached = 10%", ""],
 ["Retention", "≥70% daily use at day 30", "70", "active at day 30 ÷ buyers", ""],
 ["Referral", "15% refer another family", "15", "referrers ÷ buyers", ""]], "", ["20%", "24%", "16%", "24%", "16%"])}
{note("No real sale or preorder exists yet. Proof of a first sale or credible preorder (receipt, message, payment screenshot) must be attached here when it happens. Until then this part is <b>awaiting evidence</b>.", "warn")}
<h2>3. Plan to collect real willingness-to-pay evidence</h2>
<ol><li>During the M6 user study, ask each participant a Van Westendorp price ladder (too cheap / bargain / getting expensive / too expensive) and record exact answers.</li>
<li>Offer a refundable ₹1,000 preorder deposit at ₹9,999 to participants and caregivers after the session; count deposits, not compliments.</li>
<li>At two clinics, show ₹9,999 and at two others ₹8,999 (A/B by clinic) and record enquiry → trial → deposit conversion.</li></ol>
<h2>4. IP note (Legal/IP basics)</h2>
<p><b>Patent:</b> a provisional patent filing is <i>planned</i> for M2 (not filed) covering the stabilisation control arrangement. <b>Trademark:</b> “AVERRA”, “ParkinSense” and “TremoSense” should be searched and filed (Class 10 medical devices, Class 9 software). <b>Copyright:</b> firmware, dashboard code and documentation are protected automatically; record authorship and inventor assignments to the company before any filing.</p>
""")

# ------------------------------------------------------------------ M3.1
m31 = activity("M3.1", 3, 1, "Operating System & Delivery-Process Blueprint", "planned", f"""
{note("All times below are <b>estimates</b> for a 100-unit pilot batch; none has been measured yet. Measure each step on the first pilot batch and replace the estimate.", "info")}
<h2>1. TremoSense: order to support</h2>
{table(["#", "Step", "Owner", "Estimated time"], [
 ["1", "Clinic/OT referral → in-clinic trial booked", "Clinic + AVERRA", "1–3 days"],
 ["2", "Trial session and order (sale or rental)", "Clinic staff", "30 min"],
 ["3", "Pick sub-assemblies from stock", "Operations", "10 min"],
 ["4", "Final assembly (gimbal, servos, battery)", "Contract assembler", "40 min"],
 ["5", "<b>Servo calibration + tremor-rejection test on the simulator rig</b>", "Founders (hardware & test)", "<b>45 min per unit</b>"],
 ["6", "Safety check, cleaning of food-contact head, packing", "Operations", "15 min"],
 ["7", "Courier to home or clinic", "Courier", "2–4 days"],
 ["8", "Onboarding call with caregiver; 7-day check-in", "Support", "20 min + 10 min"]], "", ["5%", "55%", "22%", "18%"])}
<p><b>Bottleneck:</b> step 5. One rig and two founders give ≈9 units/day, slower than assembly. <b>Redesign (no new spend first):</b> run calibration as a scripted batch on the existing rig (firmware self-test + automatic pass/fail on the logged IMU), test 4 units per rig cycle, and only hand-check failures. Target ≈12 min per unit.</p>
<h2>2. ParkinSense: online order to support</h2>
{table(["#", "Step", "Estimated time"], [["1", "Online order and payment", "instant"], ["2", "Flash firmware, pair, register device ID", "10 min"], ["3", "<b>BLE streaming soak test (packet loss, battery)</b>", "<b>8 h per batch</b>"], ["4", "Strap fit, pack", "10 min"], ["5", "Courier", "2–4 days"], ["6", "App/dashboard onboarding email + support", "15 min"]], "", ["5%", "70%", "25%"])}
<p><b>Bottleneck:</b> the soak test. <b>Redesign:</b> a 20-slot charging-and-soak rack that tests a full batch overnight in parallel.</p>
<h2>3. SOP — TremoSense final calibration and test (new hire can follow)</h2>
<ol class="sop"><li>Scan the unit's serial QR code; the test script opens a log file named with the serial number.</li>
<li>Charge to ≥80% (green LED). If not reached in 60 min, tag “battery” and set aside.</li>
<li>Mount the handle in the simulator clamp, spoon head pointing up; tighten until the handle does not slip.</li>
<li>Run <i>self-test</i>: the servos sweep ±20°; check there is no grinding and both axes return to level.</li>
<li>Run the simulator at 4, 6 and 8 Hz for 20 s each; the script computes tremor rejection from the handle and head IMUs.</li>
<li>Pass if rejection ≥ the release threshold at every frequency (threshold set from the published bench logs); the script prints PASS/FAIL.</li>
<li>On PASS, wipe the food-contact head with food-safe sanitiser, fit the cap and pack with the manual. On FAIL, tag the failure code and send to rework.</li>
<li>Upload the log; the order is released for dispatch only when a PASS log exists.</li></ol>
<h2>4. Lean wastes and how we remove them</h2>
{table(["Waste", "Where it shows up", "How we reduce it"], [
 ["Waiting", "Assembled units wait for calibration", "Batch self-test script (above); calibrate as units arrive, not at the end"],
 ["Inventory", "Pilot batch of 100 units bought before demand is proven", "Buy servos and enclosures in 25-unit lots tied to clinic orders; keep only sub-assemblies"],
 ["Defects", "Servo or boost-converter failures found by the customer", "100% end-of-line test with a stored PASS log; track failure codes to fix root causes"]], "", ["16%", "38%", "46%"])}
""")

# ------------------------------------------------------------------ M3.2
mon = fc["months"][:12]
cost12 = fc["costs"][:12]; in12 = fc["cashIn"][:12]; net12 = fc["net"][:12]; cum12 = fc["cumulative"][:12]
closeC = rows["Closing cash — Scenario C"][:12]
ftab = [[m.replace(" ", " · "), inr(c), inr(i), inr(n), inr(cc), inr(cl)] for m, c, i, n, cc, cl in zip(mon, cost12, in12, net12, cum12, closeC)]
p1burn = H["phase1Costs"] / 6
# bad growth: Year-2 volume at a discounted ₹5,999 price vs plan at ₹9,999 (unit economics from the model's price matrix)
u2 = fc["revLines"][0]["units"]["y2"]
bad_c = pm[5999]["B"]; good_c = pm[p1]["B"]
m32 = activity("M3.2", 3, 2, "Unit-Economics & Runway Model", "partial", f"""
<p class="small">Every number is a forecast from the financial model (Unit Economics and Forecast sheets). AVERRA has no actual revenue yet; nothing below is an actual financial result.</p>
<h2>1. Unit economics</h2>
{table(["Metric", "Formula", "TremoSense", "ParkinSense"], [
 ["CAC", "planned acquisition spend ÷ customers acquired", f"{inr(tsl['cac'])}", f"{inr(psl['cac'])}"],
 ["Contribution per unit", "price ex-GST − channel − COGS − warranty − shipping", f"{inr(sB['contribution'])}", f"{inr(psd['contribution'])}"],
 ["LTV", "lifetime contribution per customer", f"{inr(sB['contribution'])} × 1.4 purchases (40% repurchase) = {inr(tsl['ltv'])}", f"{inr(psd['contribution'])} + 40% × ₹129/mo × 20 mo = {inr(psl['ltv'])}"],
 ["LTV : CAC", "LTV ÷ CAC", f"{tsl['ltvCac']:.2f}×", f"{psl['ltvCac']:.2f}×"],
 ["CAC payback", "CAC ÷ contribution per sale", f"{tsl['cac']/sB['contribution']:.2f} of the first sale → paid back on the first sale", f"{psl['cac']/psd['contribution']:.2f} of the first sale → first sale"]], "", ["18%", "30%", "26%", "26%"])}
<h2>2. 12-month cash forecast (Jul 2027 – Jun 2028), funded by the ₹{F['equity']/1e5:.2f} L round only</h2>
{table(["Month", "Cash out", "Cash in", "Net cash flow", "Cumulative", "Closing cash"], ftab, "num small", ["16%", "16%", "14%", "18%", "18%", "18%"])}
<p class="small">Closing cash = ₹{F['equity']/1e5:.2f} L raised − cumulative net outflow (Funding Scenarios sheet, Scenario C: Round 1 only, no grant). Negative closing cash means tranche 2 must already have closed.</p>
<h2>3. Burn, runway and zero-cash date</h2>
<ul><li>Phase-1 burn (M1–M6) = {inr(H['phase1Costs'])} ÷ 6 = <b>{inr(p1burn)}/month</b> (no cash in).</li>
<li>Year-1 gross burn = {inr(H['costs12'])} ÷ 12 = <b>{inr(H['grossBurn12'])}/month</b>; net burn after {inr(H['cashIn12'])} cash in = <b>{inr(H['netBurn12'])}/month</b>.</li>
<li>Runway on this round = {inr(F['equity'])} ÷ {inr(p1burn)} = <b>{F['equity']/p1burn:.1f} months</b> at Phase-1 burn.</li>
<li><b>Projected zero-cash date: January 2028 (M7)</b>, when Phase-2 spending starts. Tranche 2 ({lakh(H['phase2Requirement'])}) must close by then; if it is late, hiring, inventory and testing pause and the buffer stretches to about M14.</li></ul>
<h2>4. Bad-growth scenario (toggle: price cut to grow faster)</h2>
{table(["Year-2 TremoSense", "Normal plan", "Bad growth"], [
 ["Price", inr(p1), "₹5,999 (discount to chase volume)"],
 ["Units sold", num(u2), f"{num(2*u2)} (twice the volume)"],
 ["Contribution per unit (Scenario B cost)", inr(good_c), inr(bad_c)],
 ["CAC per customer", inr(tsl['cac']), inr(tsl['cac'])],
 ["Contribution − CAC per customer", inr(good_c - tsl['cac']), inr(bad_c - tsl['cac'])],
 ["<b>Total effect on cash</b>", f"<b>{inr(u2*(good_c - tsl['cac']))}</b>", f"<b>{inr(2*u2*(bad_c - tsl['cac']))}</b>"]], "num", ["40%", "30%", "30%"])}
<p>In the bad-growth case every extra customer loses {inr(-(bad_c - tsl['cac']))}, so doubling volume deepens the loss by {lakh(u2*(good_c - tsl['cac']) - 2*u2*(bad_c - tsl['cac']))} versus the plan and pulls the zero-cash date earlier. This is why the plan holds ₹9,999 until a verified cost reduction (Scenario C) makes ₹8,999 profitable. <span class="small">(Illustrative toggle built from the model's Price Matrix; not a separate sheet in the workbook.)</span></p>
""")

# ------------------------------------------------------------------ M3.3
out_ts = p1 - p1/1.05; inp_ts = (sB['cogs'] - 400 - 200) * 0.18
out_ps = 7999 - 7999/1.18; inp_ps = 3530 * 0.18
m33 = activity("M3.3", 3, 3, "Legal-Structure, GST & Compliance Blueprint", "partial", f"""
{note("Educational blueprint, not legal or tax advice. GST rates and HSN codes for TremoSense (assumed 5%) and ParkinSense (assumed 18%) must be confirmed with a chartered accountant.", "info")}
<h2>1. Structure comparison for AVERRA</h2>
{table(["", "Proprietorship", "Partnership", "LLP", "Private Limited"], [
 ["Liability", "Unlimited, personal", "Unlimited, joint", "Limited", "Limited"],
 ["Paperwork", "Lowest", "Low (deed)", "Moderate (annual LLP filings)", "Highest (ROC filings, audit, board meetings)"],
 ["Raising equity", "Not possible", "Not practical", "No equity shares; VCs rarely invest", "Equity shares, SAFEs/CCPS, ESOPs; standard for investors"],
 ["DPIIT / Startup India / SISFS", "No", "Registered firms eligible", "Eligible", "Eligible"],
 ["Fit for a two-founder medical-device startup", "No", "No", "Partial", "<b>Best fit</b>"]], "", ["24%", "18%", "18%", "18%", "22%"])}
<p><b>Recommendation: Private Limited.</b> We plan to raise equity in two tranches and grant ESOPs, which needs shares; limited liability matters for a device used on the body; and DPIIT recognition plus the Startup India Seed Fund application (applied for, not secured) require a recognised entity.</p>
<h2>2. Mock GST calculation (hypothetical example, per unit)</h2>
{table(["", "TremoSense @ ₹9,999 (5% assumed)", "ParkinSense @ ₹7,999 (18% assumed)"], [
 ["Output GST charged to customer", f"₹9,999 − ₹9,999/1.05 = {inr(out_ts)}", f"₹7,999 − ₹7,999/1.18 = {inr(out_ps)}"],
 ["Input tax credit on purchases (18% on bought-in parts)", f"(COGS {inr(sB['cogs'])} − labour/QC ₹600) × 18% = {inr(inp_ts)}", f"COGS ₹3,530 × 18% = {inr(inp_ps)}"],
 ["<b>Net GST payable</b>", f"<b>{inr(out_ts - inp_ts)}</b> → credit (inverted duty: input rate > output rate; refund can be claimed under Sec 54(3), CGST Act)", f"<b>{inr(out_ps - inp_ps)}</b> payable"],
 ["For 100 units", f"{inr(100*(out_ts - inp_ts))}", f"{inr(100*(out_ps - inp_ps))}"]], "", ["30%", "38%", "32%"])}
<h2>3. First-year compliance calendar (to confirm with a CA/CS)</h2>
{table(["When", "Filing / task"], [
 ["Before M1", "Incorporate Pvt Ltd (SPICe+), PAN/TAN, bank account; founders' agreement and inventor assignments"],
 ["Within 30 days", "Appoint first auditor (ADT-1); first board meeting"],
 ["Within 180 days", "Commencement of business (INC-20A)"],
 ["On turnover/inter-state supply", "GST registration; then GSTR-1 (11th) and GSTR-3B (20th) monthly, or QRMP quarterly"],
 ["Quarterly", "TDS returns; board meeting (at least 4 a year)"],
 ["M2", "Provisional patent filing (planned); trademark applications"],
 ["M4", "CDSCO classification opinion; ethics committee approval for the user study"],
 ["M9–M10", "CDSCO registration/licence application for TremoSense (class to be confirmed)"],
 ["30 Sep", "DIR-3 KYC for directors; AGM within six months of year end"],
 ["31 Oct / Nov", "ITR-6; AOC-4 and MGT-7 annual ROC filings"],
 ["Any time", "DPIIT Startup recognition; Startup India Seed Fund application (applied for, not secured)"]], "", ["24%", "76%"])}
<h2>4. Founder-agreement clauses (proposed)</h2>
<ol><li><b>Equity and vesting:</b> founder shares vest over 4 years with a 1-year cliff; unvested shares return to the company on departure.</li>
<li><b>Roles:</b> Pranshu — CEO, wearable hardware and firmware; Pawan — control, gimbal and power electronics. Both remain the hardware and test engineers.</li>
<li><b>Decision-making:</b> day-to-day decisions by the role owner; fundraising, new products, hiring above ₹30,000/month and any medical claim need both founders.</li>
<li><b>Departure:</b> good-leaver keeps vested shares; bad-leaver (fraud, breach) sells vested shares back at face value; 3-month notice and handover.</li>
<li><b>IP assignment:</b> all IP created for AVERRA (including pre-incorporation prototypes) is assigned to the company before any patent filing.</li></ol>
""")

# ------------------------------------------------------------------ M4.1
post = F["post"]
m41 = activity("M4.1", 4, 1, "Team & Incentive Blueprint", "partial", f"""
<h2>1. 12-month org chart and hiring sequence</h2>
{table(["Month", "Team", "Why then"], [
 ["M1–M6", "Pranshu Kumar (CEO, wearable hardware & firmware) · Pawan Shinde (control, gimbal & power) — both hardware and test engineers", "Phase 1 is engineering and validation; no hires"],
 ["M7–M12", "Founders + contract support (regulatory consultant, industrial designer, contract assembler)", "Regulatory filing and pilot batch; contracts, not payroll"],
 ["M19", "+ Clinic-network sales lead · + Customer support & operations", "After first sales prove demand"],
 ["M25", "+ App & firmware engineer (ParkinSense)", "ParkinSense wellness launch"]], "", ["12%", "58%", "30%"])}
<p class="small">The plan's first hires fall after month 12, so the 12-month chart is the two founders plus contractors (Forecast sheet hiring lines).</p>
<h2>2. Role descriptions</h2>
{table(["Role", "Responsibilities", "What good looks like"], [
 ["Clinic-network sales lead (M19)", "Sign and support neurology and OT clinics; run in-clinic trials; manage clinic margin terms", "30 active clinics by M30; ≥4 TremoSense sales per clinic per month; CAC ≤ ₹1,079"],
 ["Customer support & operations (M19)", "Onboarding calls, 7-day check-ins, returns, dispatch, stock", "Onboarding within 48 h; ≥70% daily use at day 30; return rate <5%"],
 ["App & firmware engineer (M25)", "ParkinSense mobile app, BLE firmware, cloud sync", "App store release by M27; crash-free sessions ≥99%; no data-privacy incidents"]], "", ["24%", "40%", "36%"])}
<h2>3. Structured mock-interview guide (same questions for every candidate)</h2>
<ol><li>Tell me about a time you got a clinician or institution to adopt something new. What exactly did you do?</li>
<li>Walk me through how you tracked a sales pipeline last time. What numbers did you watch?</li>
<li>Describe a deal you lost. What did you learn?</li>
<li>A caregiver says the device isn't helping after a week. What do you do in the first call?</li>
<li>Score: 1–5 on evidence of past behaviour, clarity, customer empathy, numeracy.</li></ol>
{table(["Interviewer (classmate)", "Date", "Q1", "Q2", "Q3", "Q4", "Total /20", "Notes"], [["", "", "", "", "", "", "", ""]], "fill", ["18%", "10%", "8%", "8%", "8%", "8%", "10%", "30%"])}
{note("Mock interview record pending; complete it with a classmate and attach notes.", "warn")}
<h2>4. Founder equity-split method (scores to be agreed by the founders)</h2>
{table(["Factor (weight)", "Pranshu (1–10)", "Pawan (1–10)", "How to score"], [
 ["Idea and IP (25%)", "", "", "Who originated each product and holds the prototypes and papers"],
 ["Capital contributed (15%)", "", "", "Cash and equipment put in"],
 ["Full-time commitment (35%)", "", "", "Months committed full-time from M1"],
 ["Prior expertise (25%)", "", "", "Relevance of skills to the next 18 months"]], "fill", ["26%", "14%", "14%", "46%"])}
<p>Founder share = Σ(weight × score) for that founder ÷ Σ(weight × score) for both founders × 82.71% (founders' total after Round 1 with a 5% ESOP pool; Funding Scenarios sheet). <i>Illustrative only:</i> if both founders score equally, each holds 50% of founder equity = 41.36% after Round 1. Vesting: 4 years, 1-year cliff, monthly thereafter.</p>
<h2>5. ESOP pool and a sample grant</h2>
<p>The model reserves a <b>5% ESOP pool</b>, enough for the three planned hires (≈1–1.5% each) plus a reserve. The course suggests 10–15%; we keep 5% now to limit dilution in a small round and plan to top it up at tranche 2 when the team grows (flagged for the founders to decide).</p>
<p>Sample grant: 0.5% × post-money {inr(post)} = <b>{inr(0.005*post)}</b> on paper at the proposed valuation (illustrative; not a market value).</p>
""")

# ------------------------------------------------------------------ M4.2
m42 = activity("M4.2", 4, 2, "Growth-Engine Dashboard", "planned", f"""
{note("No paid campaign or structured organic experiment has been run yet, so there are no reach, click, CAC, ROAS or retention figures to report. The tables are ready to complete; nothing below is measured.", "warn")}
<h2>1. Campaign tracker (fill in after running one campaign or organic push)</h2>
{table(["Channel", "Spend ₹", "Reach", "Clicks", "Enquiries", "Conversions", "CAC = spend ÷ conversions", "ROAS = revenue ÷ spend"], [["", "", "", "", "", "", "", ""] for _ in range(2)], "fill", ["16%", "10%", "10%", "10%", "12%", "12%", "15%", "15%"])}
<p class="small">Suggested first test: a ₹2,000 Instagram/YouTube boost of the TremoSense bench video to caregivers in Mumbai and Pune, linking to a preorder-deposit form; count deposits as conversions.</p>
<h2>2. Cohort retention (fill in from real users)</h2>
{table(["Cohort (joined)", "Users", "Active Month 1", "Active Month 2", "Active Month 3"], [["", "", "", "", ""] for _ in range(3)], "fill", ["24%", "16%", "20%", "20%", "20%"])}
<h2>3. Growth experiment backlog, ICE-scored (scores are the founders' current judgement)</h2>
{table(["Experiment", "Pass mark", "Impact", "Confidence", "Ease", "ICE total", "Rank"], [
 ["In-clinic trial → purchase (10 clinics, 8 weeks)", "≥30% buy at ₹9,999; CAC ≤ ₹1,079", "9", "5", "5", "19", "1"],
 ["ParkinSense wellness beta (100 users, 8 weeks)", "≥40% weekly active; ≥25% would subscribe", "7", "5", "6", "18", "2"],
 ["Support-group referrals (PD/ET caregiver groups)", "≥15% refer; CAC ≤ ₹800", "6", "4", "7", "17", "3"]], "", ["30%", "26%", "9%", "11%", "8%", "9%", "7%"])}
<p class="small">ICE total = Impact + Confidence + Ease (each 1–10). Rank 1 runs first because it tests the riskiest commercial assumption (willingness to pay through clinics).</p>
""")

# ------------------------------------------------------------------ M4.3
uf = [u for u in D["useOfFunds"] if u["phase1"] > 0]
m43 = activity("M4.3", 4, 3, "Fundraising Model, Cap Table & Investor Pitch", "partial", f"""
<h2>1. The ask and the milestone it funds</h2>
<p>Raise <b>{inr(F['equity'])}</b> (Round 1) to fund Milestone 1 (M1–M6): both founders full-time, 12 study units, the preregistered user study, a provisional patent filing (planned) and a CDSCO classification opinion. Amount = Phase-1 peak cash gap {inr(H['phase1Gap'])} × 1.2 buffer.</p>
<h2>2. Valuation</h2>
<p><b>Proposed pre-money: {inr(V['proposed'])} — a working negotiation target, not an independently verified market valuation.</b> Methods used, named explicitly:</p>
<ul><li><b>Cost-to-duplicate (floor):</b> {V['personMonths']} person-months × {inr(V['rate'])} + {inr(V['materials'])} materials = {inr(V['floor'])}.</li>
<li><b>Berkus-style scorecard (cross-check):</b> {' + '.join(lakh(b['value'], 1) for b in V['berkusFactors'])} = {inr(V['berkus'])}.</li>
<li>The premium above the cross-check reflects two products and a clinical evaluation in progress (founder-reported).</li></ul>
<h2>3. Arithmetic</h2>
{table(["", "Formula", "Value"], [
 ["Post-money", "Pre-money + investment", f"{inr(V['proposed'])} + {inr(F['equity'])} = <b>{inr(F['post'])}</b>"],
 ["Investor ownership", "Investment ÷ post-money × 100", f"{inr(F['equity'])} ÷ {inr(F['post'])} = <b>{pct(F['investor'], 2)}</b>"],
 ["ESOP pool", "set aside", f"<b>{pct(F['esop'], 0)}</b>"],
 ["Founders", "100% − investor − ESOP", f"<b>{pct(F['founders'], 2)}</b>"]], "", ["20%", "36%", "44%"])}
<h2>4. Cap table</h2>
{table(["Holder", "Before Round 1", "After Round 1 (at ₹75 L pre)"], [["Founders", "100%", pct(F['founders'], 2)], ["ESOP pool", "—", pct(F['esop'], 2)], ["Round-1 investor", "—", pct(F['investor'], 2)], ["<b>Total</b>", "100%", "100%"]], "", ["40%", "30%", "30%"])}
<p class="small">The model treats the 5% ESOP pool as created at Round 1 alongside the investor (founders = 100% − 12.29% − 5%). Check: {pct(F['founders'],2)} + {pct(F['esop'],2)} + {pct(F['investor'],2)} = 100.00%.</p>
<h2>5. Use of funds (Phase 1, M1–M6)</h2>
{table(["Category", "Amount", "Share", "What it buys"], [[e(u['category']), inr(u['phase1']), pct(u['phase1']/H['phase1Costs'], 0), e(K['fundsBuy'].get(u['category'], ''))] for u in uf] + [["<b>Total Phase 1</b>", f"<b>{inr(H['phase1Costs'])}</b>", "100%", f"Round = this × 1.2 = {inr(F['equity'])}"]], "", ["26%", "14%", "10%", "50%"])}
<p><b>Runway:</b> {F['equity']/p1burn:.1f} months at Phase-1 burn. <b>After this round:</b> tranche 2 of {lakh(H['phase2Requirement'])} must close by M7 (Jan 2028), priced on the M6 result; total to break-even {lakh(H['fullRequirement'])}. <b>Startup India Seed Fund grant (₹20 L): applied for, not secured, and not counted.</b></p>
<h2>6. Short investor pitch</h2>
<blockquote>AVERRA engineers better movement intelligence. TremoSense is an active stabilising spoon that rejects about 90% of tremor on our bench, founder-reported, at ₹9,999, a quarter of imported alternatives; ParkinSense is a ₹7,999 wellness band with tremor detection, in a clinical evaluation with ICMR. Every unit is profitable from the first sale: {inr(sB['contribution'])} contribution on TremoSense. We are raising {lakh(F['equity'])} at a {lakh(V['proposed'], 0)} pre-money for {pct(F['investor'])} to reach one clear answer in six months: a preregistered user study with at least ten people. If the median tremor reduction is below 30%, we stop TremoSense.</blockquote>
<p class="small">Mock-panel pitch date: ________ · Panel questions and our answers: ____________________ (fill in after the class pitch).</p>
""")

# ------------------------------------------------------------------ M5.1
m51 = activity("M5.1", 5, 1, "Sustainable & Ethical Enterprise Blueprint", "partial", f"""
<h2>1. Stakeholders beyond customers and investors</h2>
{table(["Stakeholder", "How AVERRA affects them", "Our commitment"], [
 ["Caregivers and families", "Time and stress at meals; they often pay", "Honest claims; rental option; clear return policy"],
 ["Clinicians and OT therapists", "Referrals carry their reputation", "Share study results, including negative ones; no referral kickbacks"],
 ["Employees and contractors", "Assembly and test work, data access", "Fair pay; safety training for battery handling; data-access controls"],
 ["Suppliers and contract assembler", "Volume, payment terms", "Pay within 30 days; no forced price cuts after orders"],
 ["Environment", "LiPo batteries, electronics, plastic", "Take-back and refurbishment programme; RoHS-compliant parts"],
 ["Community / research participants", "Study participants' health data", "Ethics approval, informed consent, data minimisation"]], "", ["24%", "36%", "40%"])}
<h2>2. One specific ESG improvement</h2>
<p><b>Device take-back and refurbishment (environmental + social).</b> Every TremoSense and ParkinSense comes with a prepaid return label at end of life or after a rental ends. Returned units are tested on the same calibration rig, refurbished and re-rented at a lower rate to families who cannot afford ₹9,999; LiPo cells and e-waste go to an authorised recycler under India's E-Waste (Management) Rules 2022. Target: ≥50% of rental units refurbished at least once.</p>
<h2>3. Ethical red lines and scenario tests</h2>
{table(["Red line", "Tempting, realistic scenario", "What we do"], [
 ["We will never claim ParkinSense diagnoses or predicts Parkinson's until clinical results support it", "A marketing partner says “early Parkinson's detection” would triple sign-ups", "Refuse. Market it as a wellness band with tremor insight; add clinical claims only after ICMR results and regulatory approval"],
 ["We will never sell or share identifiable health or movement data", "An insurer offers ₹10 L a year for anonymised tremor data", "Decline unless users give explicit, separate opt-in consent and the data is genuinely de-identified under India's DPDP Act 2023"],
 ["We will never hide or reword a failed validation result", "The M6 study shows 35% reduction, below our 50% target, just before tranche 2", "Report the result as preregistered, follow the redesign rule, and tell investors before they decide"]], "", ["30%", "32%", "38%"])}
<h2>4. Responsibilities specific to biomedical wearables and assistive technology</h2>
<ul><li><b>Data privacy:</b> minimal data collection; on-device or encrypted transfer; deletion on request (DPDP Act 2023).</li>
<li><b>Accessibility:</b> large controls, no small screens to read, caregiver-friendly onboarding, regional-language manuals, rental for affordability.</li>
<li><b>Truthful claims:</b> “≈90% on a bench simulator (founder-reported)” is never shortened to “90% less tremor”.</li>
<li><b>Unvalidated features:</b> HR/HRV/SpO₂ are labelled research-grade until validated against reference devices.</li></ul>
""")

# ------------------------------------------------------------------ M5.2
m52 = activity("M5.2", 5, 2, "Live Launch & Iteration Report", "awaiting", f"""
{note("<b>Incomplete.</b> AVERRA has not run a launch or pilot launch. Two people with tremor have tried TremoSense informally (founder-reported, no recorded metric). This sheet therefore holds the launch plan and the evidence template; it must not be presented as a completed launch.", "warn")}
<h2>1. Pilot-launch plan</h2>
{table(["Item", "Plan"], [["What", "In-clinic TremoSense pilot using the 12 study units after ethics approval (M5–M6)"], ["Who", "≥10 adults with tremor and their caregivers, via 2–3 neurology/OT clinics"], ["How long", "4 weeks"], ["Feedback channels", "Session interview, 7-day WhatsApp check-in, short exit questionnaire"], ["Decision rule", "Same preregistered thresholds as M2.2"]], "", ["24%", "76%"])}
<h2>2. Evidence template (complete with real feedback only)</h2>
{table(["#", "Date", "User type", "Exact feedback (verbatim)", "Theme"], [[str(i), "", "", "", ""] for i in range(1, 6)], "fill tall", ["5%", "12%", "18%", "45%", "20%"])}
{table(["Recurring theme", "How many users", "Change we made", "What happened after"], [["", "", "", ""] for _ in range(2)], "fill", ["28%", "14%", "30%", "28%"])}
<h2>3. Crisis and contingency plan</h2>
{table(["Risk", "Likelihood", "Impact", "Response"], [
 ["A servo or battery failure during a meal (spill, burn risk from food, or overheating)", "Medium during the pilot", "High (user safety, clinic trust)", "Mechanical end-stops limit head travel; thermal cut-off in firmware; supervised first use; stop-use notice and replacement within 48 h; incident log reviewed with the clinic; pause the pilot if two incidents occur"],
 ["Tranche 2 closes late", "Medium", "High (zero-cash M7)", "Pause hiring, inventory and testing; defer stipends; buffer lasts to ≈M14"]], "", ["30%", "14%", "16%", "40%"])}
<h2>4. Continue / kill call</h2>
<p><b>Not yet decidable on market evidence.</b> Current call: continue to the preregistered pilot. Final call (after the pilot): ______________________</p>
""")

# ------------------------------------------------------------------ M5.3
m53 = activity("M5.3", 5, 3, "Full Venture Launch & Fundraising Package", "partial", f"""
<h2>1. Package contents</h2>
{table(["Component", "Where", "Status"], [
 ["Pitch deck (17 slides)", "deck/AVERRA_Pitch.pptx and averraproject.vercel.app", "Done"],
 ["Financial model", "model/AVERRA_Financial_Model.xlsx", "Done (forecast, not actuals)"],
 ["Cap table and fundraising model", "M4.3; Funding Scenarios sheet", "Done"],
 ["Customer evidence", "M1.1", "Pending (own interviews)"],
 ["MVP validation", "M2.2", "Planned (bench evidence only)"],
 ["Launch evidence", "M5.2", "Pending"]], "", ["34%", "44%", "22%"])}
<h2>2. Why this could fail (single biggest, specific risk)</h2>
<p><b>{e(K['brand']['failRisk'])}</b></p>
<p><b>Stop or change direction if:</b> the M6 study (n ≥ 10) shows median tremor reduction below 30% → stop TremoSense and focus on ParkinSense; 30–50% → one redesign and re-test; it works but fewer than 60% would pay → pivot to clinic rental at ₹799/month; tranche 2 does not close by M7 → pause spending and extend to ≈M14 on the buffer.</p>
<h2>3. Investment memo</h2>
<div class="memo">
<p><b>Company.</b> AVERRA, biomedical technology. “Engineering better movement intelligence.” Founders: Pranshu Kumar and Pawan Shinde (both hardware and test engineers).</p>
<p><b>Problem.</b> About {MK['pd60']/1e5:.1f} lakh Indians aged 60+ live with Parkinson's and ≈{MK['et']/1e5:.1f} lakh have essential tremor (single-study estimate). Movement is measured only in short clinic visits, and tremor makes eating hard and embarrassing (published studies; own interviews pending).</p>
<p><b>Products and status.</b> TremoSense, an active stabilising spoon: ≈90% tremor rejection on a bench simulator (founder-reported; logs to be published); 2 informal user trials. ParkinSense, a ₹7,999 screenless wellness band with tremor detection: steps, tremor and rest-vs-movement bench-tested; heart metrics need validation; clinical evaluation with ICMR in progress, results pending. No diagnostic claims.</p>
<p><b>Market.</b> Bottom-up TAM {crore(MK['totals']['tam'], 1)}, SAM {crore(MK['totals']['sam'], 1)}, Year-3 SOM {lakh(MK['totals']['som'], 1)}; general-wearable upside shown separately.</p>
<p><b>Business model and unit economics.</b> Clinic-referred device sales and rental; ParkinSense online with an optional plan; RUO kits for labs. TremoSense contribution {inr(sB['contribution'])} ({pct(sB['contributionMargin'])}) at {inr(p1)}; LTV:CAC {tsl['ltvCac']:.1f}×; CAC paid back on the first sale.</p>
<p><b>Financials (forecast).</b> Year-1 costs {lakh(H['costs12'])}; break-even {BE}; Year-3 operating profit {lakh(H['y3Profit'])} on {crore(H['y3CashIn'])} cash in; total to break-even {lakh(H['fullRequirement'])}.</p>
<p><b>The ask.</b> {inr(F['equity'])} at a proposed {inr(V['proposed'])} pre-money (negotiation target; cost-to-duplicate floor {lakh(V['floor'])}, Berkus cross-check {lakh(V['berkus'], 0)}) = {pct(F['investor'], 2)} to the investor; founders {pct(F['founders'], 2)} after a 5% ESOP pool. Funds Milestone 1: the preregistered user study by M6. Tranche 2 {lakh(H['phase2Requirement'])} by M7. Startup India grant applied for, not secured.</p>
<p><b>Key risk and kill rule.</b> Bench results may not transfer to real meals; stop TremoSense below 30% median reduction.</p>
</div>
<h2>4. Personal entrepreneurial thesis (each founder writes their own; not drafted for you)</h2>
{table(["Question", "Your answer, with evidence from your own semester work"], [
 ["Would you START, OPERATE, FUND or JOIN a venture? Pick one.", ""],
 ["What evidence from your M1–M5 work supports that choice? (name the activity and the number or quote)", ""],
 ["What did the customer-discovery and validation work change in your thinking?", ""],
 ["What would make you change this answer?", ""]], "fill tall", ["40%", "60%"])}
""")

# ------------------------------------------------------------------ front + back matter
mods = [("Module 1 – Mindset & Opportunity Discovery", ["M1.1", "M1.2", "M1.3"]), ("Module 2 – Business Model, MVP & First Sale", ["M2.1", "M2.2", "M2.3"]),
        ("Module 3 – Operations, Finance & Compliance", ["M3.1", "M3.2", "M3.3"]), ("Module 4 – Scaling: Team, Growth & Fundraising", ["M4.1", "M4.2", "M4.3"]),
        ("Module 5 – Venture Launch & Sustainable Enterprise", ["M5.1", "M5.2", "M5.3"])]
body = [m11, m12, m13, m21, m22, m23, m31, m32, m33, m41, m42, m43, m51, m52, m53]
TITLES = {c: t for c, t, _ in ACTS}; ST = {c: s for c, _, s in ACTS}

def toc(pages):
    out = []
    for mod, codes in mods:
        out.append(f'<tr class="tm"><td colspan="3">{mod}</td></tr>')
        for c in codes:
            out.append(f'<tr><td>{c}</td><td>{e(TITLES[c])}</td><td class="pg">{pages.get(c, "")}</td></tr>')
    for k, lab in (("REF", "References"), ("EVI", "Evidence appendix and pending-evidence checklist"), ("INC", "Inconsistencies found in the existing AVERRA files"), ("FIN", "Final completeness checklist and submission checklist")):
        out.append(f'<tr class="tm"><td></td><td>{lab}</td><td class="pg">{pages.get(k, "")}</td></tr>')
    return '<table class="toc"><colgroup><col style="width:10%"><col style="width:80%"><col style="width:10%"></colgroup>' + "".join(out) + "</table>"

refs = [(s["label"], s["url"]) for s in D["sources"]] + [(f"{q[2]}", q[3]) for q in K["problem"]["quotes"]] + [
    ("IDC India wearables market 2024 (3.5 Cr smartwatches; 2.8% advanced)", "https://www.idc.com/getdoc.jsp?containerId=prAP53197625"),
    ("Census of India 2011 — 31.1% urban population", "https://censusindia.gov.in/"),
    ("CGST Act 2017, Section 54(3) — refund of unutilised ITC (inverted duty)", "https://cbic-gst.gov.in/"),
    ("Digital Personal Data Protection Act 2023", "https://www.meity.gov.in/data-protection-framework"),
    ("E-Waste (Management) Rules 2022", "https://cpcb.nic.in/e-waste/"),
    ("AVERRA pitch website", "https://averraproject.vercel.app")]
REF = '<section class="act" id="REF"><h1>References</h1><p class="small">Prices and figures were checked on the dates stated in each label (most competitor prices on 16 Oct 2026; FX on 12 Oct 2026). Accessed for this portfolio: 16 Oct 2026. Founders should re-open every link before submission.</p><ol class="refs">' + "".join(f"<li>{e(l)}<br><span class='url'>{e(u)}</span></li>" for l, u in refs) + "</ol></section>"

pending = [("M1.1", "Five or more real customer interviews with verbatim answers and dates", "Interview PD/ET patients and caregivers via clinics or support groups; record consent"),
           ("M1.2", "Timed delivery of the 90-second pitch", "Rehearse and record the time"),
           ("M1.3", "Each founder's personal savings and monthly expenses", "Fill in privately"),
           ("M2.2", "Preregistered user-study results (n ≥ 10)", "Run after ethics approval; compare with thresholds"),
           ("M2.2", "Published TremoSense bench logs and tuned constants (≈90% figure)", "Publish logs in the repository"),
           ("M2.3", "Real price-test responses; first sale or preorder proof", "Van Westendorp + refundable deposit"),
           ("M3.1", "Measured step times on the first batch", "Time each step on the pilot"),
           ("M3.3", "CA confirmation of HSN codes and GST rates", "Consult a chartered accountant"),
           ("M4.1", "Agreed founder scores; mock-interview record", "Founders' meeting; classmate interview"),
           ("M4.2", "Campaign reach/clicks/CAC/ROAS; cohort retention", "Run one small campaign; track users"),
           ("M4.3", "Mock-panel pitch date and questions", "Record after the class pitch"),
           ("M5.2", "Pilot launch, real feedback, one change and its effect", "Run the in-clinic pilot"),
           ("M5.3", "Personal entrepreneurial thesis", "Each founder writes their own"),
           ("All", "ICMR clinical-evaluation results (ParkinSense)", "Add when published; no clinical claim until then"),
           ("All", "Patent filing receipt (currently planned, not filed)", "File the provisional and attach the receipt")]
EVI = '<section class="act" id="EVI"><h1>Evidence appendix</h1><h2>Evidence status of all 15 models</h2>' + table(["Model", "Title", "Status"], [[c, e(TITLES[c]), STATUS[ST[c]][0]] for _, cs in mods for c in cs], "", ["10%", "60%", "30%"]) + \
      "<h2>Evidence already in hand</h2><ul><li>Two working prototypes and repositories (ParkinSense develop branch; TremoSense project).</li><li>Bench results: ParkinSense 8/8 bench conditions, ≈7 mA; TremoSense ≈90% bench rejection (founder-reported, logs to be published).</li><li>Dated, sourced market and competitor figures (References).</li><li>Financial model with live formulas (11 sheets).</li><li>ParkinSense dashboard screenshot reading tremor at 4.88 Hz (pitch website).</li></ul><h2>Pending-evidence checklist</h2>" + \
      table(["Model", "Missing evidence", "How to collect it", "Done"], [[a, e(b), e(c), "☐"] for a, b, c in pending], "", ["9%", "44%", "39%", "8%"]) + "</section>"

INC = '<section class="act" id="INC"><h1>Inconsistencies found in the existing AVERRA files</h1><p class="small">Reported, not silently changed. The deck and workbook were not modified for this portfolio.</p>' + table(["#", "Issue", "Where", "What to resolve"], [
 ["1", "The course asks for a 10–14 slide pitch; the current deck and website have 17 slides", "deck/AVERRA_Pitch.pptx, website", "Merge Why now into Problem, move Architecture to backup, and fold Competitive advantage into the close for a 14-slide timed version"],
 ["2", "Required Problem slide asks for quotes from own interviews; the deck uses published research quotes", "Problem slide", "Replace or add quotes after M1.1 interviews"],
 ["3", "ESOP pool is 5%; the course example suggests 10–15%", "Funding Scenarios sheet", "Founders to confirm 5% now with a top-up at tranche 2, or resize and re-run ownership"],
 ["4", "Milestone list places M25 (ParkinSense launch) before M23 (break-even)", "content milestones / website timeline", "Reorder chronologically"],
 ["5", "README still describes older items (TremoSense “not yet tested with users”; older competitor set; patent “in preparation”)", "README.md", "Update to: 2 informal users; WHOOP/Garmin Cirqa/Fitbit Air/Helio Strap; provisional filing planned"],
 ["6", "Advantage note dated 12 Oct 2026 while competitor prices were re-checked 16 Oct 2026", "content advantage note (now corrected in source to 16 Oct)", "Rebuild website/deck once to pick up the corrected note"],
 ["7", "Bad-growth scenario is computed in this portfolio from the Price Matrix but is not a toggle in the workbook", "Financial model", "Optionally add a bad-growth toggle sheet"]], "", ["4%", "38%", "24%", "34%"]) + "</section>"

FIN = '<section class="act" id="FIN"><h1>Final completeness checklist</h1>' + table(["Check", "Result"], [
 ["All 15 mandatory models present, labelled M1.1–M5.3, in module order", "Yes"],
 ["Each sheet has module, activity, title, date field, AI disclosure and evidence status", "Yes"],
 ["Figures cross-checked against the workbook (export of 16 Oct 2026)", "Yes — generated directly from the model"],
 ["Funding ask, valuation, ownership and ESOP", f"{inr(F['equity'])}; ₹75 L pre (negotiation target); post {inr(F['post'])}; investor {pct(F['investor'],2)}; ESOP 5%; founders {pct(F['founders'],2)}"],
 ["Grant described as secured anywhere?", "No — applied for, not secured"],
 ["Patent or clinical claims presented as fact?", "No — patent filing planned; ICMR results pending"],
 ["Interviews, sales, campaign data or launch results invented?", "No — templates provided and flagged"],
 ["Missing evidence flagged", "Yes — see pending-evidence checklist"]], "", ["60%", "40%"]) + \
 '<h1 style="margin-top:14px">Submission checklist (physical copy)</h1><ol class="sop"><li>Print single-sided on A4, colour if possible (status labels are colour-coded but also written in words).</li><li>Fill every date field and sign/initial each sheet.</li><li>Complete the pending items you have evidence for; leave the rest visibly marked pending.</li><li>Attach evidence behind the matching sheet: interview notes, price-test responses, receipts/preorder proof, campaign screenshots, mock-interview notes.</li><li>Order: cover → contents → M1.1 … M5.3 → references → evidence appendix → inconsistencies → this checklist.</li><li>Bind with a clear cover; add tabs for Modules 1–5 so pages can be opened quickly in the viva.</li><li>Bring the deck on a USB drive and the website link as backup.</li><li>Before the viva, re-read M1.2 (TAM/SAM/SOM), M3.2 (runway, zero-cash date) and M4.3 (valuation arithmetic).</li></ol></section>'

COVER = f'''<section class="cover"><div class="band"></div><img src="../public/brand/averra-lockup-white.svg" class="logo" alt="AVERRA">
<p class="kick">AVERRA — Biomedical Technology</p><h1 class="ct">Practical Portfolio</h1><p class="tl">Engineering better movement intelligence.</p>
<table class="cv"><tr><td>Course</td><td>Entrepreneurship for Engineers (SEC-ENT-301), VJTI Mumbai</td></tr><tr><td>Faculty</td><td>Krupali Prakashkumar Nakar</td></tr>
<tr><td>Founders</td><td>Pranshu Kumar · Pawan Shinde</td></tr><tr><td>Products</td><td>ParkinSense (wearable wellness and movement intelligence) · TremoSense (assistive active-stabilisation spoon)</td></tr>
<tr><td>Contents</td><td>15 mandatory models (M1.1–M5.3), references, evidence appendix, checklists</td></tr><tr><td>Submission date</td><td>____ / ____ / 2026</td></tr></table>
<p class="cvnote">This portfolio separates completed evidence from planned work. Pages marked <i>Awaiting real-world evidence</i> or <i>Planned</i> are honest placeholders, not completed activities.</p></section>'''

CSS = """
@page{size:A4;margin:16mm 15mm 16mm 15mm}
*{box-sizing:border-box}body{font:9.6pt/1.42 'Helvetica Neue',Arial,sans-serif;color:#0F172A;margin:0}
h1{font-size:17pt;margin:0 0 4px;color:#0F172A;letter-spacing:-.2px}h2{font-size:11.2pt;color:#1D4ED8;margin:12px 0 5px;border-bottom:1.2px solid #06B6D4;padding-bottom:2px}h3{font-size:10pt;margin:8px 0 4px;color:#0F172A}
p{margin:4px 0 6px}ul,ol{margin:4px 0 6px 18px;padding:0}li{margin:2px 0}
table{width:100%;border-collapse:collapse;margin:5px 0 8px;table-layout:fixed;page-break-inside:auto}tr{page-break-inside:avoid}
th{background:#0F172A;color:#fff;text-align:left;font-weight:600;padding:4px 5px;font-size:8.8pt}td{border:1px solid #CBD5E1;padding:3.5px 5px;vertical-align:top;font-size:8.8pt;word-wrap:break-word}
table.num td:not(:first-child){text-align:right;font-variant-numeric:tabular-nums}table.small td{font-size:8.2pt;padding:2.5px 4px}
table.fill td{height:20px}table.fill.tall td{height:34px}
.act{page-break-before:always}.acthead .tag{font-size:8.5pt;color:#06B6D4;font-weight:700;letter-spacing:.3px}.sub{color:#475569;margin:0 0 4px}
table.meta td{border:1px solid #E2E8F0;background:#F8FAFC;font-size:8.6pt}table.meta td.ai{font-size:8pt;color:#334155;font-style:italic}
.st{color:#fff;padding:1px 7px;border-radius:9px;font-size:8.4pt;font-weight:600}
.note{border-left:4px solid #3B82F6;background:#EFF6FF;padding:6px 9px;margin:6px 0 8px;font-size:9pt}.note.warn{border-color:#B91C1C;background:#FEF2F2}
.hyp{background:#F0FDFA;border:1px solid #99F6E4;padding:6px 8px;border-radius:4px}
blockquote{margin:6px 0;padding:8px 12px;background:#F8FAFC;border-left:4px solid #06B6D4;font-size:9.4pt}
.small{font-size:8.4pt;color:#475569}.url{font-size:7.8pt;color:#1D4ED8;word-break:break-all}
.memo{border:1px solid #CBD5E1;padding:6px 12px;border-radius:4px}.memo p{margin:4px 0}
.cover{height:262mm;position:relative;padding:0;page-break-after:always}.cover .band{position:absolute;top:-16mm;left:-15mm;right:-15mm;height:118mm;background:#0F172A}
.cover .logo{position:relative;height:30px;margin-top:20mm}.cover .kick{position:relative;color:#06B6D4;font-weight:700;margin-top:16mm;font-size:11pt}
.cover .ct{position:relative;color:#fff;font-size:40pt;margin:2mm 0}.cover .tl{position:relative;color:#CBD5E1;font-size:14pt;margin:0}
table.cv{margin-top:40mm}table.cv td{border:none;border-bottom:1px solid #E2E8F0;padding:7px 4px;font-size:10.5pt}table.cv td:first-child{width:28%;color:#3B82F6;font-weight:700}
.cvnote{margin-top:10mm;font-size:9.5pt;color:#475569}
table.toc td{border:none;border-bottom:1px dotted #CBD5E1;font-size:10pt;padding:4px}table.toc tr.tm td{font-weight:700;color:#1D4ED8;padding-top:9px}td.pg{text-align:right}
ol.refs li{margin-bottom:4px;font-size:8.8pt}ol.sop li{margin-bottom:3px}
"""

def build(pages):
    tocsec = f'<section id="TOC"><h1>Contents</h1><p class="small">Portfolio order follows the course instructions: Module 1 → 5, then references and checklists.</p>{toc(pages)}</section>'
    return f'<!doctype html><html><head><meta charset="utf-8"><title>AVERRA Practical Portfolio</title><style>{CSS}</style></head><body>{COVER}{tocsec}{"".join(body)}{REF}{EVI}{INC}{FIN}</body></html>'

if __name__ == "__main__":
    import sys
    pages = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    out = ROOT / "portfolio"; out.mkdir(exist_ok=True)
    (out / "AVERRA_Practical_Portfolio.html").write_text(build(pages))
    json.dump([[c, t, STATUS[s][0]] for c, t, s in ACTS], open(out / "status.json", "w"))
    print("html written; activities:", len(ACTS))
