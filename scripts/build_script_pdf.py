"""Builds docs/AVERRA_Pitch_Script.html (rendered to PDF by scripts/render_pdf.mjs) from data/content.json."""
import json, html
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
K = json.loads((ROOT / "data" / "content.json").read_text())
S = K["script"]
mm = lambda s: f"{s // 60}:{s % 60:02d}"
rows, t = [], 0
for s in S:
    rows.append(f"<tr class='{s['speaker'].lower()}'><td>{s['slide']}</td><td>{html.escape(s['title'])}</td><td>{s['speaker']}</td><td>{mm(t)}–{mm(t + s['seconds'])}</td><td>{s['seconds']} s</td></tr>"); t += s["seconds"]
tot = {sp: sum(x["seconds"] for x in S if x["speaker"] == sp) for sp in ("Pranshu", "Pawan")}
blocks, t, prev = [], 0, None
for s in S:
    if s["speaker"] != prev:
        blocks.append(f"<h2 class='{s['speaker'].lower()}'>{s['speaker']} · slides {', '.join(str(x['slide']) for x in S if x['speaker'] == s['speaker'])[:0]}{'1–7' if s['speaker']=='Pranshu' else '8–14'}</h2>")
        prev = s["speaker"]
    paras = "".join(f"<p>{html.escape(p)}</p>" for p in s["text"].split("\n") if p.strip())
    blocks.append(f"<section><div class='meta'><span class='n'>Slide {s['slide']}</span> {html.escape(s['title'])} <span class='time'>{mm(t)}–{mm(t + s['seconds'])} · {s['seconds']} s</span></div>{paras}</section>"); t += s["seconds"]
words = sum(len(s["text"].split()) for s in S)
doc = f"""<!doctype html><html><head><meta charset="utf-8"><title>AVERRA pitch script</title><style>
@page {{ size: A4; margin: 18mm 18mm 16mm; }}
body {{ font-family: 'Sora Variable', 'Sora', Arial, sans-serif; color: #0f172a; font-size: 11pt; line-height: 1.55; }}
h1 {{ font-size: 24pt; margin: 0; letter-spacing: -0.02em; }} .sub {{ color: #475569; margin: 4px 0 18px; }}
table {{ width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 8px; }} th, td {{ text-align: left; padding: 5px 6px; border-bottom: 1px solid #e2e8f0; }}
th {{ background: #0f172a; color: #fff; }} tr.pranshu td:nth-child(3) {{ color: #0891b2; font-weight: 600; }} tr.pawan td:nth-child(3) {{ color: #7c3aed; font-weight: 600; }}
h2 {{ font-size: 15pt; margin: 22px 0 8px; padding: 6px 10px; border-radius: 6px; color: #fff; break-after: avoid; }} h2.pranshu {{ background: #0891b2; }} h2.pawan {{ background: #7c3aed; page-break-before: always; }}
section {{ break-inside: avoid; margin: 0 0 14px; }} .meta {{ font-weight: 600; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 4px; }}
.n {{ color: #64748b; margin-right: 6px; }} .time {{ float: right; color: #64748b; font-weight: 400; font-size: 9.5pt; }} p {{ margin: 0 0 6px; }}
.note {{ font-size: 9.5pt; color: #475569; background: #f1f5f9; padding: 8px 10px; border-radius: 6px; }}
</style></head><body>
<h1>AVERRA · pitch script</h1>
<p class="sub">Engineering better movement intelligence. · Pranshu Kumar (slides 1–7) and Pawan Shinde (slides 8–14) · about {mm(t)} total ({words} words)</p>
<table><tr><th>Slide</th><th>Topic</th><th>Speaker</th><th>Time</th><th>Length</th></tr>{''.join(rows)}</table>
<p class="note">Pranshu speaks about {mm(tot['Pranshu'])}, Pawan about {mm(tot['Pawan'])}. The hand-over line closes slide 7. Click cues: each slide's builds follow the order of the script. The same text is in the PowerPoint speaker notes and in the website's notes panel (press N).</p>
{''.join(blocks)}
</body></html>"""
(ROOT / "docs" / "AVERRA_Pitch_Script.html").write_text(doc)
print("script html written", words, "words", mm(t))
