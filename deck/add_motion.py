"""Adds Morph transitions and staged entrance animations to the pptxgenjs deck.

Shapes are selected by region (inches): every shape whose top-left corner falls inside a region joins that step.
Persistent objects named '!!…' (title, kicker, progress dots, photos, funding bar) are never animated, so Morph
carries them between slides. Each step = list of regions: the first starts on click, the rest follow automatically.
"""
import re, sys, zipfile, shutil, os
from lxml import etree

SRC, DST = sys.argv[1], sys.argv[2]
EMU = 914400
NS = {"p": "http://schemas.openxmlformats.org/presentationml/2006/main",
      "a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
P = "{%s}" % NS["p"]

def R(x0, y0, x1, y1, fx="fade"):
    return (x0, y0, x1, y1, fx)

# slide number -> list of steps; step = list of regions
PLAN = {
    1: [[R(0.7, 4.15, 7.7, 6.2)], [R(8.1, 4.5, 13, 6.2)]],
    2: [[R(0.5, 1.5, 3.1, 3.05, "wipe")], [R(3.1, 1.5, 5.7, 3.05, "wipe")], [R(5.7, 1.5, 8.3, 3.05, "wipe")],
        [R(0.5, 3.2, 8.4, 3.55)] + [R(0.5, 3.55 + 0.95 * i, 8.4, 4.5 + 0.95 * i) for i in range(3)] + [R(0.5, 6.4, 8.4, 6.75)],
        [R(8.7, 1.5, 13, 1.9), R(8.7, 1.9, 9.0, 6.5)] + [R(9.0, 1.9 + 0.9 * i, 13, 2.8 + 0.9 * i, "wipe") for i in range(5)]],
    3: [[R(0.5, 1.5, 5.2, 6.6)], [R(5.3, 1.5, 8.1, 3.2)] + [R(5.3, 3.2 + 0.5 * i, 8.1, 3.7 + 0.5 * i, "wipe") for i in range(5)] + [R(5.3, 5.7, 8.1, 6.6)], [R(8.1, 1.5, 13, 6.6)]],
    4: [[R(0.5, 3.3 + 0.52 * i, 4.4, 3.82 + 0.52 * i, "wipe") for i in range(5)], [R(4.45, 1.45, 7.5, 3.47)], [R(4.45, 3.47, 7.5, 6.0, "wipe")],
        [R(7.55, 1.45, 13, 1.8)] + [R(7.55, 1.8 + 0.42 * i, 13, 2.22 + 0.42 * i, "wipe") for i in range(10)], [R(0.5, 6.0, 13, 6.75)]],
    5: [[R(0.5, 3.45 + 0.52 * i, 4.4, 3.97 + 0.52 * i, "wipe") for i in range(5)], [R(4.45, 1.45 + 1.5 * i, 7.5, 2.95 + 1.5 * i) for i in range(3)],
        [R(7.55, 1.45, 13, 6.0)], [R(0.5, 6.1, 7.5, 6.75)]],
    6: [[R(0.9, 1.4, 6.7, 4.9)], [R(7.1, 1.4, 13, 4.9)], [R(0.5, 4.9, 6.7, 6.75)], [R(6.75, 4.9, 13, 6.75)]],
    7: [[R(1.8, 1.45, 13, 1.8)], [R(1.8 + 2.75 * j, 1.8, 4.55 + 2.75 * j, 3.9, "wipe") for j in range(4)], [R(1.8 + 2.75 * j, 3.9, 4.55 + 2.75 * j, 6.1, "wipe") for j in range(4)], [R(0.5, 6.15, 13, 6.6)]],
    8: [[R(0.5, 1.5, 7.3, 2.95)], [R(0.5, 3.1, 7.3, 4.55)], [R(0.5, 4.7, 7.3, 6.2)], [R(7.4, 1.5, 13, 5.0)], [R(7.4, 5.0, 13, 6.2)]],
    9: [[R(0.5, 1.45, 13, 4.05)], [R(0.5, 4.05, 6.6, 5.8)], [R(6.6, 4.05, 13, 4.5)] + [R(6.6, 4.5 + 0.62 * i, 13, 5.12 + 0.62 * i, "wipe") for i in range(3)]],
    10: [[R(0.4, 1.4, 6.2, 5.0)], [R(0.5, 5.05, 6.2, 5.95)], [R(6.3, 1.45, 10.1, 4.1)], [R(6.3, 4.1, 10.1, 4.8)], [R(10.15, 1.45, 13, 4.8)], [R(6.3, 4.8, 13, 6.1)]],
    11: [[R(0.4, 1.4, 8.8, 6.6)], [R(8.9, 1.45 + 0.84 * i, 13, 2.29 + 0.84 * i) for i in range(6)]],
    12: [[R(0.5, 1.45, 6.6, 4.04)], [R(0.5, 4.04, 6.6, 5.25)], [R(0.5, 5.25, 6.6, 6.65)],
         [R(6.7, 1.45 + 0.66 * i, 10.45, 2.11 + 0.66 * i, "wipe") for i in range(5)] + [R(6.7, 4.8, 10.45, 5.2)],
         [R(10.5, 1.45 + 1.22 * i, 13, 2.67 + 1.22 * i) for i in range(3)]],
    13: [[R(0.5, 1.4, 7.8, 2.35)], [R(0.5, 2.35, 7.8, 4.55)]] + [[R(0.5, 4.55 + 0.4 * i, 7.8, 4.95 + 0.4 * i, "wipe")] for i in range(5)] + [[R(8.05, 1.45, 10.6, 6.0)], [R(10.6, 1.45, 13, 6.0)]],
    14: [[R(0.5, 1.8, 13, 3.55)], [R(0.5, 3.55, 13, 4.3)] + [R(0.5 + 1.53 * i, 4.3, 2.03 + 1.53 * i, 5.1) for i in range(8)], [R(0.5, 5.1, 8.2, 6.7)], [R(8.3, 5.1, 13, 6.7)]],
}
NEVER = ("!!", "sources")

def shapes(tree):
    out = []
    sptree = tree.find(".//p:cSld/p:spTree", NS)
    for el in sptree:
        tag = etree.QName(el).localname
        if tag not in ("sp", "pic", "graphicFrame", "cxnSp", "grpSp"):
            continue
        cnv = el.find(".//p:cNvPr", NS)
        off = el.find("./p:spPr/a:xfrm/a:off", NS)
        if off is None:
            off = el.find("./p:xfrm/a:off", NS)
        if off is None:
            off = el.find(".//a:off", NS)
        if cnv is None or off is None:
            continue
        out.append((int(cnv.get("id")), cnv.get("name") or "", int(off.get("x")) / EMU, int(off.get("y")) / EMU, tag))
    return out

def effect_xml(spid, fx, ids, node, delay=0):
    a, b, c = next(ids), next(ids), next(ids)
    if fx == "wipe":
        preset, sub, filt = 22, 8, "wipe(left)"
    else:
        preset, sub, filt = 10, 0, "fade"
    return (f'<p:par><p:cTn id="{a}" presetID="{preset}" presetClass="entr" presetSubtype="{sub}" fill="hold" nodeType="{node}">'
            f'<p:stCondLst><p:cond delay="{delay}"/></p:stCondLst><p:childTnLst>'
            f'<p:set><p:cBhvr><p:cTn id="{b}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
            f'<p:to><p:strVal val="visible"/></p:to></p:set>'
            f'<p:animEffect transition="in" filter="{filt}"><p:cBhvr><p:cTn id="{c}" dur="450"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>'
            f'</p:childTnLst></p:cTn></p:par>')

def timing_xml(steps):
    """steps: list of list-of-(shape list, fx). Returns <p:timing> xml or ''."""
    ids = iter(range(3, 100000))
    clicks = []
    used = []
    for step in steps:
        subs = [(sh, fx) for sh, fx in step if sh]
        if not subs:
            continue
        a = next(ids)
        inner = []
        t = 0
        for k, (sh, fx) in enumerate(subs):
            b = next(ids)
            effs = "".join(effect_xml(s[0], fx, ids, "clickEffect" if k == 0 and j == 0 else ("withEffect" if j else "afterEffect")) for j, s in enumerate(sh))
            inner.append(f'<p:par><p:cTn id="{b}" fill="hold"><p:stCondLst><p:cond delay="{t}"/></p:stCondLst><p:childTnLst>{effs}</p:childTnLst></p:cTn></p:par>')
            t += 300 if k else 450
            used += [s for s in sh]
        clicks.append(f'<p:par><p:cTn id="{a}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>{"".join(inner)}</p:childTnLst></p:cTn></p:par>')
    if not clicks:
        return "", []
    bld = "".join(f'<p:bldP spid="{s[0]}" grpId="0" animBg="1"/>' for s in used if s[4] == "sp")
    xml = (f'<p:timing xmlns:p="{NS["p"]}"><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
           f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>{"".join(clicks)}</p:childTnLst></p:cTn>'
           f'<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
           f'<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
           f'</p:childTnLst></p:cTn></p:par></p:tnLst>' + (f'<p:bldLst>{bld}</p:bldLst>' if bld else "") + '</p:timing>')
    return xml, used

MORPH = ('<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">'
         '<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">'
         '<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" spd="slow" p14:dur="1250"><p159:morph option="byObject"/></p:transition>'
         '</mc:Choice><mc:Fallback><p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>')

tmp = DST + ".d"
shutil.rmtree(tmp, ignore_errors=True)
zipfile.ZipFile(SRC).extractall(tmp)
report = []
for n in range(1, 15):
    path = f"{tmp}/ppt/slides/slide{n}.xml"
    tree = etree.parse(path)
    root = tree.getroot()
    for old in root.findall("p:transition", NS) + root.findall("p:timing", NS):
        root.remove(old)
    shs = shapes(tree)
    taken = set()
    steps = []
    for step in PLAN.get(n, []):
        st = []
        for (x0, y0, x1, y1, fx) in step:
            sel = [s for s in shs if s[0] not in taken and not s[1].startswith(NEVER) and x0 - 0.01 <= s[2] < x1 and y0 - 0.01 <= s[3] < y1]
            taken.update(s[0] for s in sel)
            st.append((sel, fx))
        steps.append(st)
    txml, used = timing_xml(steps)
    clr = root.find("p:clrMapOvr", NS)
    idx = list(root).index(clr) + 1 if clr is not None else 2
    if n > 1:
        root.insert(idx, etree.fromstring(MORPH)); idx += 1
    if txml:
        root.insert(idx, etree.fromstring(txml))
    tree.write(path, xml_declaration=True, encoding="UTF-8", standalone=True)
    report.append((n, len([s for s in steps if any(x[0] for x in s)]), len(used)))
    # ensure mc ignorable/namespace okay: nothing else needed
out = DST
if os.path.exists(out):
    os.remove(out)
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    # [Content_Types].xml first
    z.write(f"{tmp}/[Content_Types].xml", "[Content_Types].xml")
    for dp, _, files in os.walk(tmp):
        for f in files:
            full = os.path.join(dp, f)
            arc = os.path.relpath(full, tmp)
            if arc != "[Content_Types].xml":
                z.write(full, arc)
shutil.rmtree(tmp)
for r in report:
    print(f"slide {r[0]}: {r[1]} click steps, {r[2]} animated shapes")
