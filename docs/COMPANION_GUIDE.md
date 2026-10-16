# AVERRA — Pitch Companion Guide

As of 12 October 2026 · Pranshu Kumar

## Summary of changes

AVERRA replaces Kampa Labs everywhere. The pitch now shows a profitable plan, a smaller first round and a stated valuation range. Every number below comes from `model/AVERRA_Financial_Model.xlsx` through `data/averra-data.json`, the same file the deck and website read.

| Area | Before | Now |
|---|---|---|
| Company | Kampa Labs | AVERRA — *Engineering better movement intelligence.* |
| ParkinSense | Clinical PD monitor | Wellness wearable with movement intelligence; clinical evaluation with ICMR in progress (founder-reported, results pending) |
| TremoSense price | ₹9,999, one cost case | ₹9,999 launch at small-batch cost; ₹8,999 from M19 after verified cost reduction; three cost scenarios |
| Plan horizon | 18 months, not profitable | 36 months; sustained operating break-even M23 (May 2029); Year-3 operating profit ₹18.9 L |
| First round | ₹10.51 L at the ₹44.75 L cost floor (19%) | ₹10.51 L for Milestone 1 at ₹75 L proposed pre-money (12.3%) |
| Pitch | 15 slides, 10:20 | 14 slides, about 12:05 (1815 words) |
| TremoSense result | Paper figure | ≈90% bench rejection on the current build (founder-reported) |
| Closing page | Risks | Competitive advantage vs tremor aids and wearables; risks kept in this guide |
| New | — | Competitor analysis, repository audit, logo set, Vercel presentation website |

The institute reference has been removed from every deliverable.

## Evidence matrix and repository audit

Both products work on a bench. TremoSense has not been used by anyone with tremor. ParkinSense is in a clinical evaluation with ICMR that the founders report is in progress; no results exist yet. The repositories, not the papers, are treated as the source of truth.

**ParkinSense feature status** (repository `develop` branch)

| Feature | Status | Evidence / gap |
|---|---|---|
| BLE streaming at 104 Hz, 10-sample packets | Bench-tested | No packet loss in multi-hour bench sessions (paper) |
| Steps, cadence, distance, active minutes | Bench-tested | 4/4 step-gating conditions correct; no accuracy figure vs a reference pedometer |
| Tremor score, frequency, burden, rest index | Bench-tested | Correct on a motorised 5 Hz fixture; not tested on people with PD |
| Motion context (rest / low motion / active) | Bench-tested | 4/4 bench conditions correct |
| Heart rate, HRV (RMSSD, SDNN, pNN50), SpO₂ | Implemented | Research-grade; never compared with a reference oximeter or ECG |
| Skin-contact deep sleep, ≈7 mA active | Bench-tested | Measured on a Nordic PPK II; ≈100 h runtime is an estimate |
| Dashboard (engineering + clinical views), replay | Implemented | Python / Plotly Dash |
| Clinical evaluation with ICMR | In progress | In progress (founder-reported); results pending — no clinical claim until results are published |
| Mobile companion app | Partial / in development | In development; not in the public repository |
| Processing on the wearable itself | Needs hardware, firmware or validation | Today all analysis runs on the host, not the wrist |
| Sleep, recovery, activity-type, calories, VO₂ max | Planned | Roadmap items in the README |
| Battery-level monitoring, cloud sync, OTA updates | Planned | Roadmap items |
| Bradykinesia / dyskinesia, longitudinal movement trends | Future research | Needs labelled data and validation |
| Early identification of Parkinson's-related movement change | Future research | A research ambition — not a diagnostic capability |

**TremoSense: current build (public repository) vs paper prototype**

| Item | Current build | Paper prototype |
|---|---|---|
| Firmware | Zephyr RTOS, multi-threaded | Arduino framework, single loop |
| Estimator | 2-state EKF (roll, pitch) + calibration offsets | 4-state EKF with gyro-bias tracking |
| Sampling | IMU data-ready at 208 Hz | 100 Hz, 10 ms loop |
| Servos / power | MG995 + FS90MG (higher torque); bench-powered | 2 × MG92B, XL6009, 1250 mAh LiPo |

**Other inconsistencies**
- ParkinSense README says 248-byte packets; the paper and the firmware struct imply 208 bytes.
- ParkinSense README describes `Android/`, `hardware/`, `research/` and a LICENSE that are not in the repository.
- ParkinSense `tests/` files run as scripts; pytest collects 0 tests.
- The ParkinSense paper says analysis is "on-device"; in the code it runs in the host runtime, and the firmware only streams.
- The TremoSense paper cites `github.com/rkt-1597/Tremosense`; the live repository is `TremoSense-Project`.

**Evidence needed before commercialisation:** bench logs and video for the current TremoSense build's ≈90% result; a self-feeding user study (n ≥ 10); ParkinSense accuracy against reference instruments; the ICMR evaluation results; EMC/electrical-safety pre-compliance; the CDSCO classification opinion.

## Speaking script and timings

The script runs about 12 min 5 s (1815 words, about 150 words a minute including click pauses), inside the 10–12 minute target. The same text sits in each slide's notes and in the website's presenter panel (press N).

| Slide | Topic | Time | Length |
|---|---|---|---|
| 1 | AVERRA | 0:00–0:35 | 35 s |
| 2 | Problem | 0:35–1:15 | 40 s |
| 3 | Why now | 1:15–1:45 | 30 s |
| 4 | One company, two products | 1:45–2:20 | 35 s |
| 5 | ParkinSense | 2:20–3:10 | 50 s |
| 6 | TremoSense | 3:10–3:55 | 45 s |
| 7 | Technical architecture | 3:55–4:25 | 30 s |
| 8 | Competition | 4:25–5:10 | 45 s |
| 9 | Market | 5:10–5:55 | 45 s |
| 10 | MVP & validation | 5:55–6:45 | 50 s |
| 11 | Business model | 6:45–7:20 | 35 s |
| 12 | Pricing & unit economics | 7:20–8:15 | 55 s |
| 13 | Financial outlook | 8:15–9:05 | 50 s |
| 14 | Team & growth | 9:05–9:45 | 40 s |
| 15 | Funding ask & valuation | 9:45–10:40 | 55 s |
| 16 | Use of funds & milestones | 10:40–11:25 | 45 s |
| 17 | Competitive advantage & close | 11:25–12:05 | 40 s |

**1. AVERRA** (35 s)

Good morning. I'm Pranshu Kumar, and this is my co-founder Pawan Shinde. Together we're building AVERRA. Our line is: engineering better movement intelligence. AVERRA is a biomedical technology company. We turn precise movement sensing into products people can use every day, at prices built for India. We start with two: ParkinSense measures and helps people understand movement, and TremoSense assists people who already live with tremor. I'll take you through the problem, our products and the competition. Pawan will then take you through the market, our validation, the numbers and exactly what we're asking for.

**2. Problem** (40 s)

Start with the people. About 4.6 lakh Indians over sixty live with Parkinson's, and roughly 12.8 lakh more have essential tremor, though that second figure comes from a single study. Two things fail them. Their movement is measured for a few minutes in a clinic, then not at all. And at home, a tremor of four to twelve hertz turns a spoon into a spill. Published research backs this up. A 2021 study calls a clinic visit "only a snapshot" of symptoms. The statement people with essential tremor agreed with most was: "I am embarrassed by my tremor when I try to eat or drink in public." And in a study from southern India, 73 of 100 Parkinson's caregivers reported severe burden.

**3. Why now** (30 s)

Why now? Five dated shifts. Apple opened a movement-disorder API in 2018, and an Apple Watch Parkinson's monitor was FDA-cleared in 2022, so wrist-based monitoring has a regulatory path. India made device licensing mandatory in 2023, so we can now plan and cost approval end to end. And India's over-sixty population is set to more than double by 2050. The hardware is no longer the barrier: the chip at the heart of both products costs about sixteen dollars. Validation is. And this window won't stay open if global brands add tremor features first.

**4. One company, two products** (35 s)

So here is AVERRA: one company with two complementary products. ParkinSense is a general wellness wearable for anyone, young or old. It tracks activity and vitals, and its standout feature is tremor detection. TremoSense is assistive: it physically stabilises a spoon for someone whose tremor gets in the way of eating. They serve different people and different buyers. What they share is real: the same Nordic microcontroller family, the same six-axis IMU, the same signal-processing skills and the same team. We claim no shared revenue or cost savings beyond that.

**5. ParkinSense** (50 s)

ParkinSense works like a fitness band. You wear it on the wrist, it senses your movement and heart, and it streams that over Bluetooth to our software, which shows the results on a live dashboard. These are the real prototype and the real dashboard, here reading a tremor at 4.88 hertz. It tracks steps, activity, heart rate, HRV and blood oxygen. What makes it different is tremor detection: a tremor score, its frequency and how much of the day it lasts. And it knows when you're resting, so tremor is never counted as steps. Where are we? Steps, tremor detection and rest-versus-movement are bench-tested. Heart rate and the dashboard work but need validation, the mobile app is in progress, and a clinical evaluation with ICMR is under way, with results pending. It is a wellness product; it does not diagnose Parkinson's.

**6. TremoSense** (45 s)

TremoSense is for people who already have tremor. This is the real build on the bench: as the handle shakes, the head stays steady. On a motorised tremor simulator at four, six and eight hertz, the current build rejects about 90 percent of tremor. It runs a real-time operating system, samples at 208 hertz and uses higher-torque servos. The figure is founder-reported, and we'll publish the bench logs alongside the code. Two people with tremor have tried it so far. That is encouraging, but it is not yet a study.

**7. Technical architecture** (30 s)

Briefly, how both work. They start from the same physics: separate slow voluntary motion from tremor at four to twelve hertz. In ParkinSense, the band streams motion and pulse data, and our software runs three pipelines, with a motion-context classifier that stops tremor being counted as steps. In TremoSense, an IMU in the handle feeds a Kalman filter that estimates roll and pitch, and an LQR controller drives two servos that counter-rotate the spoon head, all within milliseconds.

**8. Competition** (45 s)

Competitors, with Indian prices checked this month. ParkinSense's direct rivals are screenless bands. WHOOP One costs ₹20,890 a year, Garmin's Cirqa ₹25,990, Google's Fitbit Air ₹13,999, and Amazfit's Helio Strap ₹12,000 to fifteen thousand. They are excellent at sleep, recovery and battery life. None offers tremor detection, and ParkinSense costs less than all of them. For tremor assistance, one GyroGlove costs about 5.6 lakh rupees, imported active spoons sell in India for 0.4 lakh to 0.6 lakh rupees, and a weighted spoon is cheap but passive. TremoSense is an active spoon at a quarter of the cheapest import. We don't yet claim it performs as well; the user study tests that. Over to Pawan.

**9. Market** (45 s)

Thank you, Pranshu. We sized the market bottom-up, product by product. TremoSense: Parkinson's plus essential tremor patients, half with tremor that disrupts eating, about 8.7 lakh people. At the launch price spread over a three-year life, that's ₹275.7 Cr a year. ParkinSense's first beachhead, households living with Parkinson's, adds ₹141.3 Cr. Filtering to urban patients under neurologist care gives a SAM of ₹51.9 Cr, and our year-three SOM, built from 30 clinics plus online, is about ₹109 L. As a general wearable the upside is far larger: India bought 3.5 crore smartwatches in 2024. Winning just 0.25 to 1 percent of premium buyers would mean ₹75.2 L to ₹3.0 Cr a year. We show it as upside only; it is not in our plan.

**10. MVP & validation** (50 s)

What has the MVP proven? Both products work on the bench. Two people with tremor have tried TremoSense informally, and ParkinSense is in a clinical evaluation with ICMR. Our bench tests had no preregistered metric, and we want to be upfront about that. So we've set the thresholds before the study. At month six, at least ten people with tremor do a self-feeding task. If median tremor reduction is 50 percent or more and at least 60 percent would pay, we persevere. Between 30 and 50 percent, we redesign and re-test once. Below 30 percent, we kill TremoSense and focus on ParkinSense. If it works but fewer than 60 percent would pay, we pivot to clinic rental. For ParkinSense, the pass mark is dominant-frequency error within 5 percent of a reference device and zero false steps during tremor.

**11. Business model** (35 s)

The business model. Clinicians and occupational therapists bring us patients; families buy the device. There are four revenue streams: research kits for labs from month ten, which need no medical claim; TremoSense as a sale or rental from month twelve; and from month twenty-five the ParkinSense device and its optional subscription. In year three that's ₹2.12 Cr of cash in, most of it from TremoSense. We assume no reimbursement. All revenue is out-of-pocket or institutional.

**12. Pricing & unit economics** (55 s)

What one sale earns. A TremoSense at ₹9,999: take out 5 percent GST and a 15 percent clinic margin, and we net ₹8,094. At small-batch cost of ₹4,830, after warranty and shipping, we keep ₹2,538, a 31% contribution margin. Every unit is profitable from the first sale. Once tooling brings cost to ₹2,720, we cut the price to ₹8,999 and still earn more per unit. A ParkinSense at ₹7,999, after 18 percent GST and online fees, nets ₹6,101 and keeps ₹1,982. The optional plan lifts lifetime value to ₹3,011. CAC is about ₹1,079 for TremoSense, an LTV to CAC of 3.3; ParkinSense reaches 2.0, positive but thinner.

**13. Financial outlook** (50 s)

The plan starts in July 2027 and runs three years. Every line comes from our financial model. Phase one, the first six months, is about proof: the user study, the patent filing and a regulatory opinion. It costs ₹8.8 L. Phase two launches TremoSense, with first sales in month twelve, and year three scales the clinic network and launches ParkinSense. Year-one costs are ₹31.6 L, a gross burn of about ₹2.63 L a month. Year two still loses 10.4 lakh rupees as volume builds. We reach sustained operating break-even in month 23, May 2029, and year three makes an operating profit of ₹18.9 L on ₹2.1 Cr of cash in. Getting there needs ₹48.2 L in total, and that number shapes our ask.

**14. Team & growth** (40 s)

We are both hardware engineers, and we stay the hardware and test engineers ourselves. Pranshu built ParkinSense and co-built TremoSense; he leads the company and the wearable hardware. I co-built TremoSense and lead control and power electronics. Our gap is commercial, so from month nineteen we hire a clinic sales lead and customer support, and in month twenty-five an app and firmware engineer. The equity split will be set in a founders' agreement. Growth runs through clinics: from a thousand caregivers reached, we target a quarter trying the device and 40 percent of those buying. These are targets, not data, and three experiments test them first.

**15. Funding ask & valuation** (55 s)

Now the ask. Reaching profitability needs ₹48.2 L, but today we raise only for milestone one: ₹10,51,171. We propose a pre-money valuation of ₹75 L, a working target to negotiate. Cost to duplicate gives a floor of ₹44.75 L, and a Berkus-style scorecard gives about ₹60 L. Post-money is P plus I, ₹85,51,171, so the investor owns I over post-money: 12.3%. After a 5 percent ESOP pool, we keep 82.7%. After this round, a second tranche of ₹37.7 L has to close by month seven, January 2028, priced on the user-study result. If it is late, we pause hiring, inventory and testing, and the buffer covers about eight months of basic costs. The Startup India grant is applied for, not counted.

**16. Use of funds & milestones** (45 s)

Here's what the money buys. About ₹2.7 L keeps both of us full-time for six months, ₹1.6 L builds the study units and runs the user study, and ₹2.5 L covers prototypes, tools and the patent. We plan to file a provisional patent in month two, build study units in month three, and in month six the user study decides kill or continue. If we continue, tranche two funds EMC testing, the CDSCO filing and a pilot batch, first sales in month twelve, and break-even in month 23. Why could this fail? Bench results may not turn into easier eating with real food and real hands. That is exactly what the month-six study tests.

**17. Competitive advantage & close** (40 s)

So why will people choose AVERRA? TremoSense is an active spoon at about a quarter of an imported one, built and serviced in India, and it actively cancels tremor where a weighted spoon only adds mass. ParkinSense is the only screenless band here that measures tremor, at ₹7,999 once, with no mandatory subscription. AVERRA: engineering better movement intelligence. We're asking for ₹10.5 L at a ₹75 L pre-money, 12.3%, to reach a clear yes-or-no on a product that's profitable on every unit. Thank you.

## Financial workings

All figures are live formulas in the workbook; blue cells are inputs and yellow cells are assumptions to confirm.

**Market (bottom-up, India)**
- People with PD aged 60+: 149M × 308.9 per lakh = 460,261. People with ET: 1,276,575 (single rural study).
- TremoSense TAM customers = (PD + ET) × 50% eating-disruptive = 868,418 × ₹3,174/yr = ₹275.7 Cr.
- ParkinSense beachhead (PD households) = 460,261 × ₹3,069/yr = ₹141.3 Cr.
- ParkinSense as a general wearable (upside, not in plan totals): 35.0M smartwatch buyers/yr (IDC 2024) × ₹3,069 = ₹10742 Cr TAM; SAM = 2.8% advanced/premium share = ₹300.8 Cr; SOM = 0.25% of SAM customers (plan case) = ₹75.2 L; upside cases 0.5% = ₹1.5 Cr and 1% = ₹3.0 Cr. The forecast sells far fewer ParkinSense units, so even the plan case is above it.
- SAM = TAM customers × 31.1% urban × 40% under follow-up → ₹51.9 Cr. Year-3 SOM from channel capacity → ₹109.0 L (TremoSense 2,040/yr; ParkinSense 1,440/yr).

**Unit economics**

| | TremoSense (launch) | ParkinSense device |
|---|---|---|
| Price incl. GST | ₹9,999 | ₹7,999 |
| Net revenue after GST and channel | ₹8,094 | ₹6,101 |
| COGS | ₹4,830 | ₹3,530 |
| Gross margin | 40% | 42% |
| Contribution (after warranty, fulfilment) | ₹2,538 (31%) | ₹1,982 (32%) |
| CAC | ₹1,079 (plan outreach ÷ units) | ₹1,500 (assumption) |
| LTV / LTV:CAC | ₹3,553 / 3.3× | ₹3,011 / 2.0× |
| Payback | first sale | first sale |

**36-month cash plan (M1 = July 2027)**

| Period | Cash in | Cash costs | Operating cash flow |
|---|---|---|---|
| Year 1 (Jul 2027–Jun 2028) | ₹2.3 L | ₹31.6 L | -₹29.3 L |
| Year 2 | ₹53.1 L | ₹63.6 L | -₹10.4 L |
| Year 3 | ₹212.3 L | ₹193.3 L | ₹18.9 L |

- Year-1 gross burn ₹2.63 L/month; Phase 1 (M1–M6) costs ₹8.8 L.
- Volumes: TremoSense 695 units in Year 2 and 1890 in Year 3 (≤ SOM); ParkinSense 1380 in Year 3, launched M25.
- Levers to profitability, all shown in the model: verified Scenario C cost and tooling at M18; ₹8,999 price from M19; clinic-network growth to SOM capacity.
- Peak cumulative gap ₹40.2 L at M22 Apr-29; requirement to profitability = gap × 1.2 = ₹48.2 L.
- Sustained break-even M23 (May 2029); Year-3 operating profit ₹18.9 L (8.9%); month-36 profit ₹2.9 L.
- Cash basis: inventory is expensed when bought; no depreciation, tax or working-capital timing beyond that.

## TremoSense pricing

**Recommendation:** launch at ₹9,999 (small-batch cost); move to ₹8,999 from M19 once supplier quotes and tooling verify Scenario C cost. ₹6,999 is viable at Scenario C cost but is held back until the company is profitable. Today's prototype parts cost ₹4,062; ₹2,000 is a volume-production target for the electronics (Scenario C: ₹1,950), not today's cost.

| Cost line | A · prototype | B · small batch | C · scaled |
|---|---|---|---|
| MCU + IMU (XIAO nRF52840 Sense → bare module in C) | ₹1,522 | ₹1,330 | ₹520 |
| Servos ×2 (MG92B → direct-sourced micro servos in C) | ₹1,600 | ₹1,400 | ₹500 |
| Power: XL6009 boost converter + 1250 mAh LiPo | ₹570 | ₹470 | ₹380 |
| Interconnect: 1500 µF capacitor, wiring, connectors (→ carrier PCB in B → integrated PCBA in C) | ₹120 | ₹280 | ₹550 |
| Enclosure, gimbal & food-safe spoon head | ₹250 | ₹600 | ₹350 |
| Assembly labour | ₹500 | ₹400 | ₹200 |
| Testing & quality control | ₹150 | ₹200 | ₹120 |
| Packaging + manual | ₹150 | ₹150 | ₹100 |

| Scenario | COGS | Electronics incl. PCB | Price | Net revenue | Contribution | Gross / contribution margin | Break-even units/month* |
|---|---|---|---|---|---|---|---|
| A · Prototype / very low volume | ₹4,862 | ₹3,812 | ₹9,999 | ₹8,094 | ₹2,221 | 40% / 27% | 227 |
| B · Small batch (100–500) | ₹4,830 | ₹3,480 | ₹9,999 | ₹8,094 | ₹2,538 | 40% / 31% | 198 |
| C · Scaled, after verified reductions | ₹2,720 | ₹1,950 | ₹8,999 | ₹7,285 | ₹3,886 | 63% / 53% | 130 |

\*Against Year-3 average fixed costs of ₹5.0 L/month.

Documented: the XIAO nRF52840 Sense list price (Seeed) and MG92B UK retail price. Every other line is an estimate that needs a supplier quotation.

**Price matrix: contribution per unit (clinic channel)**

| Price | A | B | C | Verdict |
|---|---|---|---|---|
| ₹4,999 | -₹1,446 (-36%) | -₹1,272 (-31%) | ₹839 (21%) | Thin even at C |
| ₹5,999 | -₹713 (-15%) | -₹510 (-10%) | ₹1,601 (33%) | Viable only after verified C cost |
| ₹6,999 | ₹21 (0%) | ₹252 (4%) | ₹2,363 (42%) | Viable only after verified C cost |
| ₹7,999 | ₹754 (12%) | ₹1,014 (16%) | ₹3,124 (48%) | Viable only after verified C cost |
| ₹8,999 | ₹1,487 (20%) | ₹1,776 (24%) | ₹3,886 (53%) | Viable only after verified C cost |
| ₹9,999 | ₹2,221 (27%) | ₹2,538 (31%) | ₹4,648 (57%) | Viable at small batch |
| ₹12,999 | ₹4,421 (42%) | ₹4,824 (46%) | ₹6,934 (66%) | Viable at small batch |

**Channels at the launch price (Scenario B cost; none validated)**

| Channel | Net revenue | Contribution | Note |
|---|---|---|---|
| Direct online | ₹9,523 | ₹3,966 (42%) | No channel margin; pays its own CAC |
| Clinic partnership | ₹8,094 | ₹2,538 (31%) | 15% margin to clinic |
| Occupational-therapy centres | ₹8,094 | ₹2,538 (31%) | Same terms as clinics |
| Institutional procurement | ₹8,571 | ₹3,014 (35%) | 10% discount, 60-day terms |
| No-cost EMI (direct) | ₹9,123 | ₹3,566 (39%) | Subvention borne by AVERRA |

Rental via OT clinics at ₹799/month nets ₹576 and recovers the device in about 9.3 months; refurbishment between renters is not yet costed.

## Funding and valuation

**Ask:** ₹10,51,171 of equity for Milestone 1 (M1–M6) at a proposed ₹75 L pre-money. Post-money = P + I = ₹85,51,171. Investor = I ÷ post-money = 12.29%. Founders = 100% − investor − 5% ESOP = 82.71%. This is separate from Year-1 costs (₹31.6 L) and the total needed to reach profitability (₹48.2 L).

**Valuation methods.** ₹75 L is a working negotiation target, not an established value.

| Method | Value | Basis |
|---|---|---|
| Cost-to-duplicate (floor) | ₹44.75 L | 34 person-months × ₹1.25 L + ₹2.25 L materials |
| Berkus-style scorecard (max ₹20 L per factor) | ₹60 L | Table below — judgement scores |
| **Proposed target** | **₹75 L** | ≈25% premium over the scorecard for two products and an evaluation under way |

| Berkus factor | Score | Evidence |
|---|---|---|
| Sound idea (product risk) | ₹15.0 L | Sourced need; two products; no interviews yet |
| Prototype (technology risk) | ₹20.0 L | Two working prototypes with measured bench results |
| Quality team (execution risk) | ₹12.5 L | Strong technical record and papers; no commercial track record |
| Strategic relationships (market risk) | ₹10.0 L | ICMR evaluation in progress (founder-reported); no clinic partners yet |
| Product rollout / sales (production risk) | ₹2.5 L | Costed BOM and pricing; no sales |

**The same ₹10.51 L round at each pre-money option**

| Pre-money | Investor | Founders (after 5% ESOP) | Basis |
|---|---|---|---|
| ₹44.75 L | 19.0% | 76.0% | Floor: cost-to-duplicate |
| ₹60.00 L | 14.9% | 80.1% | Conservative ≈ Berkus cross-check |
| ₹75.00 L | 12.3% | 82.7% | PROPOSED working target |
| ₹100.00 L | 9.5% | 85.5% | Ambitious — only if substantiated |

**Scenarios A–D (all at the proposed pre-money; grant kept separate)**

| Scenario | Grant | Requirement | Grant counted | Equity | Pre | Post | Investor | ESOP | Founders | Covers |
|---|---|---|---|---|---|---|---|---|---|---|
| A | Awarded (assumed in this scenario only) | ₹48.2 L | ₹20 L | ₹28.2 L | ₹75.0 L | ₹103.2 L | 27.3% | 5% | 67.7% | To operating break-even + buffer |
| B | Refused | ₹48.2 L | ₹0 L | ₹48.2 L | ₹75.0 L | ₹123.2 L | 39.1% | 5% | 55.9% | To operating break-even + buffer |
| C | Not assumed | ₹10.5 L | ₹0 L | ₹10.5 L | ₹75.0 L | ₹85.5 L | 12.3% | 5% | 82.7% | M1–M6 + buffer (Milestone 1) |
| D | Applied; counted only if awarded | ₹10.5 L | ₹0 L | ₹10.5 L | ₹75.0 L | ₹85.5 L | 12.3% | 5% | 82.7% | M1–M6 now; rest to break-even from tranche 2 / grant |

Scenario D tranche 2: ₹37.7 L after the user study. Priced at a cost floor of ₹94.3 L (tranche-1 post-money + Phase-1 spend), it would leave founders 59.1% — a worst case. In practice it is priced on the user-study result. A SISFS grant, if awarded, reduces tranche 2.

**Limitations:** person-months are estimated from the repositories (replace with logged hours); the Berkus scores are judgement; no public Indian pre-seed comparables were found for this stage.

## Competitor research

Prices checked 16 Oct 2026. They are benchmarks only and never feed AVERRA's revenue. A device that measures tremor is not the same as one that stabilises the hand, and the comparison respects that.

| Product | Segment | Price | Recurring | What it does | Checked |
|---|---|---|---|---|---|
| [WHOOP One (WHOOP 5.0)](https://www.whoop.in/pages/whoop-devices) | Screenless band | ₹20,890 (≈₹20,890) | Price includes a 12-month membership (MRP ₹21,990); renews yearly | Screenless strap; recovery, sleep, strain, HRV; 14+ day battery | 12 Oct 2026 |
| [Garmin Cirqa](https://www.businesstoday.in/technology/news/story/garmin-cirqa-launched-in-india-at-rs25990-this-screen-free-smart-band-can-track-80-activities-560058-2026-10-07) | Screenless band | ₹25,990 (≈₹25,990) | No subscription needed; Connect+ optional | HR, HRV, Pulse Ox, sleep, VO2 max, skin temperature, 80+ activities; up to 10 days (launched in India 7 Oct 2026) | 12 Oct 2026 |
| [Amazfit Helio Strap](https://in.amazfit.com/products/helio-strap) | Screenless band | ₹12,000 (≈₹12,000) | No subscription needed | Continuous HR, sleep and recovery (BioCharge), 27 exercise modes; up to 10 days. Available from sellers at ₹12,000–15,000; official store lists ₹8,999 (MRP ₹17,999) but shows sold out (16 Oct 2026) | 12 Oct 2026 |
| [Google Fitbit Air](https://www.freepressjournal.in/tech/google-fitbit-air-launched-in-india-at-13999-price-specifications) | Screenless band | ₹13,999 (≈₹13,999) | 3-month Google Health Premium trial, then optional | HR, HRV, SpO2, sleep stages, irregular-rhythm alerts; up to 7 days (India from 2 Oct 2026) | 12 Oct 2026 |
| [GyroGlove](https://techguide.parkinsons.org.uk/catalogue/gyro-glove) | Hand stabiliser (one hand) | US$5,899 (≈₹5,64,593) | Or $246/month × 24 | Gyroscopic wrist stabiliser for the whole hand; 4 h continuous use; no clinical study cited on listing | 12 Oct 2026 |
| [Imported active spoon (desertcart.in)](https://www.desertcart.in/) | Active stabilising utensil | ₹58,480 (≈₹58,480) | None listed | Motorised stabilising spoon for essential tremor, imported; listing price in India (desertcart.in, checked 16 Oct 2026); similar listings ₹35,980 to ₹1,40,386 | 12 Oct 2026 |
| [Weighted soup spoon (225 g)](https://wellbefore.com/products/weighted-soup-spoon) | Passive adaptive utensil | US$55.98 (≈₹5,358) | None | Added mass damps tremor; no electronics. US retail; Indian prices not verified | 12 Oct 2026 |
| [Steady Spoon (imported, desertcart.in)](https://www.desertcart.in/) | Active stabilising utensil | ₹35,980 (≈₹35,980) | None listed | Stabilising spoon handle, imported; lowest active-spoon listing found in India (desertcart.in, checked 16 Oct 2026) | 12 Oct 2026 |

**ParkinSense positioning**
- **They do well:** Screenless bands from WHOOP, Garmin, Google and Amazfit: polished hardware, long battery, sleep and recovery, big app ecosystems.
- **We are building:** A general wearable for anyone whose standout feature is tremor detection: score, frequency, burden and motion context.
- **Accessible value:** A planned price of ₹7,999: below every screenless band here, from the Helio Strap (₹12,000) to Garmin Cirqa (₹25,990), with no mandatory subscription.
- **Still to prove:** Accuracy against reference devices (ICMR evaluation results pending), battery life, sleep features, and that people value movement insight.

**TremoSense positioning**
- **The problem:** Active tremor aids are imported and priced for other markets: active spoons cost ₹35,980 to ₹58,480 in India; one GyroGlove ≈ ₹5.6 L.
- **Our opportunity:** An Indian-built active spoon at a ₹9,999 planned price, serviced locally through clinics.
- **What it does today:** ≈90% tremor rejection on the bench with the current build; a spoon, not a whole-hand device.
- **Still to prove:** User benefit in real eating, durability, comfort, and parity with imported active spoons.

Caveats: the WHOOP price includes a 12-month membership that renews. Imported active-spoon prices are desertcart.in listings (checked 16 Oct 2026). Weighted-utensil prices are US retail; Indian prices were not verified. No claim is made that AVERRA products are more accurate or effective than any competitor; that needs comparative testing.

## Technical, regulatory and patent caveats

**Kill / continue (M6, TremoSense user study, n ≥ 10):** continue if median tremor reduction ≥50% and ≥60% would pay at the launch price; pivot to clinic rental if the benefit holds but the price fails; stop TremoSense if the reduction is below 30%.

| Risk | What could go wrong | Trigger / response |
|---|---|---|
| Clinical evidence | ICMR evaluation results are pending and may not support ParkinSense's movement metrics | Publish results as they come; no clinical claim until then; refocus ParkinSense on wellness if accuracy falls short |
| Clinical | Bench rejection may not help a person eating | Continue if median reduction ≥50% and ≥60% would pay; pivot to clinic rental if benefit holds but price fails; stop TremoSense if <30% |
| Technical | The current build's ≈90% bench result is founder-reported; logs and tuned constants are not yet public | Publish bench logs, video and tuned firmware constants by M3 |
| Commercial | Company break-even needs ≈130 TremoSense units/month at C cost (plan: 130–185 in Year 3) | Continue only if experiment 1 shows ≥30% trial-to-purchase |
| Regulatory | Device class may be higher than assumed | Classification opinion by M4; re-plan budget if Class B or above |
| IP | Public repos and papers limit novelty | Attorney novelty opinion by M2; if weak, rely on evidence and execution |
| Funding | SISFS grant may be refused | Grant only reduces tranche 2; Milestone 1 does not depend on it |

**Technical:** the current build's ≈90% tremor rejection is a founder-reported bench result; logs are not yet published. The public `constants.h` still shows Q, R and K_lqr as 0, so publish the tuned constants before anyone checks the repository. ParkinSense analysis runs on a host, not on the wrist. HR, HRV and SpO₂ are research-grade.

**Clinical:** Clinical evaluation in progress with ICMR — Founder-reported; protocol, site and results not yet available. ParkinSense does not diagnose, predict or clinically detect Parkinson's disease. Early identification is a research path, not a claim; healthy young users are a wellness audience, not a screening population.

**Regulatory assumptions (to confirm):** licensing has been mandatory for medical devices in India since 1 October 2023. TremoSense's class is assumed low-risk pending a CDSCO classification opinion at M4. ParkinSense is sold as a wellness product with no medical claim. GST is 5% for TremoSense and 18% for ParkinSense; both rates depend on HSN classification.

**Patent status:** an application is being prepared; nothing is filed or granted. The code and papers are public, so novelty may be limited to what is not yet disclosed. Co-inventor (and any institutional) assignments are needed before filing. A patent does not stop large companies from designing around it. Licensing, a technology sale or an acquisition are possible future options, not expected outcomes.

## Viva questions and answers

1. **Why ₹75 L and not the ₹44.75 L floor?** The floor values only the engineering hours. The Berkus-style cross-check credits two working prototypes and gives about ₹60 L. ₹75 L is our negotiation target; at the floor, the investor would own 19.0%, and we would accept a price in that range rather than delay Milestone 1.
2. **Isn't a higher valuation just a way to cut dilution?** We didn't use valuation alone: we cut the round to Milestone 1. That keeps dilution near 19% even at the floor. Raising everything up front would cost 27%–39%.
3. **How is AVERRA profitable?** Every TremoSense unit is profitable from the first sale (₹2,538). Company break-even arrives at M23 (May 2029), once volume reaches about 130 units a month at verified Scenario C cost. Year 3 makes ₹18.9 L. The main sensitivities are the cost reduction and clinic volume.
4. **Is ₹2,000 the cost?** No. Prototype parts are ₹4,062. ₹2,000 is a volume target for the electronics (Scenario C ₹1,950), needing supplier quotes and ₹7.0 L of tooling.
5. **Why would someone choose ParkinSense over WHOOP or Amazfit?** Not for sleep or battery today; they are better there. The difference is movement-specific insight (tremor burden, motion context) at ₹7,999 with no mandatory subscription. We have to prove people value it: that's experiment 3.
6. **Why TremoSense over GyroGlove or a weighted spoon?** GyroGlove stabilises the whole hand at about ₹5.6 L. A weighted spoon is cheap but passive. TremoSense actively cancels tremor at the spoon for ₹9,999. We don't claim parity until the user study.
7. **What does ICMR testing show?** Results aren't available yet. We will add them when they're published and make no clinical claim before then.
8. **Your repository differs from your paper.** Yes: the repository is the newer build. It moves to Zephyr at 208 Hz with higher-torque servos and reaches about 90% bench rejection on the motorised simulator. Publishing those logs is the M3 milestone.
9. **What makes the technology defensible?** Today, the integrated signal chain and the evidence we generate. Possibly a patent later, but the public disclosures limit novelty.
10. **What would prove the products are better?** For TremoSense, a controlled self-feeding study against a weighted spoon. For ParkinSense, accuracy against reference instruments and the ICMR results.
11. **LTV:CAC?** TremoSense 3.3×, ParkinSense 2.0×. Both are estimates without customers; experiment 1 measures real CAC.
12. **What if the grant is refused?** Milestone 1 doesn't depend on it. The grant would only reduce the later raise.

## Missing-evidence checklist

- [ ] Our own customer-discovery interviews (verbatim, consented) to sit beside the published research quotes on the Problem slide.
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
- [ ] ParkinSense repository fixes: missing Android/hardware/research folders and LICENSE; runnable tests; packet-size wording.

## Sources

- [UNFPA India Ageing Report 2023 (149M aged 60+, 10.5%; 347M by 2050)](https://www.thenationalnews.com/world/asia/2023/09/28/india-un-elderly-population/)
- [Khurana & Gourie-Devi, Cureus 2025;17(3):e80248 — Indian PD community studies](https://pmc.ncbi.nlm.nih.gov/articles/PMC11890171)
- [Chin et al., Mov Disord 2021 — ET in rural Gujarat](https://www.mdsabstracts.org/abstract/prevalence-of-essential-tremors-in-rural-gujarat-india/)
- [BMJ 2025 — PD prevalence 25.2M by 2050](https://bmjgroup.com/cases-of-parkinsons-disease-set-to-reach-25-million-worldwide-by-2050)
- [Michael J. Fox Foundation — Liftware $195 (Nov 2015)](https://www.michaeljfox.org/news/stabilizing-spoon-announces-price-reduction-and-match-program-holidays)
- [Seeed Studio — XIAO nRF52840 Sense $15.90 / $13.90 (10+)](https://www.seeedstudio.com/Seeed-XIAO-BLE-Sense-nRF52840-p-5253.html)
- [The Pi Hut — TowerPro MG92B £8](https://thepihut.com/products/towerpro-servo-motor-mg92b-metal-gear)
- [Startup India Seed Fund Scheme — ₹20 L PoC grant (ClearTax)](https://cleartax.in/s/startup-india-seed-fund-scheme)
- [BIRAC Biotechnology Ignition Grant — up to ₹50 L](https://www.indiascienceandtechnology.gov.in/funding-opportunities/startups/biotechnology-ignition-grant-scheme-big)
- [CDSCO Class A notification (20 Sep 2022)](https://operonstrategist.com/cdsco-notification-for-class-a-medical-devices/)
- [Medical-device licensing mandatory from 1 Oct 2023](https://www.digitalhealthnews.com/cdsco-extends-deadline-for-class-c-d-medical-devices-cos-by-3-months)
- [Apple ResearchKit Movement Disorder API (6 Jun 2018)](https://www.engadget.com/2018-06-06-apple-watch-monitor-parkinsons-symptoms.html)
- [Rune Labs FDA clearance (Jun 2022)](https://9to5mac.com/2022/06/13/apple-watch-parkinsons/)
- [USD/INR 95.71 (12 Oct 2026)](https://tradersunion.com/currencies/price/usd-inr/)
- [WHOOP India memberships: One ₹20,890, Peak ₹27,539 (checked 16 Oct 2026)](https://www.whoop.in/pages/whoop-devices)
- [Garmin Cirqa India launch, ₹25,990 (Business Today, 7 Oct 2026)](https://www.businesstoday.in/technology/news/story/garmin-cirqa-launched-in-india-at-rs25990-this-screen-free-smart-band-can-track-80-activities-560058-2026-10-07)
- [Amazfit Helio Strap India: official ₹8,999 (MRP ₹17,999), sold out; sellers ₹12,000–15,000 (16 Oct 2026)](https://in.amazfit.com/products/helio-strap)
- [Google Fitbit Air India launch, ₹13,999 (Free Press Journal)](https://www.freepressjournal.in/tech/google-fitbit-air-launched-in-india-at-13999-price-specifications)
- [Imported active tremor spoons on desertcart.in: ₹35,980, ₹58,480, ₹1,40,386 (Google Shopping, checked 16 Oct 2026)](https://www.desertcart.in/)
- [GyroGlove listing, Parkinson's UK tech guide (16 Jun 2026)](https://techguide.parkinsons.org.uk/catalogue/gyro-glove)
- [Liftware product range and cited study](https://www.liftware.com/)
- [Weighted soup spoon (WellBefore)](https://wellbefore.com/products/weighted-soup-spoon)
- [TremoSense repository](https://github.com/rkt-1597/TremoSense-Project)
- [ParkinSense repository (develop)](https://github.com/sudo-pranshu/ParkinSense)
- [Hadley, Riley & Heldman, Digital Biomarkers 2021](https://karger.com/dib/article/5/3/206/823097/Real-World-Evidence-for-a-Smartwatch-Based)
- [Most-endorsed item among people with essential tremor; 63.2% found their tremor embarrassing. Kellner et al., J Neurol Sci 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5739080)
- [Parkinson's caregivers, Southern India. Kurupath, Arathil & Bansal, JCDR 2020](https://jcdr.net/ReadXMLFile.aspx?id=14384)
