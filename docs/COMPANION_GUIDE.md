# AVERRA — Pitch Companion Guide

As of 12 October 2026 · Pranshu Kumar

## Summary of changes

AVERRA replaces Kampa Labs everywhere. The pitch now shows a profitable plan, a smaller first round and a stated valuation range. Every number below comes from `model/AVERRA_Financial_Model.xlsx` through `data/averra-data.json`, the same file the deck and website read.

| Area | Before | Now |
|---|---|---|
| Company | Kampa Labs | AVERRA — *Engineering better movement intelligence.* |
| ParkinSense | Clinical PD monitor | Wellness wearable with movement intelligence; clinical evaluation with ICMR in progress (founder-reported, results pending) |
| TremoSense price | ₹9,999, one cost case | ₹9,999 launch at small-batch cost; ₹8,999 from M19 after verified cost reduction; three cost scenarios |
| Plan horizon | 18 months, not profitable | 36 months; sustained operating break-even M26 (Aug 2029); Year-3 operating profit ₹11.7 L |
| First round | ₹10.51 L at the ₹44.75 L cost floor (19%) | ₹10.51 L for Milestone 1 at ₹75 L proposed pre-money (12.3%) |
| Pitch | 15 slides, 10:20 | 14 slides, about 11:55 (1643 words) |
| TremoSense result | 77.3% (paper) | ≈90% bench rejection on the current build (founder-reported); 77.3% kept as the paper-prototype figure |
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
| Bench result | ≈90% tremor rejection (founder-reported; logs to be published) | 77.3% mean rejection, 4/6/8 Hz (Table IV) |
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

The script runs about 11 min 55 s (1643 words, about 138 words a minute including click pauses), inside the 10–12 minute target. The same text sits in each slide's notes and in the website's presenter panel (press N).

| Slide | Topic | Time | Length |
|---|---|---|---|
| 1 | Title | 0:00–0:40 | 40 s |
| 2 | Problem & why now | 0:40–1:35 | 55 s |
| 3 | One company, two products | 1:35–2:20 | 45 s |
| 4 | ParkinSense | 2:20–3:20 | 60 s |
| 5 | TremoSense | 3:20–4:15 | 55 s |
| 6 | Competition | 4:15–5:05 | 50 s |
| 7 | MVP & validation | 5:05–6:05 | 60 s |
| 8 | Market | 6:05–6:50 | 45 s |
| 9 | Business model | 6:50–7:25 | 35 s |
| 10 | Pricing & unit economics | 7:25–8:25 | 60 s |
| 11 | Financial forecast | 8:25–9:20 | 55 s |
| 12 | Team & growth | 9:20–10:05 | 45 s |
| 13 | Funding ask & valuation | 10:05–11:05 | 60 s |
| 14 | Milestones, advantage & close | 11:05–11:55 | 50 s |

**1. Title** (40 s)

Good morning. I'm Pranshu Kumar, and this is my co-founder Pawan Shinde. Together we're building AVERRA. Our line is: engineering better movement intelligence. AVERRA is a biomedical technology company. We turn precise movement sensing into products people can use every day, at prices built for India. We start with two products. ParkinSense measures and helps people understand their movement. TremoSense assists people who already live with tremor. I'll take you through the problem and what we've built and tested. Pawan will then take you through the business, the numbers and exactly what we're asking for.

**2. Problem & why now** (55 s)

Start with the people. About 4.6 lakh Indians over sixty live with Parkinson's, and roughly 12.8 lakh more have essential tremor, though that second figure comes from a single study. Two things fail them. Their movement is measured for a few minutes in a clinic, then not at all. And at home, a tremor of four to twelve hertz turns a spoon into a spill. Published research backs this up. A 2021 study calls a single clinic visit "only a snapshot" of symptoms. The statement people with essential tremor agreed with most was: "I am embarrassed by my tremor when I try to eat or drink in public." And in a study from southern India, 73 of 100 Parkinson's caregivers reported severe burden. Why now? Apple opened a movement API in 2018, and a Parkinson's monitoring app was FDA-cleared in 2022. India made device licensing mandatory in 2023. And our over-sixty population is set to more than double by 2050.

**3. One company, two products** (45 s)

So here is AVERRA: one company with two complementary products. ParkinSense is a general wellness wearable for anyone, young or old. It tracks activity and vitals, and its standout feature is tremor detection. TremoSense is assistive. It physically stabilises a spoon for someone whose tremor gets in the way of eating. They serve different people and different buying decisions. What they share is real: the same Nordic microcontroller family, the same six-axis IMU, the same signal-processing skills, and the same team. We are not claiming shared revenue or cost savings beyond that.

**4. ParkinSense** (60 s)

ParkinSense today is a wrist wearable with an IMU and an optical sensor. It streams over BLE at 104 hertz into three pipelines: motion, heart and steps. Its standout feature is tremor detection: a tremor score, frequency and burden. A shared motion classifier means tremor isn't counted as steps, and heart rate is trusted less while you move. Here's the status, honestly. Streaming, steps, tremor scoring and motion context are bench-tested. Heart rate, HRV and SpO2 are implemented but research-grade. The mobile app is in development, and all analysis currently runs on a host, not on the wrist. A clinical evaluation is in progress with ICMR. The results aren't back yet, so we make no clinical claim today. Longer term, ParkinSense could support research into early movement change in Parkinson's. That path runs through reference assessments, prospective validation and regulatory review. It is not a diagnostic claim.

**5. TremoSense** (55 s)

TremoSense is for people who already have tremor. An IMU in the handle feeds a Kalman filter that estimates roll and pitch. An LQR controller then drives two servos to counter-rotate the spoon head. Our paper prototype achieved 77.3 percent average rejection on a motorised tremor simulator at four, six and eight hertz. The current build is better. It moves to a real-time operating system, samples at 208 hertz and uses higher-torque servos, and on the bench it rejects about 90 percent of tremor. We'll publish those logs alongside the code. No person with tremor has used it yet.

**6. Competition** (50 s)

Competitors, with prices checked this month. WHOOP costs ₹17,990 a year, a Fitbit Charge 6 about ₹12,999, and an Amazfit Bip 6 ₹8,999. They are excellent at sleep, recovery and battery life. None documents tremor or movement-disorder insight. That's our space, and we have to prove people value it. For tremor assistance, one GyroGlove costs 5,899 US dollars, about 5.6 lakh rupees, for one hand. Liftware sold for 195 dollars in 2015, and a weighted spoon is cheap but passive. TremoSense is a spoon, not a glove, and we don't claim it matches either product. The opportunity is an Indian-built active aid priced under 2 percent of one GyroGlove, while being honest that it does far less.

**7. MVP & validation** (60 s)

What has the MVP proven? Both products work on the bench. TremoSense hasn't been tested with users. ParkinSense is now in a clinical evaluation with ICMR, with results pending. Our bench tests had no preregistered metric, and I want to be upfront about that. So we've preregistered the next test now. Twelve TremoSense units go to at least ten people with tremor for a self-feeding task. We continue if the median tremor reduction is at least 50 percent and at least 60 percent would pay. For ParkinSense, the test is dominant-frequency error within 5 percent of a reference, and zero false steps during tremor. The ICMR results will be added the moment they're available. Our decision is to persevere, and to validate on people before we make any medical claim. With that, over to Pawan.

**8. Market** (45 s)

Thank you, Pranshu. We sized the market bottom-up. TremoSense: Parkinson's plus essential tremor patients, half with tremor that disrupts eating, about 8.7 lakh people. At the launch price spread over a three-year life, that's ₹275.7 Cr a year. ParkinSense is for everyone, but we only size its first beachhead, households living with Parkinson's: ₹141.3 Cr. We have not sized the general wellness market, because we couldn't find a sourced Indian figure. Filtering to urban patients under neurologist care gives a SAM of ₹51.9 Cr. Our year-three SOM, built from 30 clinics plus online, is about ₹109 L.

**9. Business model** (35 s)

The business model in brief. Clinicians and occupational therapists bring us patients. Families buy the device. Revenue comes in three steps. First, research kits for labs, which need no medical claim. Then TremoSense as a one-time sale, with a rental option for those who can't pay upfront. Then ParkinSense, as a device with an optional subscription. We assume no reimbursement. All revenue is out-of-pocket or institutional.

**10. Pricing & unit economics** (60 s)

Pricing. Today's prototype parts cost about ₹4,062. Two thousand rupees is a volume target for the electronics, not today's cost. We modelled three cost levels. At a small batch of a hundred, the unit costs ₹4,830. At ₹9,999, after GST, a clinic margin, warranty and shipping, we keep ₹2,538. That's a 31% contribution margin and 40% gross margin, so every unit is profitable from the first sale. Once supplier quotes and tooling bring cost down to ₹2,720, we cut the price to ₹8,999 and still keep ₹3,886, or 53%. ₹6,999 would still be viable at that cost; we hold it back until the company is profitable. CAC is about ₹1,079, and LTV to CAC is 3.3. ParkinSense at ₹7,999 reaches 2.0, positive after acquisition cost, though thinner.

**11. Financial forecast** (55 s)

The plan starts in July 2027 and runs three years. Phase one, the first six months, is about proof: the TremoSense user study, the patent filing and a regulatory opinion. It costs ₹8.8 L. Phase two launches TremoSense, with first sales in month twelve. In year three we scale the clinic network and launch ParkinSense as a wellness product. Year-one costs are ₹35.2 L, a gross burn of about ₹2.93 L a month. Year two still loses 17.7 lakh rupees as volume builds. We reach sustained operating break-even in month 26, August 2029. Year three makes an operating profit of ₹11.7 L on ₹2.1 Cr of cash in, and we exit at about ₹2.3 L profit a month. Getting there needs ₹60.9 L in total. Phase one alone needs ₹10.5 L, and that number shapes our ask.

**12. Team & growth** (45 s)

The team comes from the evidence. Pranshu built ParkinSense and co-authored TremoSense, and he leads the company, the wearables and signal processing. I co-built TremoSense and lead control and hardware. In phase two we hire one test engineer. The equity split will be set in a founders' agreement. Growth runs through clinics. From a thousand caregivers reached, we target a quarter trying the device and 40 percent of those buying. These are targets, not data. Three experiments come first: an in-clinic trial-to-purchase test, support-group referrals, and a ParkinSense wellness beta.

**13. Funding ask & valuation** (60 s)

Now the ask, kept separate from the full plan. Year one costs ₹35.2 L and reaching profitability needs ₹60.9 L. Today we raise only for milestone one: ₹10,51,171. We propose a pre-money valuation of ₹75 L. That's a working target to negotiate, not an established value. Two methods frame it. Cost to duplicate gives a floor of ₹44.75 L: 34 person-months of engineering plus prototypes. A Berkus-style scorecard gives about ₹60 L, credited mainly for two working prototypes. The premium above that reflects two products and a clinical evaluation already under way. At ₹75 L, post-money is P plus I: ₹85,51,171. The investor owns I over post-money, 12.3%. After a 5 percent ESOP pool, the founders keep 82.7%. Even at the floor, the investor would own 19.0%. The Startup India grant is applied for, not awarded, and the next round is priced on the user-study result.

**14. Milestones, advantage & close** (50 s)

Here's what the money buys. The patent is filed in month two, study units are built in month three, and in month six the user study decides kill or continue. If we continue, we move through EMC testing and the CDSCO filing to first sales in month twelve, and to break-even in month 26. Why will people choose us? TremoSense costs under 2 percent of a GyroGlove and about half the price of Liftware, and it actively cancels tremor where a weighted spoon only adds weight. ParkinSense measures tremor, which none of WHOOP, Fitbit or Amazfit lists as a feature, for a one-time ₹7,999. AVERRA: engineering better movement intelligence. We're asking for ₹10.5 L at a ₹75 L pre-money, 12.3%, to reach a clear yes-or-no on a product that's profitable on every unit. Thank you.

## Financial workings

All figures are live formulas in the workbook; blue cells are inputs and yellow cells are assumptions to confirm.

**Market (bottom-up, India)**
- People with PD aged 60+: 149M × 308.9 per lakh = 460,261. People with ET: 1,276,575 (single rural study).
- TremoSense TAM customers = (PD + ET) × 50% eating-disruptive = 868,418 × ₹3,174/yr = ₹275.7 Cr.
- ParkinSense beachhead (PD households) = 460,261 × ₹3,069/yr = ₹141.3 Cr. The general wellness market is not sized (no sourced Indian figure).
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
| Year 1 (Jul 2027–Jun 2028) | ₹2.3 L | ₹35.2 L | -₹32.9 L |
| Year 2 | ₹53.1 L | ₹70.8 L | -₹17.7 L |
| Year 3 | ₹212.3 L | ₹200.6 L | ₹11.7 L |

- Year-1 gross burn ₹2.93 L/month; Phase 1 (M1–M6) costs ₹8.8 L.
- Volumes: TremoSense 695 units in Year 2 and 1890 in Year 3 (≤ SOM); ParkinSense 1380 in Year 3, launched M25.
- Levers to profitability, all shown in the model: verified Scenario C cost and tooling at M18; ₹8,999 price from M19; clinic-network growth to SOM capacity.
- Peak cumulative gap ₹50.8 L at M25 Jul-29; requirement to profitability = gap × 1.2 = ₹60.9 L.
- Sustained break-even M26 (Aug 2029); Year-3 operating profit ₹11.7 L (5.5%); month-36 profit ₹2.3 L.
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
| A · Prototype / very low volume | ₹4,862 | ₹3,812 | ₹9,999 | ₹8,094 | ₹2,221 | 40% / 27% | 254 |
| B · Small batch (100–500) | ₹4,830 | ₹3,480 | ₹9,999 | ₹8,094 | ₹2,538 | 40% / 31% | 222 |
| C · Scaled, after verified reductions | ₹2,720 | ₹1,950 | ₹8,999 | ₹7,285 | ₹3,886 | 63% / 53% | 145 |

\*Against Year-3 average fixed costs of ₹5.6 L/month.

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

**Ask:** ₹10,51,171 of equity for Milestone 1 (M1–M6) at a proposed ₹75 L pre-money. Post-money = P + I = ₹85,51,171. Investor = I ÷ post-money = 12.29%. Founders = 100% − investor − 5% ESOP = 82.71%. This is separate from Year-1 costs (₹35.2 L) and the total needed to reach profitability (₹60.9 L).

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
| A | Awarded (assumed in this scenario only) | ₹60.9 L | ₹20 L | ₹40.9 L | ₹75.0 L | ₹115.9 L | 35.3% | 5% | 59.7% | To operating break-even + buffer |
| B | Refused | ₹60.9 L | ₹0 L | ₹60.9 L | ₹75.0 L | ₹135.9 L | 44.8% | 5% | 50.2% | To operating break-even + buffer |
| C | Not assumed | ₹10.5 L | ₹0 L | ₹10.5 L | ₹75.0 L | ₹85.5 L | 12.3% | 5% | 82.7% | M1–M6 + buffer (Milestone 1) |
| D | Applied; counted only if awarded | ₹10.5 L | ₹0 L | ₹10.5 L | ₹75.0 L | ₹85.5 L | 12.3% | 5% | 82.7% | M1–M6 now; rest to break-even from tranche 2 / grant |

Scenario D tranche 2: ₹50.4 L after the user study. Priced at a cost floor of ₹94.3 L (tranche-1 post-money + Phase-1 spend), it would leave founders 53.9% — a worst case. In practice it is priced on the user-study result. A SISFS grant, if awarded, reduces tranche 2.

**Limitations:** person-months are estimated from the repositories (replace with logged hours); the Berkus scores are judgement; no public Indian pre-seed comparables were found for this stage.

## Competitor research

Prices checked 12 Oct 2026. They are benchmarks only and never feed AVERRA's revenue. A device that measures tremor is not the same as one that stabilises the hand, and the comparison respects that.

| Product | Segment | Price | Recurring | What it does | Checked |
|---|---|---|---|---|---|
| [WHOOP One (WHOOP 5.0)](https://www.whoop.in/pages/whoop-devices) | Wellness wearable | ₹17,990 (≈₹17,990) | Membership is the price: ₹17,990 / 12 months (MRP ₹21,990) | Screenless strap; recovery, sleep, strain, steps, VO2 max; 14+ day battery | 12 Oct 2026 |
| [WHOOP Peak](https://www.whoop.in/pages/whoop-devices) | Wellness wearable | ₹23,990 (≈₹23,990) | ₹23,990 / 12 months (MRP ₹28,990) | Adds healthspan, health monitor alerts, real-time stress | 12 Oct 2026 |
| [Amazfit Bip 6](https://www.91mobiles.com/amazfit-bip-6-smart-watch-price-in-india) | Fitness smartwatch | ₹8,999 (≈₹8,999) | None listed | AMOLED, GPS, heart rate, sleep; accelerometer + gyroscope; up to 14 days | 12 Oct 2026 |
| [Fitbit Charge 6](https://www.smartprix.com/fitness_bands/fitbit-charge-6-fitness-band-ppd10ccze2vi) | Fitness band | ₹12,999 (≈₹12,999) | Optional premium subscription (not priced here) | Heart rate, SpO2, sleep, GPS; ~7 days (₹13,999 on Amazon) | 12 Oct 2026 |
| [GyroGlove](https://techguide.parkinsons.org.uk/catalogue/gyro-glove) | Hand stabiliser (one hand) | US$5,899 (≈₹5,64,593) | Or $246/month × 24 | Gyroscopic wrist stabiliser for the whole hand; 4 h continuous use; no clinical study cited on listing | 12 Oct 2026 |
| [Liftware (stabilising handle)](https://www.michaeljfox.org/news/stabilizing-spoon-announces-price-reduction-and-match-program-holidays) | Active stabilising utensil | US$195 (≈₹18,663) | Attachments extra | Sensor + motor cancellation at the utensil; maker cites a study with 70% less shaking. Price is a DATED Nov 2015 figure | 12 Oct 2026 |
| [Weighted soup spoon (225 g)](https://wellbefore.com/products/weighted-soup-spoon) | Passive adaptive utensil | US$55.98 (≈₹5,358) | None | Added mass damps tremor; no electronics. US retail; Indian prices not verified | 12 Oct 2026 |

**ParkinSense positioning**
- **They do well:** Polished hardware, multi-day battery, sleep and recovery, large app ecosystems.
- **We are building:** A general wearable for anyone whose standout feature is tremor detection: score, frequency, burden and motion context.
- **Accessible value:** A price hypothesis of ₹7,999 — below WHOOP, Fitbit Charge 6 and the Amazfit Bip 6 (₹8,999), with no mandatory subscription.
- **Still to prove:** Accuracy against reference devices (ICMR evaluation results pending), battery life, sleep features, and that people value movement insight.

**TremoSense positioning**
- **The problem:** Active tremor aids are imported and priced for other markets: one GyroGlove ≈ ₹5.6 L.
- **Our opportunity:** An Indian-built active spoon at a ₹9,999 hypothesis, serviced locally through clinics.
- **What it does today:** ≈90% tremor rejection on the bench with the current build; a spoon, not a whole-hand device.
- **Still to prove:** User benefit in real eating, durability, comfort, and parity with Liftware-class products.

Caveats: the WHOOP price is a 12-month membership that includes the strap. The Liftware price is a dated 2015 figure. Weighted-utensil prices are US retail; Indian prices were not verified. No claim is made that AVERRA products are more accurate or effective than any competitor; that needs comparative testing.

## Technical, regulatory and patent caveats

**Kill / continue (M6, TremoSense user study, n ≥ 10):** continue if median tremor reduction ≥50% and ≥60% would pay at the launch price; pivot to clinic rental if the benefit holds but the price fails; stop TremoSense if the reduction is below 30%.

| Risk | What could go wrong | Trigger / response |
|---|---|---|
| Clinical evidence | ICMR evaluation results are pending and may not support ParkinSense's movement metrics | Publish results as they come; no clinical claim until then; refocus ParkinSense on wellness if accuracy falls short |
| Clinical | Bench rejection may not help a person eating | Continue if median reduction ≥50% and ≥60% would pay; pivot to clinic rental if benefit holds but price fails; stop TremoSense if <30% |
| Technical | The current build's ≈90% bench result is founder-reported; logs and tuned constants are not yet public | Publish bench logs, video and tuned firmware constants by M3 |
| Commercial | Company break-even needs ≈145 TremoSense units/month at C cost (plan: 130–185 in Year 3) | Continue only if experiment 1 shows ≥30% trial-to-purchase |
| Regulatory | Device class may be higher than assumed | Classification opinion by M4; re-plan budget if Class B or above |
| IP | Public repos and papers limit novelty | Attorney novelty opinion by M2; if weak, rely on evidence and execution |
| Funding | SISFS grant may be refused | Grant only reduces tranche 2; Milestone 1 does not depend on it |

**Technical:** the current build's ≈90% tremor rejection is a founder-reported bench result; logs are not yet published. The paper prototype's 77.3% is a motorised-simulator result. The public `constants.h` still shows Q, R and K_lqr as 0, so publish the tuned constants before anyone checks the repository. ParkinSense analysis runs on a host, not on the wrist. HR, HRV and SpO₂ are research-grade.

**Clinical:** Clinical evaluation in progress with ICMR — Founder-reported; protocol, site and results not yet available. ParkinSense does not diagnose, predict or clinically detect Parkinson's disease. Early identification is a research path, not a claim; healthy young users are a wellness audience, not a screening population.

**Regulatory assumptions (to confirm):** licensing has been mandatory for medical devices in India since 1 October 2023. TremoSense's class is assumed low-risk pending a CDSCO classification opinion at M4. ParkinSense is sold as a wellness product with no medical claim. GST is 5% for TremoSense and 18% for ParkinSense; both rates depend on HSN classification.

**Patent status:** an application is being prepared; nothing is filed or granted. The code and papers are public, so novelty may be limited to what is not yet disclosed. Co-inventor (and any institutional) assignments are needed before filing. A patent does not stop large companies from designing around it. Licensing, a technology sale or an acquisition are possible future options, not expected outcomes.

## Viva questions and answers

1. **Why ₹75 L and not the ₹44.75 L floor?** The floor values only the engineering hours. The Berkus-style cross-check credits two working prototypes and gives about ₹60 L. ₹75 L is our negotiation target; at the floor, the investor would own 19.0%, and we would accept a price in that range rather than delay Milestone 1.
2. **Isn't a higher valuation just a way to cut dilution?** We didn't use valuation alone: we cut the round to Milestone 1. That keeps dilution near 19% even at the floor. Raising everything up front would cost 35%–45%.
3. **How is AVERRA profitable?** Every TremoSense unit is profitable from the first sale (₹2,538). Company break-even arrives at M26 (Aug 2029), once volume reaches about 145 units a month at verified Scenario C cost. Year 3 makes ₹11.7 L. The main sensitivities are the cost reduction and clinic volume.
4. **Is ₹2,000 the cost?** No. Prototype parts are ₹4,062. ₹2,000 is a volume target for the electronics (Scenario C ₹1,950), needing supplier quotes and ₹7.0 L of tooling.
5. **Why would someone choose ParkinSense over WHOOP or Amazfit?** Not for sleep or battery today; they are better there. The difference is movement-specific insight (tremor burden, motion context) at ₹7,999 with no mandatory subscription. We have to prove people value it: that's experiment 3.
6. **Why TremoSense over GyroGlove or a weighted spoon?** GyroGlove stabilises the whole hand at about ₹5.6 L. A weighted spoon is cheap but passive. TremoSense actively cancels tremor at the spoon for ₹9,999. We don't claim parity until the user study.
7. **What does ICMR testing show?** Results aren't available yet. We will add them when they're published and make no clinical claim before then.
8. **Your repository differs from your paper.** Yes: the repository is the newer build. It moves to Zephyr at 208 Hz with higher-torque servos and reaches about 90% bench rejection against 77.3% for the paper prototype. Publishing those logs is the M3 milestone.
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
- [WHOOP India memberships (checked 12 Oct 2026)](https://www.whoop.in/pages/whoop-devices)
- [Amazfit Bip 6 India price (checked 12 Oct 2026)](https://www.91mobiles.com/amazfit-bip-6-smart-watch-price-in-india)
- [Fitbit Charge 6 India price (checked 12 Oct 2026)](https://www.smartprix.com/fitness_bands/fitbit-charge-6-fitness-band-ppd10ccze2vi)
- [GyroGlove listing, Parkinson's UK tech guide (16 Jun 2026)](https://techguide.parkinsons.org.uk/catalogue/gyro-glove)
- [Liftware product range and cited study](https://www.liftware.com/)
- [Weighted soup spoon (WellBefore)](https://wellbefore.com/products/weighted-soup-spoon)
- [TremoSense repository](https://github.com/rkt-1597/TremoSense-Project)
- [ParkinSense repository (develop)](https://github.com/sudo-pranshu/ParkinSense)
- [Hadley, Riley & Heldman, Digital Biomarkers 2021](https://karger.com/dib/article/5/3/206/823097/Real-World-Evidence-for-a-Smartwatch-Based)
- [Most-endorsed item among people with essential tremor; 63.2% found their tremor embarrassing. Kellner et al., J Neurol Sci 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5739080)
- [Parkinson's caregivers, Southern India. Kurupath, Arathil & Bansal, JCDR 2020](https://jcdr.net/ReadXMLFile.aspx?id=14384)
