"""Generates the AVERRA logo set as SVG (monoline, no fonts needed, so it renders identically everywhere).

Mark: a tremor waveform that damps into a steady line and ends in a point — measure, then assist.
Wordmark: custom monoline capitals with open (bar-less) A's.
"""
import math
from pathlib import Path

NAVY, BLUE, CYAN, WHITE = "#0F172A", "#3B82F6", "#06B6D4", "#FFFFFF"
OUT = Path(__file__).parent

def wave_path(x0=8, x1=52, y=32, amp=14, cycles=2.0, settle=0.58, n=120):
    pts = []
    for i in range(n + 1):
        t = i / n
        x = x0 + (x1 - x0) * t
        if t < settle:
            k = t / settle
            a = amp * (1 - k) ** 1.6
            yy = y - a * math.sin(2 * math.pi * cycles * k)
        else:
            yy = y
        pts.append(f"{x:.2f},{yy:.2f}")
    return "M" + " L".join(pts)

def mark(fg=WHITE, accent=CYAN, bg=None, size=64, stroke=4.2):
    rect = f'<rect width="64" height="64" rx="16" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="{size}" height="{size}" role="img" aria-label="AVERRA mark">'
            f'{rect}<path d="{wave_path()}" fill="none" stroke="{fg}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<circle cx="52" cy="32" r="4.6" fill="{accent}"/></svg>')

# letter strokes in a 40-unit cap height; returns (path, advance)
def letters():
    L = {
        "A": ("M0,40 L15,0 L30,40", 30),
        "V": ("M0,0 L15,40 L30,0", 30),
        "E": ("M26,0 H0 V40 H26 M0,20 H20", 26),
        "R": ("M0,40 V0 H15 A10,10 0 0 1 15,20 H0 M13,20 L27,40", 27),
    }
    return L

def wordmark_paths(text="AVERRA", gap=13, sw=4.4):
    L = letters(); x = 0; parts = []
    for ch in text:
        d, adv = L[ch]
        parts.append(f'<path transform="translate({x:.1f},0)" d="{d}"/>')
        x += adv + gap
    return "".join(parts), x - gap

def wordmark(fg=WHITE, h=40, sw=4.4):
    p, w = wordmark_paths(sw=sw)
    pad = sw
    vb = f"{-pad} {-pad} {w + 2*pad:.1f} {40 + 2*pad:.1f}"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" height="{h}" role="img" aria-label="AVERRA">'
            f'<g fill="none" stroke="{fg}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{p}</g></svg>')

def lockup(fg=WHITE, accent=CYAN, sw=4.4):
    p, w = wordmark_paths(sw=sw)
    # mark scaled to 56 tall, placed left; wordmark 40 tall centred
    m = (f'<g transform="translate(-4,-12) scale(1.0)"><path d="{wave_path()}" fill="none" stroke="{fg}" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/>'
         f'<circle cx="52" cy="32" r="5" fill="{accent}"/></g>')
    ox = 70
    vb = f"-4 -10 {ox + w + 8:.1f} 60"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="AVERRA">{m}'
            f'<g transform="translate({ox},0)" fill="none" stroke="{fg}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{p}</g></svg>')

files = {
    "averra-mark-dark.svg": mark(WHITE, CYAN, NAVY),           # app icon / favicon on navy tile
    "averra-mark-light.svg": mark(NAVY, BLUE, WHITE),
    "averra-mark-mono.svg": mark("currentColor", "currentColor"),  # device engraving / packaging (one colour)
    "averra-wordmark-white.svg": wordmark(WHITE),
    "averra-wordmark-navy.svg": wordmark(NAVY),
    "averra-lockup-white.svg": lockup(WHITE, CYAN),
    "averra-lockup-navy.svg": lockup(NAVY, BLUE),
}
for n, svg in files.items():
    (OUT / n).write_text(svg)
print("\n".join(files))
