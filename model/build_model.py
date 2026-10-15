"""AVERRA financial model — single source of truth.

Run:  python build_model.py  →  AVERRA_Financial_Model.xlsx (live formulas)
Then: python ../scripts/recalc_and_export.py  →  recalculates and writes averra-data.json,
which the PowerPoint generator and the website both read. Change inputs HERE (blue cells), never in the deck or site.
"""
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter as L

wb = Workbook()
F = lambda **k: Font(name="Arial", size=k.pop("size", 10), **k)
BLUE, BLACK, GREEN, BOLD, TITLE = F(color="0000FF"), F(), F(color="008000"), F(bold=True), F(bold=True, size=14)
HEAD = F(bold=True, size=10, color="FFFFFF")
HFILL, YEL = PatternFill("solid", fgColor="0F172A"), PatternFill("solid", fgColor="FFFF00")
INR, PCT, NUM, X = '₹#,##0;(₹#,##0);"-"', '0.0%;(0.0%);"-"', '#,##0;(#,##0);"-"', '0.0"×"'

def head(ws, row, labels, widths=None):
    for i, t in enumerate(labels, 1):
        c = ws.cell(row=row, column=i, value=t); c.font, c.fill = HEAD, HFILL
        c.alignment = Alignment(wrap_text=True, vertical="center")
    for i, w in enumerate(widths or [], 1):
        ws.column_dimensions[L(i)].width = w

def put(ws, ref, v, fmt=None, font=None, fill=None):
    c = ws[ref]; c.value = v
    c.font = font or (BLUE if isinstance(v, (int, float)) else (GREEN if isinstance(v, str) and v.startswith("=") and "!" in v else BLACK))
    if fmt: c.number_format = fmt
    if fill: c.fill = fill
    return c

# ============================================================ Assumptions
A = wb.active; A.title = "Assumptions"
A["A1"] = "AVERRA — model inputs (blue = input · yellow = key assumption to confirm · black = formula)"; A["A1"].font = TITLE
head(A, 3, ["ID", "Input", "Value", "Unit", "Status", "Source / basis"], [7, 56, 14, 12, 16, 92])
R = {}
rows = [
    # market
    ("M1", "India population aged 60+ (2022)", 149_000_000, "people", NUM, "Sourced", "UNFPA India Ageing Report 2023 (The National, 28 Sep 2023)", 0),
    ("M2", "60+ share of population (2022)", 0.105, "%", PCT, "Sourced", "UNFPA India Ageing Report 2023", 0),
    ("M3", "PD prevalence, age 60+", 308.9 / 1e5, "rate", "0.000%", "Sourced", "Je et al., Anand (Gujarat) 2019–20, via Khurana & Gourie-Devi, Cureus 2025", 0),
    ("M4", "Essential-tremor crude prevalence", 89.96 / 1e5, "rate", "0.000%", "Sourced", "Chin et al., rural Gujarat, Mov Disord 2021 (single study)", 1),
    ("M5", "Urban share of population", 0.311, "%", PCT, "Sourced", "Census of India 2011 (dated)", 0),
    ("M6", "Urban patients under regular neurologist follow-up", 0.40, "%", PCT, "Estimate", "Founders' estimate — validate in discovery", 1),
    ("M7", "PD + ET patients whose tremor disrupts eating", 0.50, "%", PCT, "Estimate", "Founders' estimate — validate with neurologists / OTs", 1),
    ("M8", "Device replacement life", 3, "years", NUM, "Estimate", "Engineering estimate", 0),
    # prices
    ("P1", "TremoSense launch price (incl. GST) — RECOMMENDED", 9999, "₹", INR, "Decision", "Chosen from Price Matrix: lowest round price with ≥30% contribution margin at Scenario B cost", 1),
    ("P2", "Lowest viable TremoSense price at verified C cost (NOT used in plan)", 6999, "₹", INR, "Option", "≈42% contribution at C; an affordability option once profitability is secure", 1),
    ("P13", "TremoSense price from M19, once Scenario C cost is verified (incl. GST)", 8999, "₹", INR, "Decision", "Price cut shared with customers after verified cost reduction; still ≥40% contribution at C", 1),
    ("P3", "ParkinSense wellness wearable price (incl. GST)", 7999, "₹", INR, "Decision", "Hypothesis to test; below Amazfit Bip 6 (₹8,999) and Fitbit Charge 6 (₹12,999); positive contribution after CAC", 1),
    ("P4", "ParkinSense Movement Insights subscription (incl. GST)", 199, "₹/month", INR, "Decision", "Optional subscription; to test", 1),
    ("P5", "ParkinSense research-use-only (RUO) kit (incl. GST)", 74999, "₹/kit", INR, "Decision", "5 wearables + 12-month analytics licence for labs", 0),
    ("P6", "GST — TremoSense (assistive / medical device)", 0.05, "%", PCT, "To verify", "Verify HSN classification with a CA", 1),
    ("P7", "GST — ParkinSense wearable, subscription, RUO", 0.18, "%", PCT, "To verify", "Consumer electronics / SaaS rate — verify with a CA", 1),
    ("P8", "Clinic / OT channel margin", 0.15, "%", PCT, "Estimate", "Negotiate in pilots", 1),
    ("P9", "Online marketplace fee (ParkinSense D2C)", 0.10, "%", PCT, "Estimate", "Assumption", 0),
    ("P10", "Institutional procurement discount", 0.10, "%", PCT, "Estimate", "Assumption; 60-day payment terms", 0),
    ("P11", "TremoSense rental fee (incl. 18% GST)", 799, "₹/month", INR, "Option", "Trial / rental via OT clinics — not validated", 0),
    ("P12", "No-cost EMI subvention cost", 0.04, "% of price", PCT, "Estimate", "Lender fee borne by AVERRA — get partner quote", 0),
    # costs
    ("C1", "Warranty reserve (% of ex-GST price)", 0.05, "%", PCT, "Estimate", "Scenario A uses 8% (see Costs sheet)", 0),
    ("C2", "Fulfilment + payment cost per order", 250, "₹", INR, "Estimate", "Courier + gateway", 0),
    ("C3", "ParkinSense small-batch COGS", 3530, "₹", INR, "Estimate", "Costs sheet build-up; needs supplier quotes", 1),
    ("C4", "Subscription cloud + support cost", 40, "₹/month", INR, "Estimate", "Assumption", 0),
    ("C5", "RUO kit onboarding/support", 5000, "₹/kit", INR, "Estimate", "Assumption", 0),
    ("C6", "Injection-mould tooling for Scenario C (one-off)", 700000, "₹", INR, "Estimate", "Needs tooling quote — fixed cost, excluded from unit COGS", 1),
    # unit economics
    ("U1", "ParkinSense subscriber monthly churn", 0.05, "%/month", PCT, "Estimate", "No subscriber data", 1),
    ("U2", "TremoSense repeat purchase at end of life", 0.40, "%", PCT, "Estimate", "Assumption", 0),
    ("U3", "ParkinSense D2C CAC", 1500, "₹", INR, "Estimate", "No paid-acquisition data", 1),
    ("U4", "Subscription attach rate (ParkinSense)", 0.40, "%", PCT, "Estimate", "Share of buyers who subscribe", 1),
    # funding / valuation
    ("F1", "Contingency on costs", 0.10, "%", PCT, "Policy", "", 0),
    ("F2", "Buffer on peak funding gap", 0.20, "%", PCT, "Policy", "Covers ~2–3 months' delay", 1),
    ("F3", "SISFS proof-of-concept grant — APPLIED, NOT SECURED", 2000000, "₹", INR, "Applied", "Startup India Seed Fund Scheme cap ₹20 L, milestone-based (ClearTax)", 1),
    ("F4", "ESOP pool at pre-seed (% of post-money)", 0.05, "%", PCT, "Policy", "Small pool now; top-up at seed round", 1),
    ("F5", "Loaded engineering cost per person-month", 125000, "₹", INR, "Estimate", "Cost-to-duplicate rate (≈₹15 LPA CTC) — assumption", 1),
    ("F6", "USD/INR", 95.71, "₹/$", "0.00", "Sourced", "Traders Union, 12 Oct 2026", 0),
    ("F7", "Target investor dilution — low", 0.15, "%", PCT, "Target", "Founders' goal", 0),
    ("F8", "Target investor dilution — high", 0.20, "%", PCT, "Target", "Founders' goal", 0),
    ("F9", "Grant receipt month (if awarded)", 3, "month #", NUM, "Assumption", "", 0),
    ("F10", "PROPOSED pre-money — working negotiation target", 7500000, "₹", INR, "Target", "Founders' ask; above the cost floor and Berkus cross-check; NOT an independently established valuation", 1),
    ("F11", "Conservative pre-money alternative", 6000000, "₹", INR, "Target", "≈ Berkus-style scorecard result", 0),
    ("F12", "Ambitious pre-money alternative", 10000000, "₹", INR, "Target", "Only if the premium can be substantiated", 0),
    # plan
    ("S1", "Steady-state TremoSense units/month (M15–M18)", 50, "units", NUM, "Plan", "", 1),
]
r = 4
for rid, lab, val, unit, fmt, st, src, key in rows:
    A.cell(row=r, column=1, value=rid).font = BLACK
    A.cell(row=r, column=2, value=lab).font = BOLD if "RECOMMENDED" in lab or "NOT SECURED" in lab else BLACK
    c = put(A, f"C{r}", val, fmt, fill=YEL if key else None)
    A.cell(row=r, column=4, value=unit).font = BLACK
    A.cell(row=r, column=5, value=st).font = BLACK
    A.cell(row=r, column=6, value=src).font = BLACK
    R[rid] = f"Assumptions!$C${r}"; r += 1
A.freeze_panes = "A4"

# ============================================================ TremoSense cost scenarios
T = wb.create_sheet("TremoSense Costs")
T["A1"] = "TremoSense unit cost — three scenarios (₹ per unit)"; T["A1"].font = TITLE
head(T, 3, ["Line", "A · Prototype / very low volume (1–20)", "B · Small batch (100–500)", "C · Scaled, after verified reductions (≥1,000)", "Evidence"], [52, 22, 22, 26, 80])
fx = R["F6"]
lines = [
    ("MCU + IMU (XIAO nRF52840 Sense → bare module in C)", f"=15.9*{fx}", f"=13.9*{fx}", 520, "A/B: Seeed list $15.90 / $13.90 (10+) — DOCUMENTED. C: bare nRF52840 module + LSM6DS3 on custom PCB — ESTIMATE, needs quote"),
    ("Servos ×2 (MG92B → direct-sourced micro servos in C)", 1600, 1400, 500, "A: UK retail £8 each (The Pi Hut) ≈ ₹800 — DOCUMENTED reference; B/C: ESTIMATE, needs supplier quote"),
    ("Power: XL6009 boost converter + 1250 mAh LiPo", 570, 470, 380, "ESTIMATE — replace with receipts / quotes"),
    ("Interconnect: 1500 µF capacitor, wiring, connectors (→ carrier PCB in B → integrated PCBA in C)", 120, 280, 550, "C includes PCB fab + SMT assembly — ESTIMATE, needs quote"),
    ("Enclosure, gimbal & food-safe spoon head", 250, 600, 350, "A: filament only; B: printed + finished; C: moulded part (tooling in Assumptions C6, not in unit cost)"),
    ("Assembly labour", 500, 400, 200, "A: ~2 h; B: ~1.5 h; C: line assembly — ESTIMATE"),
    ("Testing & quality control", 150, 200, 120, "Bench check on tremor simulator + burn-in — ESTIMATE"),
    ("Packaging + manual", 150, 150, 100, "ESTIMATE"),
]
for i, (lab, a, b, cc, ev) in enumerate(lines):
    rr = 4 + i
    T.cell(row=rr, column=1, value=lab).font = BLACK
    for j, v in enumerate((a, b, cc)):
        put(T, f"{L(2+j)}{rr}", v, INR, font=BLACK if isinstance(v, str) else BLUE)
    T.cell(row=rr, column=5, value=ev).font = BLACK
COGS_ROW = 12
T[f"A{COGS_ROW}"] = "Unit COGS"; T[f"A{COGS_ROW}"].font = BOLD
for j in range(3):
    put(T, f"{L(2+j)}{COGS_ROW}", f"=SUM({L(2+j)}4:{L(2+j)}11)", INR, font=BOLD)
T["A13"] = "  of which electronics + PCB (the '₹2,000 target' line)"
for j in range(3):
    put(T, f"{L(2+j)}13", f"=SUM({L(2+j)}4:{L(2+j)}7)", INR, font=BLACK)
T["E13"] = "Today's prototype parts ≈₹4,060 (A, rows 4–8 excl. labour). ₹2,000 is the C electronics TARGET — not today's cost."
T["A14"] = "Prototype parts only (A rows 4–8)"; put(T, "B14", "=SUM(B4:B8)", INR, font=BOLD)
T["A16"] = "Economics: A and B at the ₹9,999 launch price; C at the ₹8,999 plan price from M19"; T["A16"].font = BOLD
T["A17"] = "Retail price incl. GST"
for j, col in enumerate("BCD"):
    put(T, f"{col}17", f"={R['P1']}" if col != "D" else f"={R['P13']}", INR, font=GREEN)
calc = [
    ("Price ex-GST", "={c}17/(1+{P6})"),
    ("Channel margin (clinic / OT)", "={c}18*{P8}"),
    ("Net revenue to AVERRA", "={c}18-{c}19"),
    ("Unit COGS", "={c}12"),
    ("Warranty reserve", "={c}18*IF(\"{c}\"=\"B\",0.08,{C1})"),
    ("Fulfilment", "={C2}"),
    ("Contribution per unit", "={c}20-{c}21-{c}22-{c}23"),
    ("Contribution margin (of net revenue)", "=IF({c}20=0,0,{c}24/{c}20)"),
    ("Break-even units / month vs steady-state fixed costs", "=IF({c}24<=0,\"never\",Forecast!$C$81/{c}24)"),
]
for i, (lab, f) in enumerate(calc):
    rr = 18 + i
    T.cell(row=rr, column=1, value=lab).font = BOLD if "Contribution" in lab or "Break" in lab else BLACK
    for col in "BCD":
        fm = f.format(c=col, P6=R["P6"], P8=R["P8"], C1=R["C1"], C2=R["C2"])
        put(T, f"{col}{rr}", fm, PCT if "margin (" in lab else ('0.0' if "Break" in lab else INR), font=BLACK)
T["A27"] = "Gross margin = (net revenue − COGS) ÷ net revenue"; T["A27"].font = BOLD
for col in "BCD":
    put(T, f"{col}27", f"=IF({col}20=0,0,({col}20-{col}21)/{col}20)", PCT, font=BLACK)
T["E27"] = "Gross margin excludes warranty and fulfilment; contribution margin (row 25) includes them."
T["E22"] = "Scenario A carries an 8% warranty reserve (lower reliability)."
T["E26"] = "Fixed costs = Year-3 average monthly fixed costs (Forecast!C81)."

# ============================================================ Price matrix
PM = wb.create_sheet("Price Matrix")
PM["A1"] = "TremoSense — contribution per unit by price × cost scenario (clinic channel)"; PM["A1"].font = TITLE
head(PM, 3, ["Retail price (incl. GST)", "A · contribution", "A · margin", "B · contribution", "B · margin", "C · contribution", "C · margin", "Verdict"], [24, 16, 12, 16, 12, 16, 12, 60])
prices = [4999, 5999, 6999, 7999, 8999, 9999, 12999]
for i, p in enumerate(prices):
    rr = 4 + i
    put(PM, f"A{rr}", p, INR)
    for j, col in enumerate("BCD"):
        warr = "0.08" if col == "B" else R["C1"]
        net = f"(A{rr}/(1+{R['P6']}))*(1-{R['P8']})"
        contrib = f"={net}-'TremoSense Costs'!{col}12-(A{rr}/(1+{R['P6']}))*{warr}-{R['C2']}"
        put(PM, f"{L(2+2*j)}{rr}", contrib, INR, font=BLACK)
        put(PM, f"{L(3+2*j)}{rr}", f"=IF({net}=0,0,{L(2+2*j)}{rr}/({net}))", PCT, font=BLACK)
    put(PM, f"H{rr}", f'=IF(E{rr}>=0.3,"Viable at small batch",IF(G{rr}>=0.3,"Viable only after verified C cost",IF(G{rr}>0,"Thin even at C","Loss-making")))', font=BLACK)
PM["A12"] = "Recommendation"; PM["A12"].font = BOLD
PM["B12"] = "Launch at ₹9,999 (≥30% margin at B). Do not price below ₹8,999 until Scenario C cost is verified by quotes. Move to ₹6,999 only after that."
PM["A14"] = "Channel options at the launch price (Scenario B cost) — none validated yet"; PM["A14"].font = BOLD
head(PM, 15, ["Channel", "Net revenue / unit", "Contribution / unit", "Margin", "Notes"])
ch = [
    ("Direct online", f"={R['P1']}/(1+{R['P6']})", "No channel margin; pays its own CAC"),
    ("Clinic partnership", f"={R['P1']}/(1+{R['P6']})*(1-{R['P8']})", "15% margin to clinic"),
    ("Occupational-therapy centres", f"={R['P1']}/(1+{R['P6']})*(1-{R['P8']})", "Same terms as clinics"),
    ("Institutional procurement", f"={R['P1']}/(1+{R['P6']})*(1-{R['P10']})", "10% discount, 60-day terms"),
    ("No-cost EMI (direct)", f"={R['P1']}/(1+{R['P6']})-{R['P1']}*{R['P12']}", "Subvention borne by AVERRA"),
]
for i, (n, net, note) in enumerate(ch):
    rr = 16 + i
    PM.cell(row=rr, column=1, value=n).font = BLACK
    put(PM, f"B{rr}", net, INR, font=BLACK)
    put(PM, f"C{rr}", f"=B{rr}-'TremoSense Costs'!C12-{R['P1']}/(1+{R['P6']})*{R['C1']}-{R['C2']}", INR, font=BLACK)
    put(PM, f"D{rr}", f"=IF(B{rr}=0,0,C{rr}/B{rr})", PCT, font=BLACK)
    PM.cell(row=rr, column=5, value=note).font = BLACK
PM["A22"] = "Rental via OT clinic (Scenario B device)"; PM["A22"].font = BOLD
put(PM, "B22", f"={R['P11']}/1.18*(1-{R['P8']})", INR, font=BLACK); PM["E22"] = "Net monthly rental to AVERRA"
PM["A23"] = "Months to recover device cost + two-way fulfilment"
put(PM, "B23", f"=('TremoSense Costs'!C12+2*{R['C2']})/B22", '0.0', font=BLACK); PM["E23"] = "After this, rental is contribution; refurbishment between renters not yet costed"

# ============================================================ Unit economics (both products)
U = wb.create_sheet("Unit Economics")
U["A1"] = "Unit economics — estimates, no customers yet"; U["A1"].font = TITLE
head(U, 3, ["Line", "TremoSense (launch, Scenario B)", "ParkinSense wearable", "ParkinSense subscription (/month)", "ParkinSense RUO kit"], [44, 24, 22, 26, 20])
ue = [
    ("Price incl. GST", f"={R['P1']}", f"={R['P3']}", f"={R['P4']}", f"={R['P5']}"),
    ("Price ex-GST", f"=B4/(1+{R['P6']})", f"=C4/(1+{R['P7']})", f"=D4/(1+{R['P7']})", f"=E4/(1+{R['P7']})"),
    ("Channel / marketplace", f"=B5*{R['P8']}", f"=C5*{R['P9']}", 0, 0),
    ("Net revenue", "=B5-B6", "=C5-C6", "=D5-D6", "=E5-E6"),
    ("COGS / service cost", "='TremoSense Costs'!C12", f"={R['C3']}", f"={R['C4']}", f"=5*{R['C3']}+{R['C5']}"),
    ("Warranty", f"=B5*{R['C1']}", f"=C5*{R['C1']}", 0, 0),
    ("Fulfilment", f"={R['C2']}", f"={R['C2']}", 0, f"={R['C2']}"),
    ("Contribution", "=B7-B8-B9-B10", "=C7-C8-C9-C10", "=D7-D8-D9-D10", "=E7-E8-E9-E10"),
    ("Contribution margin", "=IF(B7=0,0,B11/B7)", "=IF(C7=0,0,C11/C7)", "=IF(D7=0,0,D11/D7)", "=IF(E7=0,0,E11/E7)"),
]
for i, row in enumerate(ue):
    rr = 4 + i
    U.cell(row=rr, column=1, value=row[0]).font = BOLD if "Contribution" in row[0] else BLACK
    for j in range(4):
        v = row[1 + j]; put(U, f"{L(2+j)}{rr}", v, PCT if "margin" in row[0] else INR, font=BLACK if isinstance(v, str) else BLUE)
U["A13"] = "Gross margin (before warranty & fulfilment)"
for c in "BCDE":
    put(U, f"{c}13", f"=IF({c}7=0,0,({c}7-{c}8)/{c}7)", PCT, font=BLACK)
U["A15"] = "CAC / LTV / payback"; U["A15"].font = TITLE
head(U, 16, ["Metric", "TremoSense", "ParkinSense (wearable buyer)", "", "", "Basis"])
cl = [
    ("CAC", "=Forecast!$AX$5/Forecast!$AX$6", f"={R['U3']}", "TremoSense: M12–M36 outreach + sales-lead spend ÷ units sold (plan). ParkinSense: assumption U3"),
    ("Subscriber lifetime (months)", 0, f"=1/{R['U1']}", "1 ÷ churn"),
    ("LTV (contribution, undiscounted)", f"=B11*(1+{R['U2']})", f"=C11+{R['U4']}*D11*C18", "TremoSense: first sale + 40% repurchase. ParkinSense: device + attach × subscription × lifetime"),
    ("LTV : CAC", "=IF(B17=0,0,B19/B17)", "=IF(C17=0,0,C19/C17)", "Target ≥3×"),
    ("Payback (months)", "=IF(B11>=B17,0,99)", f"=IF(C11>=C17,0,(C17-C11)/({R['U4']}*D11))", "Months of contribution to recover CAC"),
]
for i, row in enumerate(cl):
    rr = 17 + i
    U.cell(row=rr, column=1, value=row[0]).font = BLACK
    for j in range(2):
        v = row[1 + j]; put(U, f"{L(2+j)}{rr}", v, X if "LTV :" in row[0] else ('0.0' if "months" in row[0].lower() else INR), font=BLACK if isinstance(v, str) else BLUE)
    U.cell(row=rr, column=6, value=row[3]).font = BLACK

# ============================================================ Market
MK = wb.create_sheet("Market")
MK["A1"] = "Bottom-up TAM / SAM / SOM — India beachhead segments"; MK["A1"].font = TITLE
head(MK, 3, ["Line", "ParkinSense (movement-insight segment)", "TremoSense", "Formula / note"], [56, 24, 20, 82])
mk = [
    ("Implied total population", f"={R['M1']}/{R['M2']}", f"={R['M1']}/{R['M2']}", "60+ count ÷ 60+ share"),
    ("People with PD aged 60+", f"={R['M1']}*{R['M3']}", f"={R['M1']}*{R['M3']}", "GBD-based cross-check ≈5.76 lakh all ages"),
    ("People with essential tremor", 0, f"=B4*{R['M4']}", "TremoSense only"),
    ("TAM customers", "=B5", f"=(C5+C6)*{R['M7']}", "ParkinSense beachhead = PD households seeking movement insights; general wellness market NOT sized (no sourced Indian figure)"),
    ("Annual revenue per customer (ex-GST)", f"='Unit Economics'!C5/{R['M8']}+{R['U4']}*'Unit Economics'!D5*12", f"='Unit Economics'!B5/{R['M8']}", "Device ÷ life (+ attach × 12 months subscription)"),
    ("TAM (₹/year)", "=B7*B8", "=C7*C8", ""),
    ("SAM customers (urban × under follow-up)", f"=B7*{R['M5']}*{R['M6']}", f"=C7*{R['M5']}*{R['M6']}", ""),
    ("SAM (₹/year)", "=B10*B8", "=C10*C8", ""),
    ("SOM: partner clinics (Mumbai + Pune, Year 3)", 30, 30, "Plan"),
    ("SOM: new customers per clinic per month", 2, 4, "Plan"),
    ("SOM: online / OT channel per month", 60, 50, "Plan (ParkinSense online covers the broader wellness audience)"),
    ("SOM customers (Year 3, annual)", "=B12*B13*12+B14*12", "=C12*C13*12+C14*12", "Channel capacity"),
    ("SOM (₹/year)", "=B15*B8", "=C15*C8", ""),
    ("SOM % of SAM", "=IF(B11=0,0,B16/B11)", "=IF(C11=0,0,C16/C11)", ""),
]
for i, row in enumerate(mk):
    rr = 4 + i
    MK.cell(row=rr, column=1, value=row[0]).font = BOLD if "(₹/year)" in row[0] else BLACK
    for j in range(2):
        v = row[1 + j]; put(MK, f"{L(2+j)}{rr}", v, PCT if "%" in row[0] else (INR if "₹" in row[0] else NUM), font=BLACK if isinstance(v, str) else BLUE)
    MK.cell(row=rr, column=4, value=row[3]).font = BLACK
for rr, lab, f in ((19, "Company TAM (₹/year)", "=B9+C9"), (20, "Company SAM (₹/year)", "=B11+C11"), (21, "Company SOM (₹/year)", "=B16+C16")):
    MK[f"A{rr}"] = lab; MK[f"A{rr}"].font = BOLD; put(MK, f"B{rr}", f, INR, font=BOLD)
MK["A22"] = "Revenues add across products; customer counts are never summed (a PD household may buy both)."
# --- ParkinSense as a general wearable: separate upside column, NOT in company totals or the forecast
MK["A24"] = "ParkinSense as a general wearable — inputs (upside view, not in plan totals)"; MK["A24"].font = BOLD
for rr, lab, v, fmt, note in ((25, "India smartwatch buyers per year (IDC, 2024)", 35000000, NUM, "IDC India: 35.0M smartwatches shipped in 2024 (total wearables 119.0M)"),
                              (26, "Advanced / premium smartwatch share (IDC, 2024)", 0.028, PCT, "IDC: advanced smartwatches 2.8% of units; proxy for buyers at ParkinSense's price point"),
                              (27, "SOM share of SAM customers (Year 3)", 0.0025, PCT, "ASSUMPTION: 0.25% of premium buyers via online channel")):
    MK[f"A{rr}"] = lab; put(MK, f"B{rr}", v, fmt, font=BLUE); MK[f"D{rr}"] = note
MK["E3"] = "ParkinSense — general wearable (upside)"; MK["E3"].font = BOLD; MK.column_dimensions["E"].width = 30
for rr, f, fmt in ((7, "=B25", NUM), (8, "=B8", INR), (9, "=E7*E8", INR), (10, "=E7*B26", NUM), (11, "=E10*E8", INR), (15, "=E10*B27", NUM), (16, "=E15*E8", INR), (17, "=IF(E11=0,0,E16/E11)", PCT)):
    put(MK, f"E{rr}", f, fmt, font=BLACK)
MK["E18"] = "Not added to company totals or the forecast"

# ============================================================ Forecast (36 months: prove → launch → scale to profitability)
FC = wb.create_sheet("Forecast")
N = 36
import datetime as _dt
months = [(_dt.date(2027, 7, 1) + _dt.timedelta(days=31 * i)).strftime("%b-%y") for i in range(N)]
FC["A1"] = "Monthly cash plan — Phase 1 PROVE (M1–M6) → Phase 2 LAUNCH (M7–M18) → SCALE (M19–M36). M1 = July 2027"; FC["A1"].font = TITLE
c0 = 4
col = lambda m: L(c0 + m - 1)
TY1, TP1, TP2, TY2, TY3 = (L(c0 + N + k) for k in range(5))
TOTS = ((TY1, 1, 12), (TP1, 1, 6), (TP2, 7, 18), (TY2, 13, 24), (TY3, 25, 36))
head(FC, 3, ["Line (₹)", "Product", "Phase"] + [f"M{i+1}\n{m}" for i, m in enumerate(months)] + ["Year 1", "Phase 1 (M1–6)", "Phase 2 (M7–18)", "Year 2", "Year 3"])
FC.column_dimensions["A"].width = 52; FC.column_dimensions["B"].width = 12; FC.column_dimensions["C"].width = 6
for i in range(N + 5):
    FC.column_dimensions[L(4 + i)].width = 11

def sched(pairs, default=0):
    v = [default] * N
    for (a, b), val in pairs:
        for m in range(a, b + 1):
            v[m - 1] = val
    return v

def totals(rr, bold=False):
    for tc, a, b in TOTS:
        put(FC, f"{tc}{rr}", f"=SUM({col(a)}{rr}:{col(b)}{rr})", NUM, font=BOLD if bold else BLACK)

UNITS, TSNET, REVT, KITS, REVP, PSU, REVPS, SUBS, REVSUB, REV, NET, CUM = 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 45, 46
tsC = "'TremoSense Costs'"
cost_lines = [
    ("Founder stipends (2×₹15k Phase 1 · 2×₹30k M7–24 · 2×₹45k Y3)", "Shared", sched([((1, 6), 30000), ((7, 24), 60000), ((25, 36), 90000)])),
    ("Industrial design contractor", "TremoSense", sched([((1, 2), 45000)])),
    ("Prototyping materials", "Shared", sched([((1, 6), 25000), ((7, 36), 15000)])),
    ("Tools, cloud, software", "Shared", sched([((1, 24), 8000), ((25, 36), 15000)])),
    ("Legal, accounting, admin", "Shared", sched([((1, 1), 25000), ((2, 24), 12000), ((25, 36), 20000)])),
    ("Patent: attorney + filing fees", "Shared", sched([((2, 2), 55000), ((12, 12), 65000), ((30, 30), 40000)])),
    ("TremoSense study units (12 × Scenario A cost)", "TremoSense", [f"=12*{tsC}!B12" if m == 3 else 0 for m in range(1, N + 1)]),
    ("TremoSense ethics approval + user study (n ≥ 10)", "TremoSense", sched([((4, 4), 40000), ((5, 6), 30000)])),
    ("Regulatory: classification opinion + CDSCO filing", "TremoSense", sched([((4, 4), 30000), ((9, 10), 40000)])),
    ("Reference instruments (ECG strap, pulse oximeter, pedometer)", "ParkinSense", sched([((7, 7), 110000)])),
    ("ParkinSense bench accuracy study", "ParkinSense", sched([((8, 10), 25000)])),
    ("ParkinSense RUO kit devices (5 × COGS per kit sold)", "ParkinSense", [f"={col(m)}{KITS}*5*{R['C3']}" for m in range(1, N + 1)]),
    ("Hardware & test engineer", "Shared", sched([((7, 36), 55000)])),
    ("ISO 13485 QMS set-up + surveillance audits", "Shared", sched([((7, 10), 50000), ((22, 22), 40000), ((34, 34), 40000)])),
    ("Electrical safety / EMC pre-compliance", "TremoSense", sched([((9, 10), 175000)])),
    ("TremoSense pilot batch (100 × Scenario B cost)", "TremoSense", [f"=100*{tsC}!C12" if m == 11 else 0 for m in range(1, N + 1)]),
    ("TremoSense restock (units × B cost to M18, × verified C cost from M19)", "TremoSense", [0] * 14 + [f"={col(m)}{UNITS}*{tsC}!{'C' if m <= 18 else 'D'}12" for m in range(15, N + 1)]),
    ("Clinic & OT outreach / marketing (TremoSense)", "TremoSense", sched([((12, 18), 45000), ((19, 24), 75000), ((25, 36), 100000)])),
    ("ParkinSense wellness research pilot (incl. clinical-evaluation support)", "ParkinSense", sched([((11, 36), 30000)])),
    ("Customer support & operations hire", "Shared", sched([((19, 36), 35000)])),
    ("Clinic-network sales lead", "TremoSense", sched([((19, 36), 50000)])),
    ("App & firmware engineer", "ParkinSense", sched([((25, 36), 70000)])),
    ("Injection-mould tooling (Scenario C)", "TremoSense", [f"={R['C6']}" if m == 18 else 0 for m in range(1, N + 1)]),
    ("ParkinSense wellness device inventory (units × COGS)", "ParkinSense", [f"={col(m)}{PSU}*{R['C3']}" for m in range(1, N + 1)]),
    ("ParkinSense D2C acquisition (units × CAC)", "ParkinSense", [f"={col(m)}{PSU}*{R['U3']}" for m in range(1, N + 1)]),
    ("ParkinSense subscription cloud cost (subscribers × cost)", "ParkinSense", [f"={col(m)}{SUBS}*{R['C4']}" for m in range(1, N + 1)]),
]
r = 4; cs = r
for lab, prod, vals in cost_lines:
    FC.cell(row=r, column=1, value=lab).font = BLACK
    FC.cell(row=r, column=2, value=prod).font = BLACK
    for m, v in enumerate(vals, 1):
        put(FC, f"{col(m)}{r}", v, NUM, font=BLACK if isinstance(v, str) else BLUE)
    totals(r); r += 1
ce = r - 1
assert ce == 29, ce
SUB, CONT, TOT = 30, 31, 32
MKT_ROW, RESTOCK_ROW, TOOL_ROW, PSINV_ROW, PSCAC_ROW = 21, 20, 26, 27, 28
for rr, lab, f in ((SUB, "Subtotal", lambda c: f"=SUM({c}{cs}:{c}{ce})"), (CONT, "Contingency", lambda c: f"={c}{SUB}*{R['F1']}"), (TOT, "TOTAL CASH COSTS", lambda c: f"={c}{SUB}+{c}{CONT}")):
    FC.cell(row=rr, column=1, value=lab).font = BOLD
    for m in range(1, N + 1):
        put(FC, f"{col(m)}{rr}", f(col(m)), NUM, font=BOLD if rr != CONT else BLACK)
    totals(rr, True)
# --- volumes & cash in
ts_units = [0] * 11 + [15, 25, 35, 50, 50, 50, 50] + [60 + 5 * i for i in range(6)] + [130 + 5 * i for i in range(12)]
kits = [0] * 9 + [1 if m % 2 == 0 else 0 for m in range(10, 19)] + [1] * 18
ps_units = [0] * 24 + [60 + 10 * i for i in range(12)]
rows_in = [
    (UNITS, "TremoSense units sold", "TremoSense", ts_units, NUM),
    (TSNET, "TremoSense cash per unit (launch price to M18, post-cost price from M19)", "TremoSense",
     [f"=(IF({m}<=18,{R['P1']},{R['P13']})/(1+{R['P6']}))*(1-{R['P8']}-{R['C1']})-{R['C2']}" for m in range(1, N + 1)], NUM),
    (REVT, "Cash in — TremoSense", "TremoSense", [f"={col(m)}{UNITS}*{col(m)}{TSNET}" for m in range(1, N + 1)], NUM),
    (KITS, "ParkinSense RUO kits sold", "ParkinSense", kits, NUM),
    (REVP, "Cash in — ParkinSense RUO kits", "ParkinSense", [f"={col(m)}{KITS}*('Unit Economics'!$E$7-'Unit Economics'!$E$10-{R['C5']})" for m in range(1, N + 1)], NUM),
    (PSU, "ParkinSense wellness units sold (launch M25, after wellness beta)", "ParkinSense", ps_units, NUM),
    (REVPS, "Cash in — ParkinSense devices", "ParkinSense", [f"={col(m)}{PSU}*('Unit Economics'!$C$7-'Unit Economics'!$C$9-'Unit Economics'!$C$10)" for m in range(1, N + 1)], NUM),
    (SUBS, "ParkinSense active subscribers", "ParkinSense", [f"=" + (f"{col(m-1)}{SUBS}*(1-{R['U1']})+" if m > 1 else "") + f"{col(m)}{PSU}*{R['U4']}" for m in range(1, N + 1)], NUM),
    (REVSUB, "Cash in — ParkinSense subscriptions", "ParkinSense", [f"={col(m)}{SUBS}*'Unit Economics'!$D$7" for m in range(1, N + 1)], NUM),
    (REV, "TOTAL CASH IN", "", [f"={col(m)}{REVT}+{col(m)}{REVP}+{col(m)}{REVPS}+{col(m)}{REVSUB}" for m in range(1, N + 1)], NUM),
    (NET, "NET OPERATING CASH FLOW (operating profit, cash basis)", "", [f"={col(m)}{REV}-{col(m)}{TOT}" for m in range(1, N + 1)], NUM),
    (CUM, "Cumulative operating cash flow", "", [f"={col(m)}{NET}" + (f"+{col(m-1)}{CUM}" if m > 1 else "") for m in range(1, N + 1)], NUM),
]
for rr, lab, prod, vals, fmt in rows_in:
    FC.cell(row=rr, column=1, value=lab).font = BOLD if lab.isupper() or lab.startswith("TOTAL") or lab.startswith("NET") else BLACK
    FC.cell(row=rr, column=2, value=prod).font = BLACK
    for m, v in enumerate(vals, 1):
        put(FC, f"{col(m)}{rr}", v, fmt, font=BLACK if isinstance(v, str) else BLUE)
    if rr not in (TSNET, SUBS, CUM):
        totals(rr, rr in (REV, NET))
# break-even flag: from this month on, every month is cash-positive
BE = 47
FC.cell(row=BE, column=1, value="Sustained break-even flag (all later months ≥ 0)").font = BLACK
for m in range(1, N + 1):
    put(FC, f"{col(m)}{BE}", f"=IF(AND({m}>=13,MIN({col(m)}{NET}:{col(N)}{NET})>=0),1,0)", NUM, font=BLACK)
# scenario closing cash 48–51, flags 52–55
for k, (lab, eq, grant) in enumerate((("A", "C", True), ("B", "D", False), ("C", "E", False), ("D", "F", False))):
    rr = 48 + k
    FC.cell(row=rr, column=1, value=f"Closing cash — Scenario {lab}").font = BLACK
    FC.cell(row=52 + k, column=1, value=f"Cash-negative flag — Scenario {lab}").font = BLACK
    for m in range(1, N + 1):
        g = f"+IF({m}>={R['F9']},'Funding Scenarios'!${eq}$6,0)" if grant else ""
        put(FC, f"{col(m)}{rr}", f"={col(m)}{CUM}+'Funding Scenarios'!${eq}$7{g}", NUM, font=BLACK)
        put(FC, f"{col(m)}{52+k}", f"=IF({col(m)}{rr}<0,1,0)", NUM, font=BLACK)
# CAC helper (TremoSense outreach + sales lead ÷ units, M12–M36)
FC["AW5"] = "TS acquisition spend M12–M36"; put(FC, "AX5", f"=SUM({col(12)}{MKT_ROW}:{col(N)}{MKT_ROW})+SUM({col(12)}25:{col(N)}25)", NUM, font=BLACK)
FC["AW6"] = "TS units M12–M36"; put(FC, "AX6", f"=SUM({col(12)}{UNITS}:{col(N)}{UNITS})", NUM, font=BLACK)
# --- headline metrics (rows 60+)
FC["A59"] = "Headline metrics"; FC["A59"].font = TITLE
rng = lambda a, b, rr: f"{col(a)}{rr}:{col(b)}{rr}"
met = [
    (60, "Year-1 total cash costs", f"={TY1}{TOT}", INR),
    (61, "Year-1 cash in", f"={TY1}{REV}", INR),
    (62, "Average monthly gross burn (Year 1)", f"={TY1}{TOT}/12", INR),
    (63, "Average monthly net burn (Year 1)", f"=-{TY1}{NET}/12", INR),
    (64, "Phase 1 (M1–M6) cash costs", f"={TP1}{TOT}", INR),
    (65, "Peak cumulative gap, Phase 1 (M1–M6)", f"=-MIN({rng(1, 6, CUM)})", INR),
    (66, "Peak cumulative gap to profitability (M1–M36)", f"=-MIN({rng(1, N, CUM)})", INR),
    (67, "Month of peak gap", f"=INDEX($D$3:${col(N)}$3,MATCH(-D66,{rng(1, N, CUM)},0))", None),
    (68, "Funding requirement to profitability (gap × (1 + buffer))", f"=D66*(1+{R['F2']})", INR),
    (69, "Phase-1 funding requirement (gap × (1 + buffer))", f"=D65*(1+{R['F2']})", INR),
    (70, "Additional requirement after Milestone 1", "=D68-D69", INR),
    (71, "Sustained operating break-even month", f'=IFERROR(INDEX($D$3:${col(N)}$3,MATCH(1,{rng(1, N, BE)},0)),"Not within 36 months")', None),
    (72, "Year-2 cash in", f"={TY2}{REV}", INR),
    (73, "Year-2 operating cash flow", f"={TY2}{NET}", INR),
    (74, "Year-3 cash in", f"={TY3}{REV}", INR),
    (75, "Year-3 operating profit (cash basis)", f"={TY3}{NET}", INR),
    (76, "Year-3 operating margin", "=IF(D74=0,0,D75/D74)", PCT),
    (77, "Exit run-rate: M36 operating profit", f"={col(N)}{NET}", INR),
    (78, "M1–M12 costs before contingency — Shared", f'=SUMIF($B${cs}:$B${ce},"Shared",${TY1}${cs}:${TY1}${ce})', INR),
    (79, "M1–M12 costs before contingency — TremoSense", f'=SUMIF($B${cs}:$B${ce},"TremoSense",${TY1}${cs}:${TY1}${ce})', INR),
    (80, "M1–M12 costs before contingency — ParkinSense", f'=SUMIF($B${cs}:$B${ce},"ParkinSense",${TY1}${cs}:${TY1}${ce})', INR),
    (81, "Year-3 monthly fixed costs (avg, excl. inventory & PS acquisition)", f"=({TY3}{TOT}-({TY3}{RESTOCK_ROW}+{TY3}{PSINV_ROW}+{TY3}{PSCAC_ROW}+{TY3}{TOOL_ROW})*(1+{R['F1']}))/12", INR),
    (82, "Year-1 average monthly fixed costs (M7–M12, excl. inventory)", f"=(SUM({rng(7, 12, TOT)})-SUM({rng(7, 12, 19)})*(1+{R['F1']}))/6", INR),
]
for rr, lab, f, fmt in met:
    FC[f"A{rr}"] = lab; FC[f"A{rr}"].font = BOLD
    put(FC, f"D{rr}", f, fmt, font=BOLD)
put(FC, "C81", "=D81", INR, font=BLACK)
FC.freeze_panes = "D4"

# ============================================================ Valuation (cost-to-duplicate) + sensitivity
V = wb.create_sheet("Valuation")
V["A1"] = "Pre-money valuation — cost-to-duplicate (a floor, not a market price)"; V["A1"].font = TITLE
head(V, 3, ["Workstream", "Person-months", "Evidence"], [70, 16, 90])
ctd = [("ParkinSense: firmware v1–v4, BLE protocol, enclosure, power profiling", 4.0, "firmware/ (6 sketches), PPK II measurement, 3D-printed housing"),
       ("ParkinSense: motion / PPG / step pipelines, runtime, dashboards, app work, bench tests, paper", 14.5, "dashboard/python (~60 modules), reference recordings, paper"),
       ("TremoSense: EKF/LQR modelling, Simulink sweeps, Zephyr firmware, gimbal & power hardware, bench tests, paper", 15.5, "MATLAB_Simulink/, tremosense-app/, paper Table IV")]
for i, (w, pm, ev) in enumerate(ctd):
    V.cell(row=4 + i, column=1, value=w).font = BLACK
    put(V, f"B{4+i}", pm, '0.0', fill=YEL)
    V.cell(row=4 + i, column=3, value=ev).font = BLACK
V["A7"] = "Total person-months"; put(V, "B7", "=SUM(B4:B6)", '0.0', font=BOLD)
V["A8"] = "Loaded rate"; put(V, "B8", f"={R['F5']}", INR)
V["A9"] = "Prototype materials, rigs, instruments already spent (estimate)"; put(V, "B9", 225000, INR, fill=YEL)
V["A10"] = "PRE-MONEY P0 = person-months × rate + materials"; V["A10"].font = BOLD
put(V, "B10", "=B7*B8+B9", INR, font=BOLD)
V["C10"] = "Excludes unfiled IP, brand, market. Replace person-months with logged hours."
# Berkus-style scorecard (cross-check), max ₹20 L per factor (₹1 Cr cap)
V["E3"] = "Berkus-style scorecard (cross-check)"; V["E3"].font = BOLD
bk = [("Sound idea (product risk)", 1500000, "Sourced need; two products; no interviews yet"),
      ("Prototype (technology risk)", 2000000, "Two working prototypes with measured bench results"),
      ("Quality team (execution risk)", 1250000, "Strong technical record and papers; no commercial track record"),
      ("Strategic relationships (market risk)", 1000000, "ICMR evaluation in progress (founder-reported); no clinic partners yet"),
      ("Product rollout / sales (production risk)", 250000, "Costed BOM and pricing; no sales")]
for i, (k, v, ev) in enumerate(bk):
    V.cell(row=4 + i, column=5, value=k).font = BLACK
    put(V, f"F{4+i}", v, INR, fill=YEL)
    V.cell(row=4 + i, column=7, value=ev).font = BLACK
V["E9"] = "Berkus-style total (max ₹20 L per factor)"; V["E9"].font = BOLD
put(V, "F9", "=SUM(F4:F8)", INR, font=BOLD)
V["E10"] = "PROPOSED pre-money (negotiation target)"; V["E10"].font = BOLD
put(V, "F10", f"={R['F10']}", INR, font=BOLD)
V["G10"] = "Premium over Berkus cross-check:"; put(V, "H10", "=F10/F9-1", PCT, font=BLACK)
V.column_dimensions["E"].width = 44; V.column_dimensions["F"].width = 16; V.column_dimensions["G"].width = 60
V["A12"] = "Valuation required to hit a dilution target (no ESOP): P = I × (1 − d) ÷ d"; V["A12"].font = BOLD
head(V, 13, ["Equity raised I", "P needed for 15%", "P needed for 20%", "Dilution at proposed P", "Assessment"])
for i, ref in enumerate(["'Funding Scenarios'!C7", "'Funding Scenarios'!D7", "'Funding Scenarios'!E7", "'Funding Scenarios'!F7"]):
    rr = 14 + i
    put(V, f"A{rr}", f"={ref}", INR, font=GREEN)
    put(V, f"B{rr}", f"=A{rr}*(1-{R['F7']})/{R['F7']}", INR, font=BLACK)
    put(V, f"C{rr}", f"=A{rr}*(1-{R['F8']})/{R['F8']}", INR, font=BLACK)
    put(V, f"D{rr}", f"=IF(A{rr}=0,0,A{rr}/($F$10+A{rr}))", PCT, font=BLACK)
    put(V, f"E{rr}", f'=IF(D{rr}<={R["F7"]},"Within 15% at proposed P",IF(D{rr}<={R["F8"]},"Within 15–20% at proposed P","Above 20% at proposed P"))', font=BLACK)
V["A18"] = "Rows: Scenario A, B, C (tranche 1), D (tranche 1)."
V["A20"] = "Milestone-1 round at each pre-money option (equity = Scenario C)"; V["A20"].font = BOLD
head(V, 21, ["Pre-money", "Investor %", "Founders % (after ESOP)", "Basis"])
for i, (ref, lab) in enumerate([("$B$10", "Floor: cost-to-duplicate"), (f"{R['F11']}", "Conservative ≈ Berkus cross-check"), (f"{R['F10']}", "PROPOSED working target"), (f"{R['F12']}", "Ambitious — only if substantiated")]):
    rr = 22 + i
    V.cell(row=rr, column=4, value=lab).font = BOLD if "PROPOSED" in lab else BLACK
    put(V, f"A{rr}", f"={ref}", INR, font=BLACK)
    put(V, f"B{rr}", f"='Funding Scenarios'!$E$7/(A{rr}+'Funding Scenarios'!$E$7)", PCT, font=BLACK)
    put(V, f"C{rr}", f"=1-B{rr}-{R['F4']}", PCT, font=BLACK)

# ============================================================ Funding scenarios
FS = wb.create_sheet("Funding Scenarios")
FS["A1"] = "Funding scenarios — grant kept separate from equity; grant is APPLIED, NOT SECURED"; FS["A1"].font = TITLE
head(FS, 3, ["Line", "", "A · Grant secured, full plan", "B · Grant refused, full plan", "C · Smaller round to Milestone 1", "D · Staged: tranche 1 now, tranche 2 at milestone"], [44, 4, 26, 26, 26, 30])
fs = [
    (4, "Capital requirement covered by this round", "=Forecast!$D$68", "=Forecast!$D$68", "=Forecast!$D$69", "=Forecast!$D$69", INR),
    (5, "Grant status", "Awarded (assumed in this scenario only)", "Refused", "Not assumed", "Applied; counted only if awarded", None),
    (6, "Grant counted", f"={R['F3']}", 0, 0, 0, INR),
    (7, "Equity required now (I)", "=C4-C6", "=D4-D6", "=E4-E6", "=F4-F6", INR),
    (8, "Pre-money (proposed working target; floor in Valuation!B10)", "=Valuation!$F$10", "=Valuation!$F$10", "=Valuation!$F$10", "=Valuation!$F$10", INR),
    (9, "Post-money = P + I", "=C8+C7", "=D8+D7", "=E8+E7", "=F8+F7", INR),
    (10, "Investor ownership = I ÷ post-money", "=C7/C9", "=D7/D9", "=E7/E9", "=F7/F9", PCT),
    (11, "ESOP pool", f"={R['F4']}", f"={R['F4']}", f"={R['F4']}", f"={R['F4']}", PCT),
    (12, "Founders combined = 100% − investor − ESOP", "=1-C10-C11", "=1-D10-D11", "=1-E10-E11", "=1-F10-F11", PCT),
    (13, "Runway funded", "To operating break-even + buffer", "To operating break-even + buffer", "M1–M6 + buffer (Milestone 1)", "M1–M6 now; rest to break-even from tranche 2 / grant", None),
    (14, "Milestones reached with this money", "User study, QMS, EMC, CDSCO filing, TremoSense sales from M12, scale to break-even, ParkinSense wellness launch M25", "Same as A", "TremoSense design freeze + user study result (kill/continue), provisional patent, CDSCO classification opinion", "Tranche 1 = C; tranche 2 = rest of A", None),
    (15, "Main risk / trade-off", "Grant may not arrive or may arrive late", "Highest dilution at a cost-floor price", "Must raise again in ~6 months", "Two raises; tranche 2 terms depend on results", None),
]
for rr, lab, a, b, c, d, fmt in fs:
    FS.cell(row=rr, column=1, value=lab).font = BOLD if rr in (7, 10, 12) else BLACK
    for colx, v in zip("CDEF", (a, b, c, d)):
        put(FS, f"{colx}{rr}", v, fmt, font=BLACK if not isinstance(v, (int, float)) else BLUE)
        FS[f"{colx}{rr}"].alignment = Alignment(wrap_text=True, vertical="top")
FS["A16"] = "Zero-cash month (no further funding)"; FS["A16"].font = BOLD
for k, eq in enumerate("CDEF"):
    rr = 48 + k
    put(FS, f"{eq}16", f'=IFERROR(INDEX(Forecast!$D$3:$AM$3,MATCH(1,Forecast!$D${52+k}:$AM${52+k},0)),"Never — reaches break-even "&Forecast!$D$71)', font=BLACK)
FS["A17"] = "Scenario D — tranche 2 (illustrative, priced at a cost-based floor)"; FS["A17"].font = BOLD
rows_d = [
    (18, "Tranche-2 need (to operating break-even)", "=Forecast!$D$70", INR),
    (19, "Less grant if awarded (shown: not awarded)", 0, INR),
    (20, "Tranche-2 equity", "=F18-F19", INR),
    (21, "Tranche-2 pre-money floor = tranche-1 post-money + Phase-1 spend (cost basis of work done)", "=F9+Forecast!$D$64", INR),
    (22, "Tranche-2 investor ownership", "=F20/(F21+F20)", PCT),
    (23, "Founders after both tranches (before any ESOP top-up)", "=F12*(1-F22)", PCT),
    (24, "Investor total after both tranches", "=1-F23-F11*(1-F22)", PCT),
]
for rr, lab, f, fmt in rows_d:
    FS.cell(row=rr, column=1, value=lab).font = BLACK
    put(FS, f"F{rr}", f, fmt, font=BLACK if isinstance(f, str) else BLUE)
FS["A26"] = "Recommendation"; FS["A26"].font = BOLD
FS["C26"] = ("Raise Scenario C now (Milestone 1 only) at the proposed ₹75 L pre-money (a negotiation target; floor ₹44.75 L cost-to-duplicate, Berkus cross-check ≈₹60 L). "
             "The rest of the path to operating break-even is raised only after the user study passes, priced on evidence. A grant, if awarded, reduces that later raise.")
FS["C26"].alignment = Alignment(wrap_text=True)

# ============================================================ Use of funds
UF = wb.create_sheet("Use of Funds")
UF["A1"] = "Use of funds by category and phase (before contingency)"; UF["A1"].font = TITLE
head(UF, 3, ["Category", "Phase 1 (M1–M6)", "Phase 2 (M7–M18)", "Lines included"], [34, 18, 18, 90])
cats = [("Team", [4, 5, 16, 23, 24, 25], "stipends, design contractor, engineers, support, sales lead"),
        ("Validation (both products)", [10, 11, 13, 14, 22], "TremoSense study units & user study, PS instruments, accuracy study, wellness pilot / clinical-evaluation support"),
        ("Regulatory & quality", [12, 17, 18], "classification, CDSCO filing, QMS, EMC"),
        ("Inventory & tooling", [15, 19, 20, 26, 27], "RUO devices, pilot batch, restock, tooling, PS devices"),
        ("Prototyping, tools, IP", [6, 7, 9], "materials, tools, patent"),
        ("Go-to-market & admin", [21, 8, 28, 29], "outreach, legal/accounting, PS acquisition, cloud")]
for i, (n, rows_, note) in enumerate(cats):
    rr = 4 + i
    UF.cell(row=rr, column=1, value=n).font = BLACK
    rws = rows_
    put(UF, f"B{rr}", "=" + "+".join(f"Forecast!{TP1}{x}" for x in rws), INR, font=GREEN)
    put(UF, f"C{rr}", "=" + "+".join(f"Forecast!{TP2}{x}" for x in rws), INR, font=GREEN)
    UF.cell(row=rr, column=4, value=note).font = BLACK
UF["A10"] = "Contingency"; put(UF, "B10", f"=Forecast!{TP1}{CONT}", INR, font=GREEN); put(UF, "C10", f"=Forecast!{TP2}{CONT}", INR, font=GREEN)
UF["A11"] = "Total cash costs"; UF["A11"].font = BOLD
put(UF, "B11", "=SUM(B4:B10)", INR, font=BOLD); put(UF, "C11", "=SUM(C4:C10)", INR, font=BOLD)
UF["A12"] = "Check vs Forecast (must be 0)"; put(UF, "B12", f"=B11-Forecast!{TP1}{TOT}", INR, font=BLACK); put(UF, "C12", f"=C11-Forecast!{TP2}{TOT}", INR, font=BLACK)

# ============================================================ Competitors (benchmarks only — NOT revenue assumptions)
CP = wb.create_sheet("Competitors")
CP["A1"] = "Competitor price benchmarks — checked 12 Oct 2026. Benchmarks only; they do not drive AVERRA revenue."; CP["A1"].font = TITLE
head(CP, 3, ["Product", "Segment", "Listed price", "Currency", "₹ equivalent", "Recurring cost", "What it does", "Source", "Checked"], [26, 18, 14, 10, 14, 26, 60, 70, 12])
comp = [
    ("WHOOP One (WHOOP 5.0)", "Wellness wearable", 17990, "INR", "Membership is the price: ₹17,990 / 12 months (MRP ₹21,990)", "Screenless strap; recovery, sleep, strain, steps, VO2 max; 14+ day battery", "https://www.whoop.in/pages/whoop-devices"),
    ("WHOOP Peak", "Wellness wearable", 23990, "INR", "₹23,990 / 12 months (MRP ₹28,990)", "Adds healthspan, health monitor alerts, real-time stress", "https://www.whoop.in/pages/whoop-devices"),
    ("Amazfit Bip 6", "Fitness smartwatch", 8999, "INR", "None listed", "AMOLED, GPS, heart rate, sleep; accelerometer + gyroscope; up to 14 days", "https://www.91mobiles.com/amazfit-bip-6-smart-watch-price-in-india"),
    ("Fitbit Charge 6", "Fitness band", 12999, "INR", "Optional premium subscription (not priced here)", "Heart rate, SpO2, sleep, GPS; ~7 days (₹13,999 on Amazon)", "https://www.smartprix.com/fitness_bands/fitbit-charge-6-fitness-band-ppd10ccze2vi"),
    ("GyroGlove", "Hand stabiliser (one hand)", 5899, "USD", "Or $246/month × 24", "Gyroscopic wrist stabiliser for the whole hand; 4 h continuous use; no clinical study cited on listing", "https://techguide.parkinsons.org.uk/catalogue/gyro-glove"),
    ("Liftware (stabilising handle)", "Active stabilising utensil", 195, "USD", "Attachments extra", "Sensor + motor cancellation at the utensil; maker cites a study with 70% less shaking. Price is a DATED Nov 2015 figure", "https://www.michaeljfox.org/news/stabilizing-spoon-announces-price-reduction-and-match-program-holidays"),
    ("Weighted soup spoon (225 g)", "Passive adaptive utensil", 55.98, "USD", "None", "Added mass damps tremor; no electronics. US retail; Indian prices not verified", "https://wellbefore.com/products/weighted-soup-spoon"),
]
for i, (n, seg, p, cur, rec, what, src) in enumerate(comp):
    rr = 4 + i
    CP.cell(row=rr, column=1, value=n).font = BLACK; CP.cell(row=rr, column=2, value=seg).font = BLACK
    put(CP, f"C{rr}", p, '#,##0.00' if cur == "USD" else INR)
    CP.cell(row=rr, column=4, value=cur).font = BLACK
    put(CP, f"E{rr}", f"=C{rr}*{R['F6']}" if cur == "USD" else f"=C{rr}", INR, font=BLACK)
    for j, v in enumerate((rec, what, src, "12 Oct 2026")):
        CP.cell(row=rr, column=6 + j, value=v).font = BLACK
CP["A12"] = "AVERRA price hypotheses (to be tested with customers)"; CP["A12"].font = BOLD
CP["A13"] = "TremoSense launch"; put(CP, "E13", f"={R['P1']}", INR, font=GREEN)
CP["A14"] = "ParkinSense wearable"; put(CP, "E14", f"={R['P3']}", INR, font=GREEN)
CP["A15"] = "TremoSense vs GyroGlove (one glove)"; put(CP, "E15", "=E13/E8", PCT, font=BLACK); CP["F15"] = "Different products: spoon stabiliser vs whole-hand glove — price context only"

# ============================================================ Sources
S = wb.create_sheet("Sources")
S["A1"] = "Sources"; S["A1"].font = TITLE
src = [
    ("UNFPA India Ageing Report 2023 (149M aged 60+, 10.5%; 347M by 2050)", "https://www.thenationalnews.com/world/asia/2023/09/28/india-un-elderly-population/"),
    ("Khurana & Gourie-Devi, Cureus 2025;17(3):e80248 — Indian PD community studies", "https://pmc.ncbi.nlm.nih.gov/articles/PMC11890171"),
    ("Chin et al., Mov Disord 2021 — ET in rural Gujarat", "https://www.mdsabstracts.org/abstract/prevalence-of-essential-tremors-in-rural-gujarat-india/"),
    ("BMJ 2025 — PD prevalence 25.2M by 2050", "https://bmjgroup.com/cases-of-parkinsons-disease-set-to-reach-25-million-worldwide-by-2050"),
    ("Michael J. Fox Foundation — Liftware $195 (Nov 2015)", "https://www.michaeljfox.org/news/stabilizing-spoon-announces-price-reduction-and-match-program-holidays"),
    ("Seeed Studio — XIAO nRF52840 Sense $15.90 / $13.90 (10+)", "https://www.seeedstudio.com/Seeed-XIAO-BLE-Sense-nRF52840-p-5253.html"),
    ("The Pi Hut — TowerPro MG92B £8", "https://thepihut.com/products/towerpro-servo-motor-mg92b-metal-gear"),
    ("Startup India Seed Fund Scheme — ₹20 L PoC grant (ClearTax)", "https://cleartax.in/s/startup-india-seed-fund-scheme"),
    ("BIRAC Biotechnology Ignition Grant — up to ₹50 L", "https://www.indiascienceandtechnology.gov.in/funding-opportunities/startups/biotechnology-ignition-grant-scheme-big"),
    ("CDSCO Class A notification (20 Sep 2022)", "https://operonstrategist.com/cdsco-notification-for-class-a-medical-devices/"),
    ("Medical-device licensing mandatory from 1 Oct 2023", "https://www.digitalhealthnews.com/cdsco-extends-deadline-for-class-c-d-medical-devices-cos-by-3-months"),
    ("Apple ResearchKit Movement Disorder API (6 Jun 2018)", "https://www.engadget.com/2018-06-06-apple-watch-monitor-parkinsons-symptoms.html"),
    ("Rune Labs FDA clearance (Jun 2022)", "https://9to5mac.com/2022/06/13/apple-watch-parkinsons/"),
    ("USD/INR 95.71 (12 Oct 2026)", "https://tradersunion.com/currencies/price/usd-inr/"),
    ("WHOOP India memberships (checked 12 Oct 2026)", "https://www.whoop.in/pages/whoop-devices"),
    ("Amazfit Bip 6 India price (checked 12 Oct 2026)", "https://www.91mobiles.com/amazfit-bip-6-smart-watch-price-in-india"),
    ("Fitbit Charge 6 India price (checked 12 Oct 2026)", "https://www.smartprix.com/fitness_bands/fitbit-charge-6-fitness-band-ppd10ccze2vi"),
    ("GyroGlove listing, Parkinson's UK tech guide (16 Jun 2026)", "https://techguide.parkinsons.org.uk/catalogue/gyro-glove"),
    ("Liftware product range and cited study", "https://www.liftware.com/"),
    ("Weighted soup spoon (WellBefore)", "https://wellbefore.com/products/weighted-soup-spoon"),
    ("TremoSense repository", "https://github.com/rkt-1597/TremoSense-Project"),
    ("ParkinSense repository (develop)", "https://github.com/sudo-pranshu/ParkinSense"),
]
S.column_dimensions["A"].width = 80; S.column_dimensions["B"].width = 100
for i, (a, b) in enumerate(src):
    S.cell(row=3 + i, column=1, value=a).font = BLACK; S.cell(row=3 + i, column=2, value=b).font = BLACK

wb.save("AVERRA_Financial_Model.xlsx")
print("saved")
