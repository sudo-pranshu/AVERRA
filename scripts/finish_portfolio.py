"""Two-pass render of the completed portfolio: render, read page numbers from the PDF, write them into the contents page, render again."""
import re, subprocess
from pypdf import PdfReader
p = "portfolio/AVERRA_Practical_Portfolio_Completed"
render = lambda: subprocess.run(["node", "scripts/render_portfolio.mjs", p.split("/")[1]], check=True)
render()
r = PdfReader(p + ".pdf"); pages = {}
codes = [f"M{m}.{a}" for m in range(1, 6) for a in range(1, 4)]
for i, pg in enumerate(r.pages):
    if i < 2: continue
    t = pg.extract_text(); first = [l.strip() for l in t.split("\n")[:4]]
    for c in codes:
        if c not in pages and f"Mandatory Model {c}" in t: pages[c] = i + 1
    for k, lab in (("REF", "References"), ("INC", "Consistency review")):
        if k not in pages and lab in first: pages[k] = i + 1
    if "EVI" not in pages and "Evidence appendix" in t: pages["EVI"] = i + 1
    if "FIN" not in pages and "Final completeness checklist" in t: pages["FIN"] = i + 1
h = open(p + ".html").read(); a = h.index('<table class="toc">'); b = h.index("</table>", a)
def fix(m):
    row = m.group(0)
    key = next((c for c in codes if f"<td>{c}</td>" in row), None) or next((k for k, lab in (("REF", ">References<"), ("EVI", "Evidence appendix"), ("INC", "Consistency review"), ("FIN", "Final completeness")) if lab in row), None)
    return re.sub(r'<td class="pg">\d*</td>', f'<td class="pg">{pages[key]}</td>', row) if key else row
open(p + ".html", "w").write(h[:a] + re.sub(r"<tr.*?</tr>", fix, h[a:b]) + h[b:])
render()
print(len(PdfReader(p + ".pdf").pages), "pages", pages)
