"""Generates the companion guide (docs/COMPANION_GUIDE.md) from data/averra-data.json and data/content.json,
so every number in the guide matches the deck and the website."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
D = json.loads((ROOT / "data" / "averra-data.json").read_text())
K = json.loads((ROOT / "data" / "content.json").read_text())

def inr(x):
    x = round(x); s = str(abs(x))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]; parts = []
        while len(head) > 2: parts.insert(0, head[-2:]); head = head[:-2]
        if head: parts.insert(0, head)
        s = ",".join(parts) + "," + tail
    return ("-₹" if x < 0 else "₹") + s
lakh = lambda x, d=1: f"{'-' if x < 0 else ''}₹{abs(x)/1e5:.{d}f} L"
crore = lambda x, d=1: f"{'-' if x < 0 else ''}₹{abs(x)/1e7:.{d}f} Cr"
pct = lambda x, d=0: f"{x*100:.{d}f}%"

ts = D["tremosense"]; sc = ts["scenarios"]; ue = D["unitEconomics"]; H = D["headline"]; F = D["funding"]; V = D["valuation"]; MK = D["market"]; A = D["assumptions"]
Y = D["forecast"]["years"]
be = H["breakEvenMonth"].replace("\n", " (").replace("-", " 20") + ")"
S = {}

S["summary"] = f"""## Summary of changes

AVERRA replaces Kampa Labs everywhere. The pitch now shows a profitable plan, a smaller first round and a stated valuation range. Every number below comes from `model/AVERRA_Financial_Model.xlsx` through `data/averra-data.json`, the same file the deck and website read.

| Area | Before | Now |
|---|---|---|
| Company | Kampa Labs | AVERRA — *{K['brand']['tagline']}* |
| ParkinSense | Clinical PD monitor | Wellness wearable with movement intelligence; clinical evaluation with ICMR in progress (founder-reported, results pending) |
| TremoSense price | ₹9,999, one cost case | ₹9,999 launch at small-batch cost; {inr(ts['postCostPrice'])} from M19 after verified cost reduction; three cost scenarios |
| Plan horizon | 18 months, not profitable | 36 months; sustained operating break-even {be}; Year-3 operating profit {lakh(H['y3Profit'])} |
| First round | ₹10.51 L at the ₹44.75 L cost floor (19%) | {lakh(F['C']['equity'], 2)} for Milestone 1 at {lakh(V['proposed'], 0)} proposed pre-money ({pct(F['C']['investor'], 1)}) |
| Pitch | 15 slides, 10:20 | 14 slides, about {K['scriptTotals']['seconds']//60}:{K['scriptTotals']['seconds']%60:02d} ({K['scriptTotals']['words']} words) |
| TremoSense result | 77.3% (paper) | ≈90% bench rejection on the current build (founder-reported); 77.3% kept as the paper-prototype figure |
| Closing page | Risks | Competitive advantage vs tremor aids and wearables; risks kept in this guide |
| New | — | Competitor analysis, repository audit, logo set, Vercel presentation website |

The institute reference has been removed from every deliverable."""

feat = "\n".join(f"| {f[0]} | {K['statusLegend'][f[1]]} | {f[2]} |" for f in K["parkinsense"]["features"])
audit = "\n".join(f"| {r[0]} | {r[1]} | {r[2]} |" for r in K["tremosense"]["repoVsPaper"])
S["evidence"] = f"""## Evidence matrix and repository audit

Both products work on a bench. TremoSense has not been used by anyone with tremor. ParkinSense is in a clinical evaluation with ICMR that the founders report is in progress; no results exist yet. The repositories, not the papers, are treated as the source of truth.

**ParkinSense feature status** (repository `develop` branch)

| Feature | Status | Evidence / gap |
|---|---|---|
{feat}

**TremoSense: current build (public repository) vs paper prototype**

| Item | Current build | Paper prototype |
|---|---|---|
{audit}

**Other inconsistencies**
- ParkinSense README says 248-byte packets; the paper and the firmware struct imply 208 bytes.
- ParkinSense README describes `Android/`, `hardware/`, `research/` and a LICENSE that are not in the repository.
- ParkinSense `tests/` files run as scripts; pytest collects 0 tests.
- The ParkinSense paper says analysis is "on-device"; in the code it runs in the host runtime, and the firmware only streams.
- The TremoSense paper cites `github.com/rkt-1597/Tremosense`; the live repository is `TremoSense-Project`.

**Evidence needed before commercialisation:** bench logs and video for the current TremoSense build's ≈90% result; a self-feeding user study (n ≥ 10); ParkinSense accuracy against reference instruments; the ICMR evaluation results; EMC/electrical-safety pre-compliance; the CDSCO classification opinion."""

rows = []
t = 0
for s in K["script"]:
    rows.append(f"| {s['slide']} | {s['title']} | {t//60}:{t%60:02d}–{(t+s['seconds'])//60}:{(t+s['seconds'])%60:02d} | {s['seconds']} s |"); t += s["seconds"]
script = "\n\n".join(f"**{s['slide']}. {s['title']}** ({s['seconds']} s)\n\n" + s["text"].replace("\n", " ") for s in K["script"])
S["script"] = f"""## Speaking script and timings

The script runs about {t//60} min {t%60} s ({K['scriptTotals']['words']} words, about {round(K['scriptTotals']['words']/(t/60))} words a minute including click pauses), inside the 10–12 minute target. The same text sits in each slide's notes and in the website's presenter panel (press N).

| Slide | Topic | Time | Length |
|---|---|---|---|
{chr(10).join(rows)}

{script}"""

P = MK["parkinsense"]; T = MK["tremosense"]
fc_rows = "\n".join(f"| {k} | {lakh(Y['cashIn'][c])} | {lakh(Y['costs'][c])} | {lakh(Y['net'][c])} |" for k, c in (("Year 1 (Jul 2027–Jun 2028)", "y1"), ("Year 2", "y2"), ("Year 3", "y3")))
S["financials"] = f"""## Financial workings

All figures are live formulas in the workbook; blue cells are inputs and yellow cells are assumptions to confirm.

**Market (bottom-up, India)**
- People with PD aged 60+: 149M × 308.9 per lakh = {MK['pd60']:,}. People with ET: {MK['et']:,} (single rural study).
- TremoSense TAM customers = (PD + ET) × 50% eating-disruptive = {T['customers']:,} × {inr(T['revPerCustomer'])}/yr = {crore(T['tam'])}.
- ParkinSense beachhead (PD households) = {P['customers']:,} × {inr(P['revPerCustomer'])}/yr = {crore(P['tam'])}. The general wellness market is not sized (no sourced Indian figure).
- SAM = TAM customers × 31.1% urban × 40% under follow-up → {crore(MK['totals']['sam'])}. Year-3 SOM from channel capacity → {lakh(MK['totals']['som'])} (TremoSense {T['somCustomers']:,}/yr; ParkinSense {P['somCustomers']:,}/yr).

**Unit economics**

| | TremoSense (launch) | ParkinSense device |
|---|---|---|
| Price incl. GST | {inr(ue['tremosense']['price'])} | {inr(ue['parkinsenseDevice']['price'])} |
| Net revenue after GST and channel | {inr(ue['tremosense']['net'])} | {inr(ue['parkinsenseDevice']['net'])} |
| COGS | {inr(ue['tremosense']['cogs'])} | {inr(ue['parkinsenseDevice']['cogs'])} |
| Gross margin | {pct(ue['tremosense']['grossMargin'])} | {pct(ue['parkinsenseDevice']['grossMargin'])} |
| Contribution (after warranty, fulfilment) | {inr(ue['tremosense']['contribution'])} ({pct(ue['tremosense']['contributionMargin'])}) | {inr(ue['parkinsenseDevice']['contribution'])} ({pct(ue['parkinsenseDevice']['contributionMargin'])}) |
| CAC | {inr(ue['tremosenseLtv']['cac'])} (plan outreach ÷ units) | {inr(ue['parkinsenseLtv']['cac'])} (assumption) |
| LTV / LTV:CAC | {inr(ue['tremosenseLtv']['ltv'])} / {ue['tremosenseLtv']['ltvCac']:.1f}× | {inr(ue['parkinsenseLtv']['ltv'])} / {ue['parkinsenseLtv']['ltvCac']:.1f}× |
| Payback | first sale | first sale |

**36-month cash plan (M1 = July 2027)**

| Period | Cash in | Cash costs | Operating cash flow |
|---|---|---|---|
{fc_rows}

- Year-1 gross burn {lakh(H['grossBurn12'], 2)}/month; Phase 1 (M1–M6) costs {lakh(H['phase1Costs'])}.
- Volumes: TremoSense {Y['tsUnits']['y2']} units in Year 2 and {Y['tsUnits']['y3']} in Year 3 (≤ SOM); ParkinSense {Y['psUnits']['y3']} in Year 3, launched M25.
- Levers to profitability, all shown in the model: verified Scenario C cost and tooling at M18; {inr(ts['postCostPrice'])} price from M19; clinic-network growth to SOM capacity.
- Peak cumulative gap {lakh(H['fullGap'])} at {H['peakGapMonth'].replace(chr(10), ' ')}; requirement to profitability = gap × 1.2 = {lakh(H['fullRequirement'])}.
- Sustained break-even {be}; Year-3 operating profit {lakh(H['y3Profit'])} ({pct(H['y3Margin'], 1)}); month-36 profit {lakh(H['m36Profit'])}.
- Cash basis: inventory is expensed when bought; no depreciation, tax or working-capital timing beyond that."""

def scen_row(k, s):
    return f"| {k} · {s['label']} | {inr(s['cogs'])} | {inr(s['electronics'])} | {inr(s['price'])} | {inr(s['netRevenue'])} | {inr(s['contribution'])} | {pct(s['grossMargin'])} / {pct(s['contributionMargin'])} | {s['breakEvenUnitsPerMonth']:.0f} |"
pm_rows = "\n".join(f"| {inr(r['price'])} | {inr(r['A'])} ({pct(r['Am'])}) | {inr(r['B'])} ({pct(r['Bm'])}) | {inr(r['C'])} ({pct(r['Cm'])}) | {r['verdict']} |" for r in ts["priceMatrix"])
ch_rows = "\n".join(f"| {c['channel']} | {inr(c['net'])} | {inr(c['contribution'])} ({pct(c['margin'])}) | {c['note']} |" for c in ts["channels"])
lines_rows = "\n".join(f"| {sc['A']['lines'][i]['item']} | {inr(sc['A']['lines'][i]['cost'])} | {inr(sc['B']['lines'][i]['cost'])} | {inr(sc['C']['lines'][i]['cost'])} |" for i in range(len(sc['A']['lines'])))
S["pricing"] = f"""## TremoSense pricing

**Recommendation:** launch at {inr(ts['launchPrice'])} (small-batch cost); move to {inr(ts['postCostPrice'])} from M19 once supplier quotes and tooling verify Scenario C cost. {inr(ts['targetPrice'])} is viable at Scenario C cost but is held back until the company is profitable. Today's prototype parts cost {inr(ts['prototypePartsCost'])}; ₹2,000 is a volume-production target for the electronics (Scenario C: {inr(sc['C']['electronics'])}), not today's cost.

| Cost line | A · prototype | B · small batch | C · scaled |
|---|---|---|---|
{lines_rows}

| Scenario | COGS | Electronics incl. PCB | Price | Net revenue | Contribution | Gross / contribution margin | Break-even units/month* |
|---|---|---|---|---|---|---|---|
{scen_row('A', sc['A'])}
{scen_row('B', sc['B'])}
{scen_row('C', sc['C'])}

\\*Against Year-3 average fixed costs of {lakh(H['fixedMonthlyY3'])}/month.

Documented: the XIAO nRF52840 Sense list price (Seeed) and MG92B UK retail price. Every other line is an estimate that needs a supplier quotation.

**Price matrix: contribution per unit (clinic channel)**

| Price | A | B | C | Verdict |
|---|---|---|---|---|
{pm_rows}

**Channels at the launch price (Scenario B cost; none validated)**

| Channel | Net revenue | Contribution | Note |
|---|---|---|---|
{ch_rows}

Rental via OT clinics at {inr(A['P11'])}/month nets {inr(ts['rental']['netPerMonth'])} and recovers the device in about {ts['rental']['paybackMonths']} months; refurbishment between renters is not yet costed."""

fs_rows = "\n".join(f"| {k} | {F[k]['grantStatus']} | {lakh(F[k]['requirement'])} | {lakh(F[k]['grant'], 0)} | {lakh(F[k]['equity'])} | {lakh(F[k]['pre'])} | {lakh(F[k]['post'])} | {pct(F[k]['investor'], 1)} | {pct(F[k]['esop'])} | {pct(F[k]['founders'], 1)} | {F[k]['runway']} |" for k in "ABCD")
opt_rows = "\n".join(f"| {lakh(o['pre'], 2)} | {pct(o['investor'], 1)} | {pct(o['founders'], 1)} | {o['basis']} |" for o in V["options"])
bk_rows = "\n".join(f"| {b['factor']} | {lakh(b['value'])} | {b['evidence']} |" for b in V["berkusFactors"])
S["funding"] = f"""## Funding and valuation

**Ask:** {inr(F['C']['equity'])} of equity for Milestone 1 (M1–M6) at a proposed {lakh(V['proposed'], 0)} pre-money. Post-money = P + I = {inr(F['C']['post'])}. Investor = I ÷ post-money = {pct(F['C']['investor'], 2)}. Founders = 100% − investor − {pct(F['C']['esop'])} ESOP = {pct(F['C']['founders'], 2)}. This is separate from Year-1 costs ({lakh(H['costs12'])}) and the total needed to reach profitability ({lakh(H['fullRequirement'])}).

**Valuation methods.** {lakh(V['proposed'], 0)} is a working negotiation target, not an established value.

| Method | Value | Basis |
|---|---|---|
| Cost-to-duplicate (floor) | {lakh(V['floor'], 2)} | {V['personMonths']} person-months × {lakh(V['rate'], 2)} + {lakh(V['materials'], 2)} materials |
| Berkus-style scorecard (max ₹20 L per factor) | {lakh(V['berkus'], 0)} | Table below — judgement scores |
| **Proposed target** | **{lakh(V['proposed'], 0)}** | ≈25% premium over the scorecard for two products and an evaluation under way |

| Berkus factor | Score | Evidence |
|---|---|---|
{bk_rows}

**The same {lakh(F['C']['equity'], 2)} round at each pre-money option**

| Pre-money | Investor | Founders (after 5% ESOP) | Basis |
|---|---|---|---|
{opt_rows}

**Scenarios A–D (all at the proposed pre-money; grant kept separate)**

| Scenario | Grant | Requirement | Grant counted | Equity | Pre | Post | Investor | ESOP | Founders | Covers |
|---|---|---|---|---|---|---|---|---|---|---|
{fs_rows}

Scenario D tranche 2: {lakh(F['D']['tranche2']['equity'])} after the user study. Priced at a cost floor of {lakh(F['D']['tranche2']['pre'])} (tranche-1 post-money + Phase-1 spend), it would leave founders {pct(F['D']['tranche2']['foundersAfterBoth'], 1)} — a worst case. In practice it is priced on the user-study result. A SISFS grant, if awarded, reduces tranche 2.

**Limitations:** person-months are estimated from the repositories (replace with logged hours); the Berkus scores are judgement; no public Indian pre-seed comparables were found for this stage."""

comp_rows = "\n".join(f"| [{c['name']}]({c['source']}) | {c['segment']} | {('US$' + format(c['price'], ',')) if c['currency']=='USD' else inr(c['price'])} (≈{inr(c['inr'])}) | {c['recurring']} | {c['what']} | {c['checked']} |" for c in D["competitors"])
pos = lambda key: "\n".join(f"- **{a}:** {b}" for a, b in K["competitors"][key]["positioning"])
S["competitors"] = f"""## Competitor research

Prices checked {K['competitors']['checked']}. They are benchmarks only and never feed AVERRA's revenue. A device that measures tremor is not the same as one that stabilises the hand, and the comparison respects that.

| Product | Segment | Price | Recurring | What it does | Checked |
|---|---|---|---|---|---|
{comp_rows}

**ParkinSense positioning**
{pos('parkinsense')}

**TremoSense positioning**
{pos('tremosense')}

Caveats: the WHOOP price is a 12-month membership that includes the strap. The Liftware price is a dated 2015 figure. Weighted-utensil prices are US retail; Indian prices were not verified. No claim is made that AVERRA products are more accurate or effective than any competitor; that needs comparative testing."""

risk_rows = "\n".join(f"| {r[0]} | {r[1]} | {r[2]} |" for r in K["risks"])
S["caveats"] = f"""## Technical, regulatory and patent caveats

**Kill / continue (M6, TremoSense user study, n ≥ 10):** continue if median tremor reduction ≥50% and ≥60% would pay at the launch price; pivot to clinic rental if the benefit holds but the price fails; stop TremoSense if the reduction is below 30%.

| Risk | What could go wrong | Trigger / response |
|---|---|---|
{risk_rows}

**Technical:** the current build's ≈90% tremor rejection is a founder-reported bench result; logs are not yet published. The paper prototype's 77.3% is a motorised-simulator result. The public `constants.h` still shows Q, R and K_lqr as 0, so publish the tuned constants before anyone checks the repository. ParkinSense analysis runs on a host, not on the wrist. HR, HRV and SpO₂ are research-grade.

**Clinical:** {K['clinicalEvaluation']['label']} — {K['clinicalEvaluation']['detail']} ParkinSense does not diagnose, predict or clinically detect Parkinson's disease. Early identification is a research path, not a claim; healthy young users are a wellness audience, not a screening population.

**Regulatory assumptions (to confirm):** licensing has been mandatory for medical devices in India since 1 October 2023. TremoSense's class is assumed low-risk pending a CDSCO classification opinion at M4. ParkinSense is sold as a wellness product with no medical claim. GST is 5% for TremoSense and 18% for ParkinSense; both rates depend on HSN classification.

**Patent status:** an application is being prepared; nothing is filed or granted. The code and papers are public, so novelty may be limited to what is not yet disclosed. Co-inventor (and any institutional) assignments are needed before filing. A patent does not stop large companies from designing around it. Licensing, a technology sale or an acquisition are possible future options, not expected outcomes."""

S["viva"] = f"""## Viva questions and answers

1. **Why {lakh(V['proposed'], 0)} and not the {lakh(V['floor'], 2)} floor?** The floor values only the engineering hours. The Berkus-style cross-check credits two working prototypes and gives about {lakh(V['berkus'], 0)}. {lakh(V['proposed'], 0)} is our negotiation target; at the floor, the investor would own {pct(V['options'][0]['investor'], 1)}, and we would accept a price in that range rather than delay Milestone 1.
2. **Isn't a higher valuation just a way to cut dilution?** We didn't use valuation alone: we cut the round to Milestone 1. That keeps dilution near 19% even at the floor. Raising everything up front would cost {pct(F['A']['investor'])}–{pct(F['B']['investor'])}.
3. **How is AVERRA profitable?** Every TremoSense unit is profitable from the first sale ({inr(ue['tremosense']['contribution'])}). Company break-even arrives at {be}, once volume reaches about {sc['C']['breakEvenUnitsPerMonth']:.0f} units a month at verified Scenario C cost. Year 3 makes {lakh(H['y3Profit'])}. The main sensitivities are the cost reduction and clinic volume.
4. **Is ₹2,000 the cost?** No. Prototype parts are {inr(ts['prototypePartsCost'])}. ₹2,000 is a volume target for the electronics (Scenario C {inr(sc['C']['electronics'])}), needing supplier quotes and {lakh(A['C6'])} of tooling.
5. **Why would someone choose ParkinSense over WHOOP or Amazfit?** Not for sleep or battery today; they are better there. The difference is movement-specific insight (tremor burden, motion context) at {inr(A['P3'])} with no mandatory subscription. We have to prove people value it: that's experiment 3.
6. **Why TremoSense over GyroGlove or a weighted spoon?** GyroGlove stabilises the whole hand at about {lakh(D['competitors'][4]['inr'])}. A weighted spoon is cheap but passive. TremoSense actively cancels tremor at the spoon for {inr(ts['launchPrice'])}. We don't claim parity until the user study.
7. **What does ICMR testing show?** Results aren't available yet. We will add them when they're published and make no clinical claim before then.
8. **Your repository differs from your paper.** Yes: the repository is the newer build. It moves to Zephyr at 208 Hz with higher-torque servos and reaches about 90% bench rejection against 77.3% for the paper prototype. Publishing those logs is the M3 milestone.
9. **What makes the technology defensible?** Today, the integrated signal chain and the evidence we generate. Possibly a patent later, but the public disclosures limit novelty.
10. **What would prove the products are better?** For TremoSense, a controlled self-feeding study against a weighted spoon. For ParkinSense, accuracy against reference instruments and the ICMR results.
11. **LTV:CAC?** TremoSense {ue['tremosenseLtv']['ltvCac']:.1f}×, ParkinSense {ue['parkinsenseLtv']['ltvCac']:.1f}×. Both are estimates without customers; experiment 1 measures real CAC.
12. **What if the grant is refused?** Milestone 1 doesn't depend on it. The grant would only reduce the later raise."""

S["checklist"] = """## Missing-evidence checklist

- [ ] Verbatim, consented customer-interview quotes for the three placeholders.
- [ ] ICMR evaluation: study reference, ethics approval and results. Update `data/content.json → clinicalEvaluation` when they return.
- [ ] Bench logs and video for the current TremoSense build's ≈90% result (state the test conditions: frequencies, amplitude, axis), plus the tuned Q/R/K_lqr in the public `constants.h` and an updated README.
- [ ] A photo of the paper's MG92B build to replace the bench-rig frame.
- [ ] Supplier quotes for Scenario B and C components, PCB assembly and tooling.
- [ ] Logged hours to replace estimated person-months in the cost-to-duplicate valuation.
- [ ] CDSCO classification opinion and GST/HSN confirmation.
- [ ] Patent attorney novelty opinion and signed inventor assignments.
- [ ] Founders' agreement (equity split, vesting).
- [ ] "AVERRA" company-name and trademark availability check.
- [ ] Rehearsal in PowerPoint 365 for Morph timing; aim for 11–12 minutes.
- [ ] ParkinSense repository fixes: missing Android/hardware/research folders and LICENSE; runnable tests; packet-size wording."""

S["sources"] = "## Sources\n\n" + "\n".join(f"- [{s['label']}]({s['url']})" for s in D["sources"])

out = ROOT / "docs"; out.mkdir(exist_ok=True)
order = ["summary", "evidence", "script", "financials", "pricing", "funding", "competitors", "caveats", "viva", "checklist", "sources"]
(out / "COMPANION_GUIDE.md").write_text("# AVERRA — Pitch Companion Guide\n\nAs of 12 October 2026 · Pranshu Kumar\n\n" + "\n\n".join(S[k] for k in order) + "\n")
print("guide written:", sum(len(S[k]) for k in order), "chars")
