# AVERRA — pitch platform

*Engineering better movement intelligence.*

AVERRA is a biomedical technology venture by Pranshu Kumar and Pawan Shinde, with two products:

- **ParkinSense** — a fitness and wellness wearable with movement intelligence (tremor burden, motion context, activity and vitals). A clinical evaluation with ICMR is in progress (founder-reported; results pending). Early identification of Parkinson's-related movement change is a long-term research path, **not** a diagnostic claim.
- **TremoSense** — an assistive, actively stabilised spoon for people with tremor. Bench-tested on a motorised simulator; not yet tested with users.

This repository holds everything for the capstone pitch: a full-screen presentation website (deployable to Vercel), the PowerPoint deck, the financial model and the companion guide. All of them read from one set of numbers.

## What's here

| Path | What it is |
|---|---|
| `app/`, `components/`, `lib/` | Next.js 15 presentation website (TypeScript, Tailwind CSS 4, Framer Motion) |
| `data/averra-data.json` | **Every number** — exported from the financial model |
| `data/content.json` | Claims, feature status, ICMR status, risks, milestones and the speaking script |
| `model/AVERRA_Financial_Model.xlsx` | Financial model with live formulas (assumptions, costs, pricing, market, 36-month forecast, valuation, funding scenarios, competitors, sources) |
| `model/build_model.py` | Generates the workbook |
| `deck/AVERRA_Pitch.pptx` | 14-slide pitch deck with click animations, Morph transitions and speaker notes |
| `deck/build_deck.js`, `deck/add_motion.py` | Deck generator and animation/Morph post-processor |
| `docs/COMPANION_GUIDE.md` | Companion guide: changes, evidence matrix, repository audit, script and timings, financial workings, pricing, funding and valuation, competitors, caveats, viva Q&A, missing-evidence checklist, sources |
| `brand/` | Logo mark, wordmark and lockups (SVG + PNG) and their generator |
| `public/` | Images and brand files served by the website |
| `scripts/` | `export_data.py` (xlsx → JSON), `build_content.py` (claims + script), `build_guide.py` (guide) |

## Run the website locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
```

**Controls:** → / Space / Page Down next · ← / Page Up back · Home / End first / last · N presenter notes · F full screen · R restart · ? help. Swipe on touch screens. Click the waveform at the bottom to jump to any section. Each section has its own URL hash (e.g. `/#funding`). Reduced-motion settings are respected.

## Deploy to Vercel

1. Push this repository to GitHub (done for `sudo-pranshu/AVERRA`).
2. In Vercel, choose **Add New → Project** and import `sudo-pranshu/AVERRA`.
3. Keep the defaults: framework **Next.js**, root directory **`./`** (repository root), build command `npm run build`, output handled by Next.js. Node 20+.
4. No environment variables are needed. Click **Deploy**.

Every push to `main` then redeploys automatically.

## Regenerate everything after changing a number

Numbers flow one way: **workbook → JSON → deck, website and guide.** Change an input in `model/build_model.py` (or the Assumptions sheet), then run:

```bash
python model/build_model.py                                # writes model/AVERRA_Financial_Model.xlsx
python /path/to/recalc.py model/AVERRA_Financial_Model.xlsx # recalculate formulas (LibreOffice headless)
python scripts/export_data.py                              # → data/averra-data.json
python scripts/build_content.py                            # → data/content.json (script uses live numbers)
python scripts/build_guide.py                              # → docs/COMPANION_GUIDE.md
cd deck && node build_deck.js && python add_motion.py AVERRA_Pitch_raw.pptx AVERRA_Pitch.pptx && cd ..
npm run build
```

Python needs `openpyxl`; the deck needs `pptxgenjs` (`npm i -g pptxgenjs`) and `lxml`. Recalculation needs LibreOffice; any recalc that opens and saves the workbook in LibreOffice or Excel works.

## Updating the ICMR results

The ICMR evaluation lives in **one field**: `clinicalEvaluation` in `scripts/build_content.py` (written to `data/content.json`). When results return, update its `status`, `label` and `detail` there, then rerun `build_content.py`, `build_guide.py`, the deck build and `npm run build`. The website, deck, speaker notes and guide all pick it up. Until results are published, no deliverable makes a clinical claim.

## Summary of changes (Kampa Labs → AVERRA)

- New name, tagline, navy/blue/cyan palette and a minimalist mark: a tremor waveform that damps to a steady line.
- ParkinSense repositioned as a wellness wearable with movement intelligence; ICMR evaluation shown as founder-reported and in progress.
- TremoSense cost scenarios A/B/C, a price matrix, channels and rental. Launch at ₹9,999; ₹8,999 from M19 after verified cost reduction. ₹4,062 prototype parts vs a ₹2,000 volume target for the electronics.
- 36-month plan with sustained operating break-even in M26 (August 2029) and a Year-3 operating profit of ₹11.7 L.
- Ask cut to ₹10.51 L for Milestone 1 at a proposed ₹75 L pre-money (12.3% to the investor). Shown beside the ₹44.75 L cost floor, the ₹60 L Berkus-style cross-check and a ₹1 Cr ambitious case. The ₹20 L SISFS grant is kept separate and never shown as secured.
- Competitor analysis (WHOOP, Amazfit Bip 6, Fitbit Charge 6, GyroGlove, Liftware, weighted utensils), with prices checked on 12 Oct 2026.
- Repository-vs-paper audit for both products; TremoSense headline updated to the current build's ≈90% bench result.
- Closing page now shows competitive advantage (TremoSense vs GyroGlove, Liftware, weighted spoon; ParkinSense vs WHOOP, Fitbit, Amazfit). Risks stay in the companion guide.
- New full-screen presentation website; deck rebuilt at 14 slides (about 11–12 minutes).
- The institute reference was removed from every deliverable.

## Evidence status and limitations

- **ParkinSense:** streaming, steps, tremor scoring and motion context are bench-tested; HR/HRV/SpO₂ are research-grade; all analysis runs on a host, not on the wrist; the mobile app is in development. ICMR evaluation in progress, results pending.
- **TremoSense:** the current build (Zephyr, 208 Hz, higher-torque servos) reaches ≈90% tremor rejection on the bench (founder-reported; logs to be published). The public `constants.h` still shows the tuning constants as 0, so publish the tuned values with the logs. No user testing yet.
- **Valuation:** ₹75 L is a working negotiation target, not an independently verified valuation. Person-months are estimates and Berkus scores are judgement.
- **Financials:** cash-basis forecast built on assumptions (CAC, conversion, clinic growth, Scenario C cost) that no customer has validated. Competitor prices are benchmarks only.
- **Regulatory and IP:** CDSCO class and HSN/GST rates are assumptions to confirm; the patent is in preparation (not filed).
- **Customer evidence:** the Problem slide quotes published research (Hadley et al. 2021; Kellner et al. 2017; Kurupath et al. 2020), not our own interviews, which are still to be run.

The full missing-evidence checklist is in `docs/COMPANION_GUIDE.md`.

## Security

`.gitignore` excludes `node_modules/`, `.next/`, `.vercel/` and all `.env*` files. Nothing in this repository needs a secret. Never commit API keys, tokens or credentials.
