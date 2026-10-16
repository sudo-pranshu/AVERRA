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
              "positioning": ("For people who want to understand how they move, and for people whose tremor makes eating hard, AVERRA is a biomedical wearables company "
                              "that turns precise movement sensing into everyday insight (ParkinSense) and active assistance (TremoSense), at prices built for India."),
              "failRisk": "Bench rejection may not turn into easier eating. Real food, real spoons and tired hands are harder than a motorised simulator.", "failKill": "Kill TremoSense if the M6 study (n ≥ 10) shows median tremor reduction below 30%. Pivot to clinic rental if it works but under 60% would pay.",
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
                    ("2", "people with tremor have tried it (informal, founder-reported)", "planned")],
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
            "columns": ["", "WHOOP One", "Garmin Cirqa", "Fitbit Air", "Helio Strap", "ParkinSense"],
            "rows": [
                ["Price (India)", f"{inr(comp['WHOOP One (WHOOP 5.0)']['price'])} incl. 12-mo plan, renews yearly", f"{inr(comp['Garmin Cirqa']['price'])}, no subscription", f"{inr(comp['Google Fitbit Air']['price'])} + Premium after trial", f"{inr(comp['Amazfit Helio Strap']['price'])}–₹15,000 (official ₹8,999, sold out)", f"{inr(D['assumptions']['P3'])} + optional {inr(D['assumptions']['P4'])}/mo plan"],
                ["Tracks", "Recovery, sleep, strain, HRV", "HR, HRV, SpO₂, sleep, VO₂ max, skin temp", "HR, HRV, SpO₂, sleep, rhythm alerts", "HR, sleep, recovery", "Steps, HR, HRV, SpO₂ (research-grade)"],
                ["Tremor insight", "Not offered", "Not offered", "Not offered", "Not offered", "Tremor score, frequency, burden (bench-tested)"],
                ["Battery", "14+ days", "Up to 10 days", "Up to 7 days", "Up to 10 days", "≈100 h (estimate)"],
                ["Evidence", "Commercial", "Commercial", "Commercial", "Commercial", "Bench tests only"],
            ],
            "positioning": [
                ("They do well", "Screenless bands from WHOOP, Garmin, Google and Amazfit: polished hardware, long battery, sleep and recovery, big app ecosystems."),
                ("We are building", "A general wearable for anyone whose standout feature is tremor detection: score, frequency, burden and motion context."),
                ("Accessible value", f"A planned price of {inr(D['assumptions']['P3'])}: below every screenless band here, from the Helio Strap ({inr(comp['Amazfit Helio Strap']['price'])}) to Garmin Cirqa ({inr(comp['Garmin Cirqa']['price'])}), with no mandatory subscription."),
                ("Still to prove", "Accuracy against reference devices (ICMR evaluation results pending), battery life, sleep features, and that people value movement insight."),
            ],
        },
        "tremosense": {
            "columns": ["", "GyroGlove", "Imported active spoon", "Weighted spoon", "TremoSense"],
            "rows": [
                ["Price", f"US${comp['GyroGlove']['price']:,} per glove (≈{lakh(comp['GyroGlove']['inr'])})", f"{inr(comp['Steady Spoon (imported, desertcart.in)']['price'])} to {inr(comp['Imported active spoon (desertcart.in)']['price'])} (imported)", f"≈{inr(comp['Weighted soup spoon (225 g)']['inr'])} (US retail)", f"{inr(ts['launchPrice'])} planned launch price"],
                ["What it does", "Gyroscopic stabiliser for the whole hand", "Motorised handle cancels tremor at the spoon", "Added mass damps motion", "Two-axis servo gimbal cancels tremor at the spoon"],
                ["Mechanism", "Gyroscope (passive-active)", "Sensors + motors", "Passive", "IMU → EKF → LQR → 2 servos"],
                ["Evidence", "No study cited on listing", "Commercial, imported", "Varies", "≈90% bench rejection (current build); 2 informal user trials"],
            ],
            "positioning": [
                ("The problem", f"Active tremor aids are imported and priced for other markets: active spoons cost {inr(comp['Steady Spoon (imported, desertcart.in)']['price'])} to {inr(comp['Imported active spoon (desertcart.in)']['price'])} in India; one GyroGlove ≈ {lakh(comp['GyroGlove']['inr'])}."),
                ("Our opportunity", f"An Indian-built active spoon at a {inr(ts['launchPrice'])} planned price, serviced locally through clinics."),
                ("What it does today", "≈90% tremor rejection on the bench with the current build; a spoon, not a whole-hand device."),
                ("Still to prove", "User benefit in real eating, durability, comfort, and parity with imported active spoons."),
            ],
        },
        "checked": "16 Oct 2026",
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
    "milestones": [("M2", "Provisional patent filing planned", "IP"), ("M3", "12 study units built", "TremoSense"), ("M4", "CDSCO classification opinion; ethics approval", "Regulatory"),
                   ("M6", "User study n ≥ 10 → kill / continue", "Milestone 1"), ("M7", "Tranche 2 closes", "Phase 2"),
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
    "fundsGrowth": f"A positive M6 result unlocks tranche 2: a 100-unit pilot batch, EMC and CDSCO filing, first sales in M12 and a clinic network that reaches break-even in {D['headline']['breakEvenMonth'].split()[0]}.",
    "advantage": {
        "tremosense": [
            ("GyroGlove", f"≈{pct(ts['launchPrice'] / comp['GyroGlove']['inr'], 1)} of the price ({inr(ts['launchPrice'])} vs ≈{lakh(comp['GyroGlove']['inr'])}), built for the task that matters most: eating.", "Stabilises the whole hand, not just a utensil."),
            ("Imported active spoons", f"A quarter to a sixth of the price ({inr(ts['launchPrice'])} vs {inr(comp['Steady Spoon (imported, desertcart.in)']['price'])} to {inr(comp['Imported active spoon (desertcart.in)']['price'])} in India), built and serviced locally.", "Proven products with real users; we have bench results and 2 informal trials."),
            ("Weighted spoon", "Actively cancels tremor with a sensor, a controller and two motors, instead of adding mass to a tired hand.", "Cheaper and never needs charging."),
        ],
        "parkinsense": [
            ("WHOOP", f"Measures tremor (score, burden, frequency). {inr(D['assumptions']['P3'])} once vs {inr(comp['WHOOP One (WHOOP 5.0)']['price'])} every year.", "Better sleep and recovery coaching, mature app."),
            ("Garmin Cirqa & Google Fitbit Air", f"Tremor detection and tremor-aware step counting, which neither lists, at {inr(D['assumptions']['P3'])} vs {inr(comp['Google Fitbit Air']['price'])} (Fitbit Air) and {inr(comp['Garmin Cirqa']['price'])} (Cirqa).", "Proven sensors, VO₂ max and rhythm alerts, 7–10 day battery."),
            ("Amazfit Helio Strap", f"Same screenless format at a lower price ({inr(D['assumptions']['P3'])} vs {inr(comp['Amazfit Helio Strap']['price'])}), plus tremor insight; clinical evaluation with ICMR under way.", "Mature app and recovery scoring."),
        ],
        "shared": ["One sensing and signal-processing stack powers both products", "Indian cost base; sold and serviced through local clinics", "No mandatory subscription on either product"],
        "note": "Prices are public Indian prices checked 16 Oct 2026; performance figures are bench results. No head-to-head user trial has been run yet.",
    },
    "growth": {
        "funnel": [("Acquisition", "1,000 caregivers via 10 clinics", "100%"), ("Activation", "In-clinic TremoSense trial", "25%"), ("Revenue", "Buys at launch price", "40% of trials"),
                   ("Retention", "Daily use at day 30", "≥70%"), ("Referral", "Refers another family", "15%")],
        "experiments": [("In-clinic trial → purchase", "10 clinics, 8 weeks", f"Pass: ≥30% buy at {inr(ts['launchPrice'])}, CAC ≤ {inr(tsl['cac'])}"),
                        ("Support-group referrals", "PD / ET caregiver groups", "Pass: ≥15% refer; CAC ≤ ₹800"),
                        ("ParkinSense wellness beta", "100 users, 8 weeks", "Pass: ≥40% weekly active and ≥25% would subscribe")],
    },
}

# ------------------------------------------------------------------ the ~12-minute script (17 slides, same order as the website)
S = []
S.append(("AVERRA", 35, f"""Good morning. I'm Pranshu Kumar, and this is my co-founder Pawan Shinde. Together we're building AVERRA. Our line is: engineering better movement intelligence.
AVERRA is a biomedical technology company. We turn precise movement sensing into products people can use every day, at prices built for India. We start with two: ParkinSense measures and helps people understand movement, and TremoSense assists people who already live with tremor.
I'll take you through the problem, our products and the competition. Pawan will then take you through the market, our validation, the numbers and exactly what we're asking for."""))
S.append(("Problem", 40, f"""Start with the people. About {mk['pd60']/1e5:.1f} lakh Indians over sixty live with Parkinson's, and roughly {mk['et']/1e5:.1f} lakh more have essential tremor, though that second figure comes from a single study.
Two things fail them. Their movement is measured for a few minutes in a clinic, then not at all. And at home, a tremor of four to twelve hertz turns a spoon into a spill.
Published research backs this up. A 2021 study calls a clinic visit "only a snapshot" of symptoms. The statement people with essential tremor agreed with most was: "I am embarrassed by my tremor when I try to eat or drink in public." And in a study from southern India, 73 of 100 Parkinson's caregivers reported severe burden."""))
S.append(("Why now", 30, f"""Why now? Five dated shifts. Apple opened a movement-disorder API in 2018, and an Apple Watch Parkinson's monitor was FDA-cleared in 2022, so wrist-based monitoring has a regulatory path. India made device licensing mandatory in 2023, so we can now plan and cost approval end to end. And India's over-sixty population is set to more than double by 2050.
The hardware is no longer the barrier: the chip at the heart of both products costs about sixteen dollars. Validation is. And this window won't stay open if global brands add tremor features first."""))
S.append(("One company, two products", 35, f"""So here is AVERRA: one company with two complementary products.
ParkinSense is a general wellness wearable for anyone, young or old. It tracks activity and vitals, and its standout feature is tremor detection. TremoSense is assistive: it physically stabilises a spoon for someone whose tremor gets in the way of eating.
They serve different people and different buyers. What they share is real: the same Nordic microcontroller family, the same six-axis IMU, the same signal-processing skills and the same team. We claim no shared revenue or cost savings beyond that."""))
S.append(("ParkinSense", 50, f"""ParkinSense works like a fitness band. You wear it on the wrist, it senses your movement and heart, and it streams that over Bluetooth to our software, which shows the results on a live dashboard. These are the real prototype and the real dashboard, here reading a tremor at 4.88 hertz.
It tracks steps, activity, heart rate, HRV and blood oxygen. What makes it different is tremor detection: a tremor score, its frequency and how much of the day it lasts. And it knows when you're resting, so tremor is never counted as steps.
Where are we? Steps, tremor detection and rest-versus-movement are bench-tested. Heart rate and the dashboard work but need validation, the mobile app is in progress, and a clinical evaluation with ICMR is under way, with results pending. It is a wellness product; it does not diagnose Parkinson's."""))
S.append(("TremoSense", 45, f"""TremoSense is for people who already have tremor. This is the real build on the bench: as the handle shakes, the head stays steady.
On a motorised tremor simulator at four, six and eight hertz, the current build rejects about 90 percent of tremor. It runs a real-time operating system, samples at 208 hertz and uses higher-torque servos. The figure is founder-reported, and we'll publish the bench logs alongside the code.
Two people with tremor have tried it so far. That is encouraging, but it is not yet a study."""))
S.append(("Technical architecture", 30, f"""Briefly, how both work. They start from the same physics: separate slow voluntary motion from tremor at four to twelve hertz.
In ParkinSense, the band streams motion and pulse data, and our software runs three pipelines, with a motion-context classifier that stops tremor being counted as steps. In TremoSense, an IMU in the handle feeds a Kalman filter that estimates roll and pitch, and an LQR controller drives two servos that counter-rotate the spoon head, all within milliseconds."""))
S.append(("Competition", 45, f"""Competitors, with Indian prices checked this month.
ParkinSense's direct rivals are screenless bands. WHOOP One costs {inr(comp['WHOOP One (WHOOP 5.0)']['price'])} a year, Garmin's Cirqa {inr(comp['Garmin Cirqa']['price'])}, Google's Fitbit Air {inr(comp['Google Fitbit Air']['price'])}, and Amazfit's Helio Strap {inr(comp['Amazfit Helio Strap']['price'])} to fifteen thousand. They are excellent at sleep, recovery and battery life. None offers tremor detection, and ParkinSense costs less than all of them.
For tremor assistance, one GyroGlove costs about {sp_lakh(comp['GyroGlove']['inr'])} rupees, imported active spoons sell in India for {sp_lakh(comp['Steady Spoon (imported, desertcart.in)']['price'])} to {sp_lakh(comp['Imported active spoon (desertcart.in)']['price'])} rupees, and a weighted spoon is cheap but passive. TremoSense is an active spoon at a quarter of the cheapest import. We don't yet claim it performs as well; the user study tests that. Over to Pawan."""))
S.append(("Market", 45, f"""Thank you, Pranshu. We sized the market bottom-up, product by product.
TremoSense: Parkinson's plus essential tremor patients, half with tremor that disrupts eating, about {mk['tremosense']['customers']/1e5:.1f} lakh people. At the launch price spread over a three-year life, that's {crore(mk['tremosense']['tam'])} a year. ParkinSense's first beachhead, households living with Parkinson's, adds {crore(mk['parkinsense']['tam'])}.
Filtering to urban patients under neurologist care gives a SAM of {crore(D['market']['totals']['sam'])}, and our year-three SOM, built from 30 clinics plus online, is about {lakh(D['market']['totals']['som'], 0)}.
As a general wearable the upside is far larger: India bought 3.5 crore smartwatches in 2024. Winning just 0.25 to 1 percent of premium buyers would mean {lakh(D['market']['general']['som'])} to {crore(D['market']['general']['somRange'][2]['som'])} a year. We show it as upside only; it is not in our plan."""))
S.append(("MVP & validation", 50, f"""What has the MVP proven? Both products work on the bench. Two people with tremor have tried TremoSense informally, and ParkinSense is in a clinical evaluation with ICMR. Our bench tests had no preregistered metric, and we want to be upfront about that.
So we've set the thresholds before the study. At month six, at least ten people with tremor do a self-feeding task. If median tremor reduction is 50 percent or more and at least 60 percent would pay, we persevere. Between 30 and 50 percent, we redesign and re-test once. Below 30 percent, we kill TremoSense and focus on ParkinSense. If it works but fewer than 60 percent would pay, we pivot to clinic rental.
For ParkinSense, the pass mark is dominant-frequency error within 5 percent of a reference device and zero false steps during tremor."""))
S.append(("Business model", 35, f"""The business model. Clinicians and occupational therapists bring us patients; families buy the device.
There are four revenue streams: research kits for labs from month ten, which need no medical claim; TremoSense as a sale or rental from month twelve; and from month twenty-five the ParkinSense device and its optional subscription. In year three that's {crore(H['y3CashIn'], 2)} of cash in, most of it from TremoSense.
We assume no reimbursement. All revenue is out-of-pocket or institutional."""))
S.append(("Pricing & unit economics", 55, f"""What one sale earns. A TremoSense at {inr(ts['launchPrice'])}: take out 5 percent GST and a 15 percent clinic margin, and we net {inr(ue['tremosense']['net'])}. At small-batch cost of {inr(sB['cogs'])}, after warranty and shipping, we keep {inr(sB['contribution'])}, a {pct(sB['contributionMargin'])} contribution margin. Every unit is profitable from the first sale. Once tooling brings cost to {inr(sC['cogs'])}, we cut the price to {inr(ts['postCostPrice'])} and still earn more per unit.
A ParkinSense at {inr(D['assumptions']['P3'])}, after 18 percent GST and online fees, nets {inr(ue['parkinsenseDevice']['net'])} and keeps {inr(ue['parkinsenseDevice']['contribution'])}. The optional plan lifts lifetime value to {inr(psl['ltv'])}.
CAC is about {inr(tsl['cac'])} for TremoSense, an LTV to CAC of {tsl['ltvCac']:.1f}; ParkinSense reaches {psl['ltvCac']:.1f}, positive but thinner."""))
S.append(("Financial outlook", 50, f"""The plan starts in July 2027 and runs three years. Every line comes from our financial model.
Phase one, the first six months, is about proof: the user study, the patent filing and a regulatory opinion. It costs {lakh(H['phase1Costs'])}. Phase two launches TremoSense, with first sales in month twelve, and year three scales the clinic network and launches ParkinSense.
Year-one costs are {lakh(H['costs12'])}, a gross burn of about {lakh(H['grossBurn12'], 2)} a month. Year two still loses {sp_lakh(-H['y2Net'])} rupees as volume builds. We reach sustained operating break-even in month {H['breakEvenMonth'].split()[0][1:]}, {BE_LONG}, and year three makes an operating profit of {lakh(H['y3Profit'])} on {crore(H['y3CashIn'])} of cash in.
Getting there needs {lakh(H['fullRequirement'])} in total, and that number shapes our ask."""))
S.append(("Team & growth", 40, f"""We are both hardware engineers, and we stay the hardware and test engineers ourselves. Pranshu built ParkinSense and co-built TremoSense; he leads the company and the wearable hardware. I co-built TremoSense and lead control and power electronics.
Our gap is commercial, so from month nineteen we hire a clinic sales lead and customer support, and in month twenty-five an app and firmware engineer. The equity split will be set in a founders' agreement.
Growth runs through clinics: from a thousand caregivers reached, we target a quarter trying the device and 40 percent of those buying. These are targets, not data, and three experiments test them first."""))
S.append(("Funding ask & valuation", 55, f"""Now the ask. Reaching profitability needs {lakh(H['fullRequirement'])}, but today we raise only for milestone one: {inr(fC['equity'])}.
We propose a pre-money valuation of {lakh(V['proposed'], 0)}, a working target to negotiate. Cost to duplicate gives a floor of {lakh(V['floor'], 2)}, and a Berkus-style scorecard gives about {lakh(V['berkus'], 0)}. Post-money is P plus I, {inr(fC['post'])}, so the investor owns I over post-money: {pct(fC['investor'], 1)}. After a 5 percent ESOP pool, we keep {pct(fC['founders'], 1)}.
After this round, a second tranche of {lakh(H['phase2Requirement'])} has to close by month seven, January 2028, priced on the user-study result. If it is late, we pause hiring, inventory and testing, and the buffer covers about eight months of basic costs. The Startup India grant is applied for, not counted."""))
S.append(("Use of funds & milestones", 45, f"""Here's what the money buys. About {lakh(uf['Team'], 1)} keeps both of us full-time for six months, {lakh(uf['Validation (both products)'], 1)} builds the study units and runs the user study, and {lakh(uf['Prototyping, tools, IP'], 1)} covers prototypes, tools and the patent.
We plan to file a provisional patent in month two, build study units in month three, and in month six the user study decides kill or continue. If we continue, tranche two funds EMC testing, the CDSCO filing and a pilot batch, first sales in month twelve, and break-even in month {H['breakEvenMonth'].split()[0][1:]}.
Why could this fail? Bench results may not turn into easier eating with real food and real hands. That is exactly what the month-six study tests."""))
S.append(("Competitive advantage & close", 40, f"""So why will people choose AVERRA? TremoSense is an active spoon at about a quarter of an imported one, built and serviced in India, and it actively cancels tremor where a weighted spoon only adds mass. ParkinSense is the only screenless band here that measures tremor, at {inr(D['assumptions']['P3'])} once, with no mandatory subscription.
AVERRA: engineering better movement intelligence. We're asking for {lakh(fC['equity'], 1)} at a {lakh(V['proposed'], 0)} pre-money, {pct(fC['investor'], 1)}, to reach a clear yes-or-no on a product that's profitable on every unit. Thank you."""))
content["script"] = [{"slide": i + 1, "title": t, "seconds": s, "speaker": "Pranshu" if i < 8 else "Pawan", "text": tx.strip()} for i, (t, s, tx) in enumerate(S)]
content["scriptTotals"] = {"seconds": sum(s for _, s, _ in S), "words": sum(len(tx.split()) for _, _, tx in S)}
content["fmt"] = None
(ROOT / "data" / "content.json").write_text(json.dumps(content, indent=1, ensure_ascii=False))
print("content.json:", content["scriptTotals"], "minutes", round(content["scriptTotals"]["seconds"] / 60, 2), "· words/min", round(content["scriptTotals"]["words"] / (content["scriptTotals"]["seconds"] / 60)))
