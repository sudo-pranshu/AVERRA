"""Builds data/content.json — every claim, label and spoken number used by BOTH the deck and the website.

Numbers are formatted from data/averra-data.json at build time, so the script, slides and site cannot drift
from the financial model. Edit wording here; edit numbers in model/build_model.py.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
D = json.loads((ROOT / "data" / "averra-data.json").read_text())

def inr(x):
    x = round(x); s = str(abs(x))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        parts = []
        while len(head) > 2:
            parts.insert(0, head[-2:]); head = head[:-2]
        if head: parts.insert(0, head)
        s = ",".join(parts) + "," + tail
    return ("-₹" if x < 0 else "₹") + s
lakh = lambda x, d=1: f"{'-' if x < 0 else ''}₹{abs(x)/1e5:.{d}f} L"
crore = lambda x, d=1: f"{'-' if x < 0 else ''}₹{abs(x)/1e7:.{d}f} Cr"
pct = lambda x, d=0: f"{x*100:.{d}f}%"
sp_lakh = lambda x, d=1: f"{x/1e5:.{d}f} lakh"

ts = D["tremosense"]; sA, sB, sC = ts["scenarios"]["A"], ts["scenarios"]["B"], ts["scenarios"]["C"]
ue = D["unitEconomics"]; tsl, psl = ue["tremosenseLtv"], ue["parkinsenseLtv"]; psd = ue["parkinsenseDevice"]
mk = D["market"]; H = D["headline"]; F = D["funding"]; V = D["valuation"]
fC, fA, fB, fD = F["C"], F["A"], F["B"], F["D"]
comp = {c["name"]: c for c in D["competitors"]}
uf = {u["category"]: u["phase1"] for u in D["useOfFunds"]}
pm = {r["price"]: r for r in ts["priceMatrix"]}

STATUS = {"progress": "In progress", "impl": "Implemented", "bench": "Bench-tested", "partial": "Partial / in development", "planned": "Planned", "depends": "Needs hardware, firmware or validation", "sim": "Simulation only", "research": "Future research"}

import datetime as _dt
BE_LONG = _dt.datetime.strptime(H["breakEvenMonth"].split()[1], "%b-%y").strftime("%B %Y")
ICMR = {"status": "in_progress", "label": "Clinical evaluation in progress with ICMR", "detail": "Founder-reported; protocol, site and results not yet available.", "results": None}

content = {
    "clinicalEvaluation": ICMR,
    "brand": {"name": "AVERRA", "tagline": "Engineering better movement intelligence.",
              "descriptor": "Biomedical deep-tech for accessible wearable and assistive technology",
              "positioning": ("AVERRA is a biomedical technology company that turns precise movement sensing into everyday insight for anyone who wants to understand how they move (ParkinSense), "
                              "and practical assistance for people living with tremor (TremoSense), at prices built for India."),
              "founders": ["Pranshu Kumar", "Pawan Shinde"]},
    "statusLegend": STATUS,
    "parkinsense": {
        "role": "MEASURE AND UNDERSTAND MOVEMENT",
        "pitch": "A general fitness and wellness wearable for anyone, with tremor detection as its standout feature.",
        "hardware": "Seeed XIAO nRF52840 Sense · LSM6DS3 6-axis IMU (104 Hz) · MAX30102 PPG · 700 mAh Li-ion · BLE 5.0 · 3D-printed wrist housing",
        "architecture": ["Wearable streams IMU + PPG over BLE (firmware does no analysis)", "Host runtime (Python today; mobile app in development) decodes packets",
                         "Three pipelines: motion · PPG · steps", "Shared motion-context classifier gates steps and discounts HR confidence",
                         "Biomarkers logged to CSV/JSON; live dashboard"],
        "features": [
            ("BLE streaming at 104 Hz, 10-sample packets", "bench", "No packet loss in multi-hour bench sessions (paper)"),
            ("Steps, cadence, distance, active minutes", "bench", "4/4 step-gating conditions correct; no accuracy figure vs a reference pedometer"),
            ("Tremor score, frequency, burden, rest index", "bench", "Correct on a motorised 5 Hz fixture; not tested on people with PD"),
            ("Motion context (rest / low motion / active)", "bench", "4/4 bench conditions correct"),
            ("Heart rate, HRV (RMSSD, SDNN, pNN50), SpO₂", "impl", "Research-grade; never compared with a reference oximeter or ECG"),
            ("Skin-contact deep sleep, ≈7 mA active", "bench", "Measured on a Nordic PPK II; ≈100 h runtime is an estimate"),
            ("Dashboard (engineering + clinical views), replay", "impl", "Python / Plotly Dash"),
            ("Clinical evaluation with ICMR", "progress", "In progress (founder-reported); results pending — no clinical claim until results are published"),
            ("Mobile companion app", "partial", "In development; not in the public repository"),
            ("Processing on the wearable itself", "depends", "Today all analysis runs on the host, not the wrist"),
            ("Sleep, recovery, activity-type, calories, VO₂ max", "planned", "Roadmap items in the README"),
            ("Battery-level monitoring, cloud sync, OTA updates", "planned", "Roadmap items"),
            ("Bradykinesia / dyskinesia, longitudinal movement trends", "research", "Needs labelled data and validation"),
            ("Early identification of Parkinson's-related movement change", "research", "A research ambition — not a diagnostic capability"),
        ],
        "researchPath": ["Broader wellness wearable", "Reliable longitudinal movement data", "Research collaborations (ICMR evaluation in progress)", "Reference assessments",
                         "Prospective validation", "Sensitivity, specificity, false positives", "Regulatory assessment before any medical claim"],
        "researchCaveat": "ParkinSense does not diagnose, predict or clinically detect Parkinson's disease. Healthy young users are a wellness audience, not a screening population.",
        "image": "/images/parkinsense-wrist.jpg",
    },
    "tremosense": {
        "role": "ASSIST PEOPLE EXPERIENCING TREMOR",
        "pitch": "An active, battery-powered stabilising spoon that counter-rotates against tremor in real time.",
        "architecture": ["Hand IMU (LSM6DS3) on the handle", "EKF estimates roll and pitch", "LQR gain matrix maps states to two servo commands",
                         "Two servos counter-rotate the spoon head", "Boost converter + capacitor hold the rail through servo current spikes"],
        "repoVsPaper": [
            ("Firmware", "Zephyr RTOS, multi-threaded", "Arduino framework, single loop"),
            ("Estimator", "2-state EKF (roll, pitch) + calibration offsets", "4-state EKF with gyro-bias tracking"),
            ("Sampling", "IMU data-ready at 208 Hz", "100 Hz, 10 ms loop"),
            ("Servos / power", "MG995 + FS90MG (higher torque); bench-powered", "2 × MG92B, XL6009, 1250 mAh LiPo"),
        ],
        "results": [("≈90%", "tremor rejection on the bench with the current build (founder-reported)", "bench"),
                    ("4–8 Hz", "tremor frequencies tested on a motorised simulator, ±5°", "bench"),
                    ("0", "people with tremor tested so far", "planned")],
        "image": "/images/tremosense-rig.jpg",
    },
    "whyNow": [
        ("Jun 2018", "Apple opens a Movement Disorder API in ResearchKit", "https://www.engadget.com/2018-06-06-apple-watch-monitor-parkinsons-symptoms.html"),
        ("Jun 2022", "Rune Labs' Apple Watch PD monitoring gets FDA clearance", "https://9to5mac.com/2022/06/13/apple-watch-parkinsons/"),
        ("Oct 2023", "Licensing becomes mandatory for medical devices in India", "https://www.digitalhealthnews.com/cdsco-extends-deadline-for-class-c-d-medical-devices-cos-by-3-months"),
        ("Sep 2023", "UNFPA: India's 60+ population 149M → 347M by 2050", "https://www.thenationalnews.com/world/asia/2023/09/28/india-un-elderly-population/"),
        ("Mar 2025", "BMJ: 25.2M people with Parkinson's worldwide by 2050", "https://bmjgroup.com/cases-of-parkinsons-disease-set-to-reach-25-million-worldwide-by-2050"),
    ],
    "competitors": {
        "parkinsense": {
            "columns": ["", "WHOOP One", "Amazfit Bip 6", "Fitbit Charge 6", "ParkinSense"],
            "rows": [
                ["Price (India)", f"{inr(comp['WHOOP One (WHOOP 5.0)']['price'])}/yr membership", inr(comp['Amazfit Bip 6']['price']), inr(comp['Fitbit Charge 6']['price']), f"{inr(D['assumptions']['P3'])} + {inr(D['assumptions']['P4'])}/mo (hypothesis)"],
                ["Wellness", "Recovery, sleep, strain, VO₂ max", "HR, sleep, GPS", "HR, SpO₂, sleep, GPS", "Steps, HR, HRV, SpO₂ (research-grade); sleep planned"],
                ["Movement insight", "Not documented", "Not documented", "Not documented", "Tremor score, burden, motion context (bench-tested)"],
                ["Battery", "14+ days", "Up to 14 days", "≈7 days", "≈100 h (estimate)"],
                ["Evidence", "Commercial product", "Commercial product", "Commercial product", "Bench tests only"],
            ],
            "positioning": [
                ("They do well", "Polished hardware, multi-day battery, sleep and recovery, large app ecosystems."),
                ("We are building", "A general wearable for anyone whose standout feature is tremor detection: score, frequency, burden and motion context."),
                ("Accessible value", f"A price hypothesis of {inr(D['assumptions']['P3'])} — below WHOOP, Fitbit Charge 6 and the Amazfit Bip 6 ({inr(comp['Amazfit Bip 6']['price'])}), with no mandatory subscription."),
                ("Still to prove", "Accuracy against reference devices (ICMR evaluation results pending), battery life, sleep features, and that people value movement insight."),
            ],
        },
        "tremosense": {
            "columns": ["", "GyroGlove", "Liftware", "Weighted spoon", "TremoSense"],
            "rows": [
                ["Price", f"US${comp['GyroGlove']['price']:,} per glove (≈{lakh(comp['GyroGlove']['inr'])})", f"US${comp['Liftware (stabilising handle)']['price']} (2015 price, dated)", f"≈{inr(comp['Weighted soup spoon (225 g)']['inr'])} (US retail)", f"{inr(ts['launchPrice'])} launch hypothesis"],
                ["What it does", "Gyroscopic stabiliser for the whole hand", "Motorised handle cancels tremor at the utensil", "Added mass damps motion", "Two-axis servo gimbal cancels tremor at the spoon"],
                ["Mechanism", "Gyroscope (passive-active)", "Sensors + motors", "Passive", "IMU → EKF → LQR → 2 servos"],
                ["Evidence", "No study cited on listing", "Maker cites study: 70% less shaking", "Varies", "≈90% bench rejection (current build); no users yet"],
            ],
            "positioning": [
                ("The problem", f"Active tremor aids are imported and priced for other markets: one GyroGlove ≈ {lakh(comp['GyroGlove']['inr'])}."),
                ("Our opportunity", f"An Indian-built active spoon at a {inr(ts['launchPrice'])} hypothesis, serviced locally through clinics."),
                ("What it does today", "≈90% tremor rejection on the bench with the current build; a spoon, not a whole-hand device."),
                ("Still to prove", "User benefit in real eating, durability, comfort, and parity with Liftware-class products."),
            ],
        },
        "checked": "12 Oct 2026",
    },
    "problem": {
        "stats": [(f"≈{mk['pd60']/1e5:.1f} lakh", "Indians aged 60+ living with Parkinson's (derived)"),
                  (f"≈{mk['et']/1e5:.1f} lakh", "with essential tremor (single-study estimate)"),
                  ("4–12 Hz", "tremor band that turns a spoon into a spill")],
        "quotes": [("Clinicians", "Obtaining only a snapshot of symptoms during a single clinical office visit does not provide enough time resolution to determine how to optimize symptomatic benefit.",
                    "Hadley, Riley & Heldman, Digital Biomarkers 2021", "https://karger.com/dib/article/5/3/206/823097/Real-World-Evidence-for-a-Smartwatch-Based"),
                   ("People with tremor", "I am embarrassed by my tremor when I try to eat or drink in public.",
                    "Most-endorsed item among people with essential tremor; 63.2% found their tremor embarrassing. Kellner et al., J Neurol Sci 2017", "https://pmc.ncbi.nlm.nih.gov/articles/PMC5739080"),
                   ("Caregivers (India)", "Out of 100 caregivers, 73 reported to have \"severe\" caregiver burden.",
                    "Parkinson's caregivers, Southern India. Kurupath, Arathil & Bansal, JCDR 2020", "https://jcdr.net/ReadXMLFile.aspx?id=14384")],
        "quotesNote": "Published sources, not AVERRA's own interviews. Our customer-discovery interviews are still to be run.",
    },
    "milestones": [("M2", "Provisional patent filed", "IP"), ("M3", "12 study units built", "TremoSense"), ("M4", "CDSCO classification opinion; ethics approval", "Regulatory"),
                   ("M6", "User study n ≥ 10 → kill / continue", "Milestone 1"), ("M7", "Tranche 2 closes; engineer hired", "Phase 2"),
                   ("M9–10", "EMC pre-compliance; CDSCO filing", "Regulatory"), ("M11", "100-unit pilot batch", "TremoSense"), ("M12", "First TremoSense sales", "Commercial"), ("M19", "Verified lower cost; price to ₹8,999", "Scale"), ("M25", "ParkinSense wellness launch", "ParkinSense"), (D["headline"]["breakEvenMonth"].split()[0], "Sustained operating break-even", "Profitability")],
    "risks": [
        ("Clinical evidence", "ICMR evaluation results are pending and may not support ParkinSense's movement metrics", "Publish results as they come; no clinical claim until then; refocus ParkinSense on wellness if accuracy falls short"),
        ("Clinical", "Bench rejection may not help a person eating", "Continue if median reduction ≥50% and ≥60% would pay; pivot to clinic rental if benefit holds but price fails; stop TremoSense if <30%"),
        ("Technical", "The current build's ≈90% bench result is founder-reported; logs and tuned constants are not yet public", "Publish bench logs, video and tuned firmware constants by M3"),
        ("Commercial", f"Company break-even needs ≈{sC['breakEvenUnitsPerMonth']:.0f} TremoSense units/month at C cost (plan: 130–185 in Year 3)", "Continue only if experiment 1 shows ≥30% trial-to-purchase"),
        ("Regulatory", "Device class may be higher than assumed", "Classification opinion by M4; re-plan budget if Class B or above"),
        ("IP", "Public repos and papers limit novelty", "Attorney novelty opinion by M2; if weak, rely on evidence and execution"),
        ("Funding", "SISFS grant may be refused", "Grant only reduces tranche 2; Milestone 1 does not depend on it"),
    ],
    "fundsBuy": {
        "Team": "Both founders full-time for six months",
        "Validation (both products)": "12 TremoSense study units and the user study (n ≥ 10); ParkinSense reference testing",
        "Regulatory & quality": "CDSCO classification opinion and ethics approval",
        "Prototyping, tools, IP": "Provisional patent, test equipment and prototype iterations",
        "Go-to-market & admin": "Clinic outreach for the trial-to-purchase test; company admin",
        "Contingency": "Buffer for slips and price changes",
    },
    "fundsGrowth": "A positive M6 result unlocks tranche 2: a 100-unit pilot batch, EMC and CDSCO filing, first sales in M12 and a clinic network that reaches break-even in M26.",
    "advantage": {
        "tremosense": [
            ("GyroGlove", f"≈{pct(ts['launchPrice'] / comp['GyroGlove']['inr'], 1)} of the price ({inr(ts['launchPrice'])} vs ≈{lakh(comp['GyroGlove']['inr'])}), built for the task that matters most: eating.", "Stabilises the whole hand, not just a utensil."),
            ("Liftware", f"About half the price ({inr(ts['launchPrice'])} vs ≈{inr(comp['Liftware (stabilising handle)']['inr'])} at its 2015 US price). ≈90% bench rejection vs the maker's cited 70% less shaking.", "Different tests, not head-to-head; Liftware has years of real users."),
            ("Weighted spoon", "Actively cancels tremor with a sensor, a controller and two motors, instead of adding mass to a tired hand.", "Cheaper and never needs charging."),
        ],
        "parkinsense": [
            ("WHOOP", f"Measures tremor (score, burden, frequency). {inr(D['assumptions']['P3'])} once vs {inr(comp['WHOOP One (WHOOP 5.0)']['price'])} every year.", "Better sleep and recovery coaching, mature app."),
            ("Fitbit Charge 6", "Tremor-aware step counting: tremor is classified as tremor, not counted as steps.", "Polished hardware, GPS, ≈7-day battery."),
            ("Amazfit Bip 6", f"Movement-disorder insight at a lower price ({inr(D['assumptions']['P3'])} vs {inr(comp['Amazfit Bip 6']['price'])}); clinical evaluation with ICMR under way.", "Display, GPS, up to 14-day battery."),
        ],
        "shared": ["One sensing and signal-processing stack powers both products", "Indian cost base; sold and serviced through local clinics", "No mandatory subscription on either product"],
        "note": "Prices are public list prices checked 12 Oct 2026; performance figures are bench results. No head-to-head user trial has been run yet.",
    },
    "growth": {
        "funnel": [("Acquisition", "1,000 caregivers via 10 clinics", "100%"), ("Activation", "In-clinic TremoSense trial", "25%"), ("Revenue", "Buys at launch price", "40% of trials"),
                   ("Retention", "Daily use at day 30", "≥70%"), ("Referral", "Refers another family", "15%")],
        "experiments": [("In-clinic trial → purchase", "10 clinics, 8 weeks", f"Pass: ≥30% buy at {inr(ts['launchPrice'])}, CAC ≤ {inr(tsl['cac'])}"),
                        ("Support-group referrals", "PD / ET caregiver groups", "Pass: ≥15% refer; CAC ≤ ₹800"),
                        ("ParkinSense wellness beta", "100 users, 8 weeks", "Pass: ≥40% weekly active and ≥25% would subscribe")],
    },
}

# ------------------------------------------------------------------ the ~11-minute script (14 slides)
S = []
S.append(("Title", 40, f"""Good morning. I'm Pranshu Kumar, and this is my co-founder Pawan Shinde. Together we're building AVERRA. Our line is: engineering better movement intelligence.
AVERRA is a biomedical technology company. We turn precise movement sensing into products people can use every day, at prices built for India.
We start with two products. ParkinSense measures and helps people understand their movement. TremoSense assists people who already live with tremor.
I'll take you through the problem and what we've built and tested. Pawan will then take you through the business, the numbers and exactly what we're asking for."""))
S.append(("Problem & why now", 55, f"""Start with the people. About {mk['pd60']/1e5:.1f} lakh Indians over sixty live with Parkinson's, and roughly {mk['et']/1e5:.1f} lakh more have essential tremor, though that second figure comes from a single study.
Two things fail them. Their movement is measured for a few minutes in a clinic, then not at all. And at home, a tremor of four to twelve hertz turns a spoon into a spill.
Published research backs this up. A 2021 study calls a single clinic visit "only a snapshot" of symptoms. The statement people with essential tremor agreed with most was: "I am embarrassed by my tremor when I try to eat or drink in public." And in a study from southern India, 73 of 100 Parkinson's caregivers reported severe burden.
Why now? Apple opened a movement API in 2018, and a Parkinson's monitoring app was FDA-cleared in 2022. India made device licensing mandatory in 2023. And our over-sixty population is set to more than double by 2050."""))
S.append(("One company, two products", 45, f"""So here is AVERRA: one company with two complementary products.
ParkinSense is a general wellness wearable for anyone, young or old. It tracks activity and vitals, and its standout feature is tremor detection.
TremoSense is assistive. It physically stabilises a spoon for someone whose tremor gets in the way of eating.
They serve different people and different buying decisions. What they share is real: the same Nordic microcontroller family, the same six-axis IMU, the same signal-processing skills, and the same team. We are not claiming shared revenue or cost savings beyond that."""))
S.append(("ParkinSense", 60, f"""ParkinSense today is a wrist wearable with an IMU and an optical sensor. It streams over BLE at 104 hertz into three pipelines: motion, heart and steps.
Its standout feature is tremor detection: a tremor score, frequency and burden. A shared motion classifier means tremor isn't counted as steps, and heart rate is trusted less while you move.
Here's the status, honestly. Streaming, steps, tremor scoring and motion context are bench-tested. Heart rate, HRV and SpO2 are implemented but research-grade. The mobile app is in development, and all analysis currently runs on a host, not on the wrist.
A clinical evaluation is in progress with ICMR. The results aren't back yet, so we make no clinical claim today. Longer term, ParkinSense could support research into early movement change in Parkinson's. That path runs through reference assessments, prospective validation and regulatory review. It is not a diagnostic claim."""))
S.append(("TremoSense", 55, f"""TremoSense is for people who already have tremor. An IMU in the handle feeds a Kalman filter that estimates roll and pitch. An LQR controller then drives two servos to counter-rotate the spoon head.
On a motorised tremor simulator at four, six and eight hertz, the current build rejects about 90 percent of tremor. It runs a real-time operating system, samples at 208 hertz and uses higher-torque servos. We'll publish the bench logs alongside the code.
No person with tremor has used it yet."""))
S.append(("Competition", 50, f"""Competitors, with prices checked this month.
WHOOP costs {inr(comp['WHOOP One (WHOOP 5.0)']['price'])} a year, a Fitbit Charge 6 about {inr(comp['Fitbit Charge 6']['price'])}, and an Amazfit Bip 6 {inr(comp['Amazfit Bip 6']['price'])}. They are excellent at sleep, recovery and battery life. None documents tremor or movement-disorder insight. That's our space, and we have to prove people value it.
For tremor assistance, one GyroGlove costs {comp['GyroGlove']['price']:,} US dollars, about {sp_lakh(comp['GyroGlove']['inr'])} rupees, for one hand. Liftware sold for 195 dollars in 2015, and a weighted spoon is cheap but passive.
TremoSense is a spoon, not a glove, and we don't claim it matches either product. The opportunity is an Indian-built active aid priced under 2 percent of one GyroGlove, while being honest that it does far less."""))
S.append(("MVP & validation", 60, f"""What has the MVP proven? Both products work on the bench. TremoSense hasn't been tested with users. ParkinSense is now in a clinical evaluation with ICMR, with results pending. Our bench tests had no preregistered metric, and I want to be upfront about that.
So we've preregistered the next test now. Twelve TremoSense units go to at least ten people with tremor for a self-feeding task. We continue if the median tremor reduction is at least 50 percent and at least 60 percent would pay.
For ParkinSense, the test is dominant-frequency error within 5 percent of a reference, and zero false steps during tremor. The ICMR results will be added the moment they're available.
Our decision is to persevere, and to validate on people before we make any medical claim. With that, over to Pawan."""))
S.append(("Market", 45, f"""Thank you, Pranshu. We sized the market bottom-up.
TremoSense: Parkinson's plus essential tremor patients, half with tremor that disrupts eating, about {mk['tremosense']['customers']/1e5:.1f} lakh people. At the launch price spread over a three-year life, that's {crore(mk['tremosense']['tam'])} a year.
ParkinSense is for everyone, but we only size its first beachhead, households living with Parkinson's: {crore(mk['parkinsense']['tam'])}. As a general wearable the upside is far larger: India bought 35 million smartwatches in 2024, a separate TAM of {crore(D['market']['general']['tam'], 0)}. We show it as upside only; it is not in our plan.
Filtering to urban patients under neurologist care gives a SAM of {crore(D['market']['totals']['sam'])}. Our year-three SOM, built from 30 clinics plus online, is about {lakh(D['market']['totals']['som'], 0)}."""))
S.append(("Business model", 35, f"""The business model in brief. Clinicians and occupational therapists bring us patients. Families buy the device.
Revenue comes in three steps. First, research kits for labs, which need no medical claim. Then TremoSense as a one-time sale, with a rental option for those who can't pay upfront. Then ParkinSense, as a device with an optional subscription.
We assume no reimbursement. All revenue is out-of-pocket or institutional."""))
S.append(("Pricing & unit economics", 60, f"""Pricing. Today's prototype parts cost about {inr(ts['prototypePartsCost'])}. Two thousand rupees is a volume target for the electronics, not today's cost.
We modelled three cost levels. At a small batch of a hundred, the unit costs {inr(sB['cogs'])}. At {inr(ts['launchPrice'])}, after GST, a clinic margin, warranty and shipping, we keep {inr(sB['contribution'])}. That's a {pct(sB['contributionMargin'])} contribution margin and {pct(sB['grossMargin'])} gross margin, so every unit is profitable from the first sale.
Once supplier quotes and tooling bring cost down to {inr(sC['cogs'])}, we cut the price to {inr(ts['postCostPrice'])} and still keep {inr(sC['contribution'])}, or {pct(sC['contributionMargin'])}. {inr(ts['targetPrice'])} would still be viable at that cost; we hold it back until the company is profitable.
CAC is about {inr(tsl['cac'])}, and LTV to CAC is {tsl['ltvCac']:.1f}. ParkinSense at {inr(D['assumptions']['P3'])} reaches {psl['ltvCac']:.1f}, positive after acquisition cost, though thinner."""))
S.append(("Financial forecast", 55, f"""The plan starts in July 2027 and runs three years.
Phase one, the first six months, is about proof: the TremoSense user study, the patent filing and a regulatory opinion. It costs {lakh(H['phase1Costs'])}.
Phase two launches TremoSense, with first sales in month twelve. In year three we scale the clinic network and launch ParkinSense as a wellness product.
Year-one costs are {lakh(H['costs12'])}, a gross burn of about {lakh(H['grossBurn12'], 2)} a month. Year two still loses {sp_lakh(-H['y2Net'])} rupees as volume builds.
We reach sustained operating break-even in month {H['breakEvenMonth'].split()[0][1:]}, {BE_LONG}. Year three makes an operating profit of {lakh(H['y3Profit'])} on {crore(H['y3CashIn'])} of cash in, and we exit at about {lakh(H['m36Profit'])} profit a month.
Getting there needs {lakh(H['fullRequirement'])} in total. Phase one alone needs {lakh(H['phase1Requirement'])}, and that number shapes our ask."""))
S.append(("Team & growth", 45, f"""We are both hardware engineers. Pranshu built ParkinSense and co-built TremoSense; he leads the company and the wearable hardware. I co-built TremoSense and lead control and power electronics. Our gap is commercial, so after the M6 study we hire a test engineer, and from month 19 support and sales staff. The equity split will be set in a founders' agreement.
Growth runs through clinics. From a thousand caregivers reached, we target a quarter trying the device and 40 percent of those buying. These are targets, not data.
Three experiments come first: an in-clinic trial-to-purchase test, support-group referrals, and a ParkinSense wellness beta."""))
S.append(("Funding ask & valuation", 60, f"""Now the ask, kept separate from the full plan. Year one costs {lakh(H['costs12'])} and reaching profitability needs {lakh(H['fullRequirement'])}. Today we raise only for milestone one: {inr(fC['equity'])}.
We propose a pre-money valuation of {lakh(V['proposed'], 0)}. That's a working target to negotiate, not an established value. Two methods frame it. Cost to duplicate gives a floor of {lakh(V['floor'], 2)}: {V['personMonths']:.0f} person-months of engineering plus prototypes. A Berkus-style scorecard gives about {lakh(V['berkus'], 0)}, credited mainly for two working prototypes. The premium above that reflects two products and a clinical evaluation already under way.
At {lakh(V['proposed'], 0)}, post-money is P plus I: {inr(fC['post'])}. The investor owns I over post-money, {pct(fC['investor'], 1)}. After a 5 percent ESOP pool, the founders keep {pct(fC['founders'], 1)}. Even at the floor, the investor would own {pct(V['options'][0]['investor'], 1)}.
The Startup India grant is applied for, not awarded, and the next round is priced on the user-study result."""))
S.append(("Milestones, advantage & close", 50, f"""Here's what the money buys. About {lakh(uf['Team'], 1)} keeps both of us full-time for six months, {lakh(uf['Prototyping, tools, IP'], 1)} covers prototypes, tools and the patent, and {lakh(uf['Validation (both products)'], 1)} builds the study units and runs the user study. The patent is filed in month two, study units are built in month three, and in month six the user study decides kill or continue. If we continue, we move through EMC testing and the CDSCO filing to first sales in month twelve, and to break-even in month {H['breakEvenMonth'].split()[0][1:]}.
Why will people choose us? TremoSense costs under 2 percent of a GyroGlove and about half the price of Liftware, and it actively cancels tremor where a weighted spoon only adds weight. ParkinSense measures tremor, which none of WHOOP, Fitbit or Amazfit lists as a feature, for a one-time {inr(D['assumptions']['P3'])}.
AVERRA: engineering better movement intelligence. We're asking for {lakh(fC['equity'], 1)} at a {lakh(V['proposed'], 0)} pre-money, {pct(fC['investor'], 1)}, to reach a clear yes-or-no on a product that's profitable on every unit. Thank you."""))
content["script"] = [{"slide": i + 1, "title": t, "seconds": s, "speaker": "Pranshu" if i < 7 else "Pawan", "text": tx.strip()} for i, (t, s, tx) in enumerate(S)]
content["scriptTotals"] = {"seconds": sum(s for _, s, _ in S), "words": sum(len(tx.split()) for _, _, tx in S)}
content["fmt"] = None
(ROOT / "data" / "content.json").write_text(json.dumps(content, indent=1, ensure_ascii=False))
print("content.json:", content["scriptTotals"], "minutes", round(content["scriptTotals"]["seconds"] / 60, 2), "· words/min", round(content["scriptTotals"]["words"] / (content["scriptTotals"]["seconds"] / 60)))
