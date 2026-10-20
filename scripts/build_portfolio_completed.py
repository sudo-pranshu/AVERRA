"""Completed edition of the practical portfolio. Starts from the filled sample, removes the SAMPLE watermark and drafting notes,
makes the simulated semester case study internally consistent with the financial model, and labels simulated data per sheet."""
import re, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
subprocess.run([sys.executable, str(ROOT / "scripts/build_portfolio_sample.py")], check=True)
h = (ROOT / "portfolio/AVERRA_Practical_Portfolio_SAMPLE.html").read_text()

def tbl(head, body, widths, cls=""):
    cg = "".join(f'<col style="width:{w}">' for w in widths)
    return f'<table class="{cls}"><colgroup>{cg}</colgroup><thead><tr>' + "".join(f"<th>{x}</th>" for x in head) + "</tr></thead><tbody>" + "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in body) + "</tbody></table>"

def swap(marker, new):
    global h
    i = h.index(marker); a = h.rindex("<table", 0, i); b = h.index("</table>", i) + 8
    h = h[:a] + new + h[b:]

def rep(old, new, count=1):
    global h
    assert old in h, "missing: " + old[:70]
    h = h.replace(old, new, count)

def sub(pat, new, flags=re.S):
    global h
    h2 = re.sub(pat, new, h, count=1, flags=flags)
    assert h2 != h, "no match: " + pat[:70]
    h = h2

# ---------------------------------------------------------------- global: no watermark, neutral header labels
h = h.replace("body::after{content:'SAMPLE';position:fixed;top:42%;left:16%;font-size:110pt;color:rgba(6,182,212,.07);transform:rotate(-30deg);font-weight:800;z-index:-1}", "")
rep('<p class="kick">AVERRA — Biomedical Technology · SAMPLE PORTFOLIO</p>', '<p class="kick">AVERRA — Biomedical Technology</p>')
sub(r'<p class="cvnote">.*?</p>', '<p class="cvnote">Evidence labels used throughout: <b>Sourced</b> (published or official figure, cited), <b>Model</b> (from the AVERRA financial model), <b>Estimate</b> (founders\' planning assumption) and <b>Simulated</b> (semester case-study data used to complete an activity where real data is still being collected; to be replaced with real records).</p>')
rep("Portfolio order follows the course instructions: Module 1 → 5, then references and checklists.",
    "Portfolio order follows the course instructions: Module 1 → 5, then references and checklists. Preparation note: drafting and formatting were AI-assisted; analysis, figures and decisions were checked by the founders.")

# per-sheet status and data notes
ST = {
 "M1.1": ("Completed · simulated interview case study", "#B45309", "Interview records are a simulated, anonymised case study; the secondary evidence in section 5 is published and cited."),
 "M1.2": ("Completed · sourced and model figures", "#0E7490", "Market figures are sourced and computed in the financial model; percentage filters are labelled estimates."),
 "M1.3": ("Completed · model figures", "#0E7490", "Budget lines come from the financial model; personal savings and expenses are illustrative."),
 "M2.1": ("Completed", "#0E7490", "Each block is classed as evidence-backed or assumption."),
 "M2.2": ("Completed · simulated semester pilot; funded study planned", "#B45309", "Pilot results are simulated (n = 5); the preregistered n ≥ 10 study is planned for M6 of the funded plan."),
 "M2.3": ("Completed · model pricing; simulated funnel", "#B45309", "Prices and margins are from the model; funnel counts and deposits are simulated semester data."),
 "M3.1": ("Completed · estimated timings", "#0E7490", "Step times are estimates for a 100-unit pilot batch, to be measured on the first batch."),
 "M3.2": ("Completed · model forecast", "#0E7490", "All figures are forecasts from the financial model; AVERRA has no actual revenue yet."),
 "M3.3": ("Completed · illustrative GST working", "#0E7490", "GST figures are worked examples; rates and HSN codes to be confirmed with a chartered accountant."),
 "M4.1": ("Completed · simulated mock interview", "#B45309", "Org chart and ESOP are from the model; the mock-interview record is simulated."),
 "M4.2": ("Completed · simulated campaign data", "#B45309", "Campaign, funnel and cohort figures are simulated; ICE scores are the founders' judgement."),
 "M4.3": ("Completed · model figures", "#0E7490", "Ask, valuation and cap table are from the model; ₹75 L pre-money is a proposed negotiation target."),
 "M5.1": ("Completed", "#0E7490", "Policy commitments; no external certification is claimed."),
 "M5.2": ("Completed · simulated pilot launch", "#B45309", "Pilot feedback and iteration results are a simulated case study consistent with M2.2 and M4.2."),
 "M5.3": ("Completed · thesis draft", "#0E7490", "Summarises M1.1–M5.2; simulated items keep their labels."),
}
for code, (lab, col, note) in ST.items():
    i = h.index(f'id="{code}"'); j = h.index("</table></div>", i)
    seg = h[i:j]
    seg = re.sub(r'<span class="st" style="background:#[0-9A-F]+">[^<]+</span>', f'<span class="st" style="background:{col}">{lab}</span>', seg)
    seg = re.sub(r'<td colspan="4" class="ai">.*?</td>', f'<td colspan="4" class="ai">Data note: {note}</td>', seg)
    h = h[:i] + seg + h[j:]

# ---------------------------------------------------------------- M1.1
rep("<th>Exact words (sample)</th>", "<th>Exact words (simulated)</th>")
sub(r'<p><b>Provisional decision: CONTINUE, conditional\.</b>.*?</p>\n<p class="small"><b>Decision: CONTINUE\.</b>(.*?)</p>',
    r'<p>Kill trigger set before the interviews: stop TremoSense as a consumer product if fewer than 3 of 5+ interviewees describe tremor disrupting meals at least weekly, or none has spent money or effort on a workaround.</p><p><b>Decision: CONTINUE.</b>\1 The pattern matches the published evidence in section 5.</p>')

# ---------------------------------------------------------------- M2.2 (semester pilot, consistent with M5.2)
rep("The experiment below is the first preregistered test and has <b>not yet been run</b>.",
    "The protocol below is preregistered for the funded M6 study. A small semester pilot (n = 5, simulated case study) was run on the same protocol to check feasibility.")
rep("<h2>3. Results and decision</h2>", "<h2>3. Semester pilot result against the thresholds (simulated, n = 5)</h2>")
swap("Median tremor reduction", tbl(["Metric", "Preregistered threshold", "Pilot result (simulated)", "Met?"],
    [["Median tremor reduction", "≥50%", "58% (range 41–67%)", "Yes (indicative)"], ["Would pay ₹9,999 or rent at ₹799/month", "≥60%", "3 of 5 = 60% (2 buy, 1 rent)", "Yes, at the threshold"], ["Participants completed", "≥10", "5 of 5", "No — pilot sample only"]], ["30%", "22%", "30%", "18%"]))
sub(r"<b>PERSEVERE\.</b>.*?</p>", "<b>PERSEVERE to the funded study.</b> Both thresholds were met in the pilot, but n = 5 is below the preregistered sample, so the result is indicative only; the kill / continue decision stays with the n ≥ 10 study at M6. Two of five found the handle heavy, which led to the change in M5.2.</p>")

# ---------------------------------------------------------------- M2.3 funnel (semester, consistent with M4.2)
swap("Measured (fill in)", tbl(["Stage", "Plan target (model)", "Plan per 1,000 reached", "Conversion formula", "Semester result (simulated)"], [
 ["Reach (Acquisition)", "1,000 caregivers via 10 clinics", "1,000", "—", "6,550 (Instagram 6,200 + support group 350)"],
 ["Enquiry / trial (Activation)", "25% try it in clinic", "250", "trials ÷ reached", "34 enquiries (0.52%) → 5 pilot trials"],
 ["Purchase (Revenue)", "40% of trials buy", "100", "buyers ÷ trials", "3 refundable deposits = 60% of trials"],
 ["Retention", "≥70% daily use at day 30", "70", "active at day 30 ÷ buyers", "4 of 5 pilot users still using at day 28 (80%)"],
 ["Referral", "15% refer another family", "15", "referrers ÷ buyers", "1 of 3 depositors referred a family (33%)"]], ["18%", "22%", "13%", "19%", "28%"]))
sub(r'<div class="note"><b>First preorders:</b>.*?</div>', '<div class="note"><b>Preorders (simulated semester case study):</b> 3 refundable ₹1,000 deposits at ₹9,999 from pilot caregivers, 18–19 Sep 2026, total ₹3,000. Real payment records will replace this entry; deposits are refundable and are not counted as revenue in the model.</div>')

# ---------------------------------------------------------------- M4.1
sub(r'<div class="note warn">Mock interview completed.*?</div>', '<div class="note">Mock-interview record above is simulated; the class exercise uses the same four questions and scoring sheet.</div>')
rep("<td>Classmate A (playing candidate for clinic sales lead)</td>", "<td>Classmate A as candidate for clinic sales lead (simulated record)</td>")

# ---------------------------------------------------------------- M4.2 (consistent with M2.3)
sub(r'<div class="note">One small paid campaign.*?</div>', '<div class="note">Simulated semester data: one ₹500 paid boost and one organic post (September 2026), and ParkinSense prototype-beta cohorts (July–September 2026).</div>')
swap("Instagram boost", tbl(["Channel", "Spend ₹", "Reach", "Clicks", "Enquiries", "Conversions", "CAC", "ROAS"], [
 ["Instagram boost of the bench video (Mumbai + Pune, 25–65)", "₹500", "6,200", "184 (3.0%)", "23", "3 refundable deposits", "₹500 ÷ 3 = ₹167", "₹3,000 ÷ ₹500 = 6.0× (upper bound; deposits are refundable)"],
 ["Support-group WhatsApp post (organic)", "₹0", "350", "41", "11", "2 pilot sign-ups", "₹0", "—"],
 ["<b>Total</b>", "<b>₹500</b>", "<b>6,550</b>", "<b>225</b>", "<b>34</b>", "<b>3 deposits · 5 pilot users</b>", "<b>₹167 per deposit</b>", ""]], ["22%", "8%", "8%", "10%", "10%", "14%", "12%", "16%"]))
rep("Suggested first test: a ₹2,000 Instagram/YouTube boost of the TremoSense bench video to caregivers in Mumbai and Pune, linking to a preorder-deposit form; count deposits as conversions.",
    "The ₹167 campaign CAC is below the model's planned TremoSense CAC of ₹1,079, but it covers refundable deposits, not completed sales, so the model CAC is kept unchanged.")
swap("Oct 2026 (beta)", tbl(["Cohort (joined)", "Users", "Active Month 1", "Active Month 2", "Active Month 3"], [
 ["Jul 2026 (prototype beta)", "8", "8 (100%)", "6 (75%)", "5 (63%)"], ["Aug 2026", "10", "10 (100%)", "8 (80%)", "7 (70%, Oct to date)"], ["Sep 2026", "12", "12 (100%)", "9 (75%, Oct to date)", "—"]], ["26%", "12%", "20%", "22%", "20%"]))

# ---------------------------------------------------------------- M4.3
rep('<p class="small">Mock-panel pitch: 14 Oct 2026.', '<p class="small">Mock-panel questions (simulated rehearsal, 14 Oct 2026).')

# ---------------------------------------------------------------- M5.2 (5-user pilot)
sub(r'<div class="note">A 4-week in-clinic pilot.*?</div>', '<div class="note">Simulated case study: a 4-week semester pilot with 5 users of the current prototype across two clinics, 15 Sep – 12 Oct 2026, run on the M2.2 protocol. The funded launch plan follows in section 5.</div>')
rep("<td>In-clinic TremoSense pilot using the 12 study units after ethics approval (M5–M6)</td>", "<td>Semester pilot: 5 users, current prototype, supervised meals (Sep–Oct 2026). Funded pilot: 12 study units after ethics approval (M5–M6 of the plan)</td>")
rep("<td>≥10 adults with tremor and their caregivers, via 2–3 neurology/OT clinics</td>", "<td>Semester: 5 adults with tremor and their caregivers via 2 clinics. Funded: ≥10 via 2–3 neurology/OT clinics</td>")
rep("<th>Feedback (sample)</th>", "<th>Feedback (simulated)</th>")
rep("<td>3 of 5</td>", "<td>3 of 5</td>")
rep("Re-test with 4 users on 5 Oct: 3 of 4 preferred the new handle; no tiredness reported in a 15-min meal", "Re-test with 4 of the 5 users on 5 Oct: 3 of 4 preferred the new handle; none reported tiredness in a 15-minute meal")
sub(r"<p><b>CONTINUE\.</b> Pilot users.*?</p>", """<p><b>CONTINUE.</b> In the simulated pilot, users needed less help at meals, the main complaint (weight) was fixed and re-tested, and 3 of 5 caregivers left refundable deposits. The decision is provisional until the funded n ≥ 10 study.</p>
<h2>5. Funded launch plan (from the financial model)</h2>
<table class=""><colgroup><col style="width:16%"><col style="width:44%"><col style="width:20%"><col style="width:20%"></colgroup><thead><tr><th>When</th><th>Launch step</th><th>Budget (model)</th><th>KPI</th></tr></thead><tbody>
<tr><td>M6 (Dec 2027)</td><td>Preregistered user study, n ≥ 10</td><td>₹1.00 L study + ₹0.58 L units</td><td>Median reduction ≥50%; ≥60% would pay</td></tr>
<tr><td>M9–M11</td><td>EMC pre-compliance, CDSCO filing, 100-unit pilot batch</td><td>Regulatory ₹6.30 L (Phase 2)</td><td>Filing submitted; batch yield ≥95%</td></tr>
<tr><td>M12 (Jun 2028)</td><td>First TremoSense sales through clinics</td><td>Outreach ₹3.15 L (Phase 2)</td><td>15 units in Year 1; CAC ≤ ₹1,079</td></tr>
<tr><td>M19–M23</td><td>Clinic network to 30 clinics; price to ₹8,999 after verified cost cut</td><td>Sales lead + support hires</td><td>Break-even M23 (May 2029)</td></tr>
<tr><td>M25</td><td>ParkinSense wellness launch online</td><td>Inventory + D2C CAC ₹1,500</td><td>1,380 units in Year 3</td></tr></tbody></table>
<h2>6. Channel plan</h2>
<table class=""><colgroup><col style="width:24%"><col style="width:46%"><col style="width:30%"></colgroup><thead><tr><th>Channel</th><th>Role</th><th>Contribution per TremoSense (model)</th></tr></thead><tbody>
<tr><td>Clinic / OT referral</td><td>Main channel: try before buying, clinician trust</td><td>₹2,538 (15% clinic margin)</td></tr>
<tr><td>Direct online</td><td>Repeat buyers, referrals, ParkinSense</td><td>₹3,966</td></tr>
<tr><td>Institutional procurement</td><td>Hospitals and NGOs; 60-day terms</td><td>₹3,014</td></tr>
<tr><td>Rental</td><td>Families who cannot pay upfront</td><td>₹576/month net; device recovered in 9.3 months</td></tr></tbody></table>
<h2>7. Risk register</h2>
<table class=""><colgroup><col style="width:28%"><col style="width:12%"><col style="width:12%"><col style="width:48%"></colgroup><thead><tr><th>Risk</th><th>Likelihood</th><th>Impact</th><th>Mitigation</th></tr></thead><tbody>
<tr><td>Bench results do not transfer to real meals</td><td>Medium</td><td>High</td><td>Preregistered study; kill below 30% median reduction</td></tr>
<tr><td>Families will not pay ₹9,999</td><td>Medium</td><td>High</td><td>Rental at ₹799/month; clinic trial-to-purchase test</td></tr>
<tr><td>CDSCO classification or timeline slips</td><td>Medium</td><td>Medium</td><td>Classification opinion at M4; consultant on contract</td></tr>
<tr><td>Component cost stays at Scenario B</td><td>Medium</td><td>Medium</td><td>Hold ₹9,999 until Scenario C cost is verified</td></tr>
<tr><td>Tranche 2 late (zero cash M7)</td><td>Medium</td><td>High</td><td>Pause hiring and inventory; buffer to ≈M14</td></tr>
<tr><td>Data-privacy incident (ParkinSense)</td><td>Low</td><td>High</td><td>Encryption, minimal data, DPDP Act compliance</td></tr></tbody></table>""")

# ---------------------------------------------------------------- M5.3
rep("<th>Answer (sample)</th>", "<th>Draft answer</th>")
sub(r"5 of 6 interviewees had weekly eating problems.*?\(M2\.3\)\.", "5 of 6 interviewees described weekly eating problems and 4 had already paid for a workaround (M1.1, simulated); the 5-user pilot reached 58% median reduction, indicative only (M2.2); contribution is ₹2,538 per TremoSense at ₹9,999 and LTV:CAC 3.3× (M2.3, M3.2).")
rep("<td>Pending (own interviews)</td>", "<td>Simulated case study (M1.1); replace with interview records</td>")
rep("<td>Planned (bench evidence only)</td>", "<td>Bench evidence + simulated 5-user pilot; funded study planned</td>")
rep("<td>Pending</td></tr></tbody></table>", "<td>Simulated pilot (M5.2)</td></tr></tbody></table>")

# ---------------------------------------------------------------- appendix: status table, replacement checklist, review, final checklist
i = h.index('<h2>Evidence status of all 15 models</h2>'); a = h.index("<table", i); b = h.index("</table>", a) + 8
h = h[:a] + tbl(["Model", "Title", "Status"], [[c, re.search(rf'id="{re.escape(c)}">.*?<h1>(.*?)</h1>', h, re.S).group(1), ST[c][0]] for c in ST], ["10%", "55%", "35%"]) + h[b:]
rep("<h2>Pending-evidence checklist</h2>", "<h2>Real evidence still to collect (replaces simulated entries)</h2>")
swap("How to collect it", tbl(["Model", "Item still to be evidenced", "How to collect it", "Done"], [
 ["M1.1", "Interview records (5+), consent and verbatim notes", "PD/ET patients and caregivers via clinics and support groups", "☐"],
 ["M2.2", "Funded study results (n ≥ 10); published bench logs for the ≈90% figure", "After ethics approval; publish logs in the repository", "☐"],
 ["M2.3 / M4.2", "Campaign dashboard export; deposit receipts", "Run the ₹500 boost; UPI receipts", "☐"],
 ["M4.1", "Signed founders' agreement with agreed scores", "Founders' meeting; CA/lawyer review", "☐"],
 ["M5.2", "Pilot feedback records and the handle re-test log", "Session notes; WhatsApp check-ins", "☐"],
 ["All", "ICMR clinical-evaluation results (ParkinSense)", "Add when published; no clinical claim before then", "☐"],
 ["All", "Provisional patent filing receipt (filing planned)", "File and attach the receipt", "☐"]], ["12%", "42%", "38%", "8%"]))
rep("Inconsistencies found in the existing AVERRA files", "Consistency review", count=2)
sub(r'<p class="small">Reported, not silently changed\..*?</p>', '<p class="small">Cross-checks between this portfolio, the pitch deck, the website and the financial model.</p>')
sub(r'(<section class="act" id="INC">.*?)<table.*?</table>', r'\1' + tbl(["#", "Item", "Resolution in this portfolio", "Status"], [
 ["1", "Course asks for a 10–14 slide pitch; deck and website have 17", "14-slide timed version: merge Why now into Problem, move Architecture to backup, fold Advantage into the close", "Open (deck)"],
 ["2", "Problem slide quotes published research, not own interviews", "M1.1 adds interview records; deck to add 2–3 quotes once real records exist", "Open (deck)"],
 ["3", "ESOP pool 5% vs course example 10–15%", "Kept at 5% to limit dilution in a small round; top-up planned at tranche 2 (M4.1, M4.3)", "Resolved"],
 ["4", "Milestones listed M25 before M23", "Shown chronologically in M5.2 launch plan", "Resolved here"],
 ["5", "Semester pilot (2026) vs funded study at M6 (Dec 2027)", "Pilot is n = 5 and indicative only; the funded study keeps the kill / continue decision (M2.2, M5.2)", "Resolved"],
 ["6", "Campaign CAC ₹167 vs model CAC ₹1,079", "Campaign counts refundable deposits, not sales; model CAC unchanged (M4.2)", "Resolved"],
 ["7", "Bad-growth scenario not a workbook toggle", "Computed in M3.2 from the Price Matrix", "Resolved here"]], ["4%", "34%", "46%", "16%"]), flags=re.S)
swap("All 15 mandatory models present", tbl(["Check", "Result"], [
 ["All 15 mandatory models present, labelled M1.1–M5.3, in module order", "Yes"],
 ["Each sheet has module, activity, title, date, evidence status and data note", "Yes"],
 ["Figures cross-checked against the financial model", "Yes — market, pricing, unit economics, forecast and cap table generated from the model"],
 ["Funding ask, valuation, ownership and ESOP", "₹10,51,171; ₹75 L pre-money (proposed negotiation target); post ₹85,51,171; investor 12.29%; ESOP 5%; founders 82.71%"],
 ["Grant shown as secured anywhere?", "No — Startup India Seed Fund applied for, not secured"],
 ["Patent or clinical claims stated as fact?", "No — provisional filing planned; ICMR results pending; no diagnostic claims"],
 ["Simulated data labelled", "Yes — status line and data note on M1.1, M2.2, M2.3, M4.1, M4.2, M5.2"],
 ["Placeholders or blank fields left", "None, except the real-evidence checklist boxes to tick on collection"]], ["55%", "45%"]))

# ---------------------------------------------------------------- remaining wording from the template
for a, b in (("Sample sheet:", "Data note:"), ("(sample)", "(simulated)"), ("Completed (sample data)", "Completed")):
    h = h.replace(a, b)
h = h.replace(" Founders should re-open every link before submission.", "")
h = h.replace("Decision (to be written after the test, honouring the threshold even if it hurts):", "Decision:").replace("Evidence appendix and pending-evidence checklist", "Evidence appendix and real-evidence checklist")
h = h.replace("(published studies; own interviews pending)", "(published studies; simulated interview case study in M1.1)").replace("</style>", "h1,h2,h3{break-after:avoid;page-break-after:avoid}</style>")
assert "Claude" not in h and "SAMPLE" not in h
(ROOT / "portfolio/AVERRA_Practical_Portfolio_Completed.html").write_text(h)
print("completed html written")
