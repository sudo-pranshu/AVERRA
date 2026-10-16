"""Makes a SAMPLE copy of the practical portfolio with every fill-in completed using illustrative (made-up) data,
for classmates to see what a finished portfolio looks like. Every page is watermarked SAMPLE; the real portfolio is unchanged."""
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
h = (ROOT / "portfolio/AVERRA_Practical_Portfolio.html").read_text()

def tbl(head, body, cls="", widths=None):
    cg = "".join(f'<col style="width:{w}">' for w in widths) if widths else ""
    return f'<table class="{cls}"><colgroup>{cg}</colgroup><thead><tr>' + "".join(f"<th>{x}</th>" for x in head) + "</tr></thead><tbody>" + "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in body) + "</tbody></table>"

def swap(marker, new):
    """Replace the whole <table> whose header contains marker."""
    global h
    i = h.index(marker); a = h.rindex("<table", 0, i); b = h.index("</table>", i) + 8
    h = h[:a] + new + h[b:]

def rep(old, new):
    global h
    assert old in h, old[:60]
    h = h.replace(old, new)

# ---------------------------------------------------------------- M1.1
swap("Respondent type (no names needed", tbl(["#", "Date", "Respondent (anonymised)", "Exact words (sample)", "Pain · frequency · workaround · spend"], [
 ["1", "22 Aug 2026", "Daughter, 52, caring for father with PD (Dadar)", "“At lunch he spills half the dal, so I just feed him now. He hates it. Last Sunday he refused to eat with the family.”", "Spills daily · feeds him herself · ≈1 h/day of her time"],
 ["2", "24 Aug 2026", "Man, 67, essential tremor (Thane)", "“I stopped ordering soup at restaurants about two years ago. I hold the cup with both hands at home.”", "Avoids liquids in public · weekly · two-hand grip · no spend"],
 ["3", "27 Aug 2026", "Woman, 71, PD (Andheri)", "“My son bought a heavy steel spoon online for ₹1,800. It helped a bit but my wrist pains after ten minutes.”", "Daily · weighted spoon · ₹1,800 spent"],
 ["4", "29 Aug 2026", "Son, 38, father with PD (Pune)", "“The neurologist sees him for ten minutes every three months. Whatever happened in between, we have to remember it.”", "Clinic snapshot · quarterly · keeps WhatsApp notes"],
 ["5", "2 Sep 2026", "Occupational therapist (Bandra clinic)", "“About one in five of my tremor patients asks about adaptive cutlery. The imported ones cost more than most families can spend.”", "Recurring ask · weekly · recommends built-up handles"],
 ["6", "4 Sep 2026", "Wife, 64, husband with ET (Borivali)", "“He eats before guests arrive so nobody sees him shake. We tried a ₹600 rubber grip; it didn't stop the shaking.”", "Embarrassment · each visit · ₹600 grip"]], "", ["4%", "10%", "20%", "40%", "26%"]))
swap("Count out of N", tbl(["Signal", "Count out of N = 6", "Evidence (interview #)"], [["Same pain mentioned (eating disrupted)", "5 / 6", "1, 2, 3, 6 (and 5 as a clinician)"], ["Weekly or more frequent", "5 / 6", "1, 2, 3, 5, 6"], ["Has an existing workaround", "6 / 6", "All"], ["Has already paid money/time/reputation", "4 / 6", "1 (time), 3 (₹1,800), 6 (₹600), 2 (avoids eating out)"], ["Clinician measures movement only in clinic", "2 / 6", "4, 5"]], "", ["40%", "20%", "40%"]))
rep("Final decision line (write after interviews): ________________________________________________", "<b>Decision: CONTINUE.</b> 5 of 6 describe tremor disrupting meals at least weekly and 4 of 6 have already spent money or time on a workaround that does not fully work, which clears our kill trigger.")
# ---------------------------------------------------------------- M1.2 / M1.3
rep("Timed delivery: ______ s (fill in after practice).", "Timed delivery: 86 s (third rehearsal, 9 Sep 2026).")
swap("Personal savings (₹)", tbl(["Founder", "Personal savings (₹)", "Personal monthly expenses (₹)", "Personal runway (months)"], [["Pranshu Kumar", "₹60,000", "₹8,000", "60,000 ÷ 8,000 = 7.5"], ["Pawan Shinde", "₹45,000", "₹7,500", "45,000 ÷ 7,500 = 6.0"]], "num", ["25%", "25%", "25%", "25%"]))
# ---------------------------------------------------------------- M2.2
swap("Actual result", tbl(["Metric", "Preregistered threshold", "Actual result", "Met?"], [["Median tremor reduction", "≥50%", "58% (IQR 47–66%)", "Yes"], ["Would pay ₹9,999 / rent", "≥60%", "7 of 11 = 64% (4 buy, 3 rent)", "Yes"], ["Participants completed", "≥10", "11 of 12 enrolled", "Yes"]], "", ["30%", "25%", "30%", "15%"]))
rep("PERSEVERE / REDESIGN / PIVOT / KILL — ______________________", "<b>PERSEVERE.</b> Both preregistered thresholds were met. Two participants found the handle heavy; this feeds the M5.2 change.")
# ---------------------------------------------------------------- M2.3 funnel measured column + preorder
for stage, val in (("Reach (Acquisition)", "1,000 (3 clinics + support group)"), ("Enquiry / trial (Activation)", "212 (21.2%)"), ("Purchase (Revenue)", "78 (36.8% of trials; 7.8% overall)"), ("Retention", "54 (69%)"), ("Referral", "9 (11.5%)")):
    h = re.sub(r"(<td>" + re.escape(stage) + r"</td>(?:<td>.*?</td>){3})<td></td>", r"\1<td>" + val + "</td>", h, count=1)
rep("No real sale or preorder exists yet. Proof of a first sale or credible preorder (receipt, message, payment screenshot) must be attached here when it happens. Until then this part is <b>awaiting evidence</b>.",
    "<b>First preorders:</b> 3 refundable ₹1,000 deposits at ₹9,999 collected via UPI on 18–19 Sep 2026 from study caregivers (payment screenshots attached behind this page).")
# ---------------------------------------------------------------- M4.1
swap("Interviewer (classmate)", tbl(["Interviewer (classmate)", "Date", "Q1", "Q2", "Q3", "Q4", "Total /20", "Notes"], [["Classmate A (playing candidate for clinic sales lead)", "3 Oct 2026", "4", "3", "4", "5", "16", "Strong empathy and concrete examples; weaker on pipeline numbers"]], "", ["18%", "10%", "7%", "7%", "7%", "7%", "10%", "34%"]))
swap("Pranshu (1–10)", tbl(["Factor (weight)", "Pranshu (1–10)", "Pawan (1–10)", "Weighted P / W"], [["Idea and IP (25%)", "8", "7", "2.00 / 1.75"], ["Capital contributed (15%)", "5", "5", "0.75 / 0.75"], ["Full-time commitment (35%)", "9", "9", "3.15 / 3.15"], ["Prior expertise (25%)", "8", "8", "2.00 / 2.00"], ["<b>Total</b>", "", "", "<b>7.90 / 7.65</b>"]], "", ["34%", "16%", "16%", "34%"]))
rep("<i>Illustrative only:</i> if both founders score equally, each holds 50% of founder equity = 41.36% after Round 1.", "Pranshu 7.90 ÷ 15.55 = 50.8% of founder equity → 42.02% after Round 1; Pawan 7.65 ÷ 15.55 = 49.2% → 40.69%.")
rep("Mock interview record pending; complete it with a classmate and attach notes.", "Mock interview completed with a classmate on 3 Oct 2026 using the four questions above.")
# ---------------------------------------------------------------- M4.2
swap("CAC = spend ÷ conversions", tbl(["Channel", "Spend ₹", "Reach", "Clicks", "Enquiries", "Conversions", "CAC", "ROAS"], [["Instagram boost of the bench video (Mumbai + Pune, 25–65)", "₹500", "6,200", "184 (3.0%)", "23", "3 deposits", "₹500 ÷ 3 = ₹167", "₹3,000 ÷ ₹500 = 6.0×"], ["Support-group WhatsApp post (organic)", "₹0", "≈350 members", "41", "11", "2 study sign-ups", "₹0", "—"]], "", ["24%", "8%", "9%", "10%", "10%", "11%", "14%", "14%"]))
swap("Active Month 1", tbl(["Cohort (joined)", "Users", "Active Month 1", "Active Month 2", "Active Month 3"], [["Oct 2026 (beta)", "12", "12 (100%)", "10 (83%)", "9 (75%)"], ["Nov 2026", "15", "15 (100%)", "13 (87%)", "—"], ["Dec 2026", "9", "9 (100%)", "—", "—"]], "", ["24%", "16%", "20%", "20%", "20%"]))
rep("No paid campaign or structured organic experiment has been run yet, so there are no reach, click, CAC, ROAS or retention figures to report. The tables are ready to complete; nothing below is measured.", "One small paid campaign and one organic push were run in September 2026; retention is tracked for the ParkinSense wellness-beta cohorts.")
# ---------------------------------------------------------------- M4.3
rep("Mock-panel pitch date: ________ · Panel questions and our answers: ____________________ (fill in after the class pitch).", "Mock-panel pitch: 14 Oct 2026. Questions: “Why ₹75 L and not ₹60 L?” → cost-to-duplicate floor plus two products and an ongoing clinical evaluation; “What if the study fails?” → preregistered kill rule at <30%; “Why clinics, not online?” → caregivers want to try before buying.")
# ---------------------------------------------------------------- M5.2
swap("Exact feedback (verbatim)", tbl(["#", "Date", "User type", "Feedback (sample)", "Theme"], [
 ["1", "21 Sep 2026", "Man, 69, PD", "“The food stays on the spoon now. But my hand gets tired holding it.”", "Weight"],
 ["2", "22 Sep 2026", "Caregiver, daughter", "“He finished his whole plate without me helping. First time in months.”", "Independence"],
 ["3", "24 Sep 2026", "Woman, 66, ET", "“It is a little heavy, and I wasn't sure when it was switched on.”", "Weight; status light"],
 ["4", "26 Sep 2026", "OT therapist", "“Patients need a clear on/off light and a lighter handle.”", "Weight; status light"],
 ["5", "28 Sep 2026", "Man, 72, PD", "“Charging every night is fine if it lasts through dinner.”", "Battery"]], "", ["5%", "12%", "18%", "45%", "20%"]))
swap("How many users", tbl(["Recurring theme", "How many users", "Change we made", "What happened after"], [["Handle too heavy", "3 of 5", "Moved the battery lower in the handle and switched to a lighter boost board: 182 g → 164 g", "Re-test with 4 users on 5 Oct: 3 of 4 preferred the new handle; no tiredness reported in a 15-min meal"], ["Unclear on/off state", "2 of 5", "Added a green status LED", "No more confusion reported"]], "", ["22%", "12%", "34%", "32%"]))
rep("<b>Incomplete.</b> AVERRA has not run a launch or pilot launch. Two people with tremor have tried TremoSense informally (founder-reported, no recorded metric). This sheet therefore holds the launch plan and the evidence template; it must not be presented as a completed launch.", "A 4-week in-clinic pilot with the 12 study units ran from 15 Sep to 12 Oct 2026 across two clinics.")
rep("<b>Not yet decidable on market evidence.</b> Current call: continue to the preregistered pilot. Final call (after the pilot): ______________________", "<b>CONTINUE.</b> Pilot users completed meals with less help, the main complaint (weight) was fixed and re-tested, and 3 caregivers paid refundable deposits.")
# ---------------------------------------------------------------- M5.3 thesis
swap("Your answer, with evidence", tbl(["Question", "Answer (sample)"], [
 ["Start, operate, fund or join?", "START: I would start this venture."],
 ["Evidence from my M1–M5 work", "5 of 6 interviewees had weekly eating problems and 4 had already paid for a workaround (M1.1); the pilot met both preregistered thresholds (M2.2); unit contribution is ₹2,538 at ₹9,999 (M2.3)."],
 ["What changed my thinking", "Caregivers, not patients, make the buying decision, so clinics and caregivers became our channel; weight mattered more than I expected."],
 ["What would change my answer", "A larger study below 30% median reduction, or fewer than 30% of trial users buying at ₹9,999."]], "", ["40%", "60%"]))

# ---------------------------------------------------------------- dates, statuses, labels
dates = iter(["12 Aug 2026", "19 Aug 2026", "26 Aug 2026", "2 Sep 2026", "9 Sep 2026", "16 Sep 2026", "23 Sep 2026", "26 Sep 2026", "30 Sep 2026", "3 Oct 2026", "7 Oct 2026", "10 Oct 2026", "12 Oct 2026", "14 Oct 2026", "16 Oct 2026"])
h = re.sub(r"<b>Date completed</b> ____ / ____ / 2026", lambda m: "<b>Date completed</b> " + next(dates), h)
h = h.replace("Submission date</td><td>____ / ____ / 2026", "Submission date</td><td>16 Oct 2026")
h = re.sub(r'<span class="st" style="background:#[0-9A-F]+">[^<]+</span>', '<span class="st" style="background:#0E7490">Completed (sample data)</span>', h)
h = re.sub(r'<td colspan="4" class="ai">.*?</td>', '<td colspan="4" class="ai">Sample sheet: names, quotes, results and figures marked as study, pilot, campaign or interview data are illustrative examples.</td>', h)
h = re.sub(r'<div class="note warn"><b>Pending evidence\.</b>.*?</div>', "", h, flags=re.S)
h = h.replace('<p class="kick">AVERRA — Biomedical Technology</p>', '<p class="kick">AVERRA — Biomedical Technology · SAMPLE PORTFOLIO</p>')
h = h.replace("This portfolio separates completed evidence from planned work. Pages marked <i>Awaiting real-world evidence</i> or <i>Planned</i> are honest placeholders, not completed activities.",
              "Sample edition: every activity is filled in so the format can be followed. Interview, study, pilot, campaign and personal-finance figures are illustrative examples, not real AVERRA evidence. Market, pricing and financial-model figures are from the AVERRA model.")
h = h.replace("</style>", "body::after{content:'SAMPLE';position:fixed;top:42%;left:16%;font-size:110pt;color:rgba(6,182,212,.07);transform:rotate(-30deg);font-weight:800;z-index:-1}</style>")
for a, b in ((" (fill in after running one campaign or organic push)", ""), (" (fill in from real users)", ""), (" (complete after interviews)", ""), (" (fill in only with real results)", ""), (" (complete with real feedback only)", ""), (" (each founder fills in their own; not invented here)", ""), (" (scores to be agreed by the founders)", ""), (" (each founder writes their own; not drafted for you)", "")):
    h = h.replace(a, b)
h = h.replace('<div class="note warn">One small paid', '<div class="note">One small paid').replace('<div class="note warn">A 4-week', '<div class="note">A 4-week').replace('<div class="note warn"><b>First preorders', '<div class="note"><b>First preorders')
(ROOT / "portfolio/AVERRA_Practical_Portfolio_SAMPLE.html").write_text(h)
print("sample html written")
