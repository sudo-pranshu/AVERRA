"use client";

import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { SLIDES } from "@/components/slides";
import { WaveProgress } from "@/components/WaveProgress";
import { K } from "@/lib/data";

/** Design canvas. Every slide is laid out at this size and scaled to fit the screen. */
const CW = 1440, CH = 810;

function useHashIndex(max: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const n = parseInt(window.location.hash.replace("#", ""), 10);
    if (!Number.isNaN(n) && n >= 1 && n <= max) setIndex(n - 1);
  }, [max]);
  useEffect(() => {
    history.replaceState(null, "", `#${index + 1}`);
  }, [index]);
  return [index, setIndex] as const;
}

/** Scale factor for the stage; null = phone / portrait layout (natural scrolling). */
function useStageScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [s, setS] = useState<number | null>(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const { width: w, height: h } = el.getBoundingClientRect();
      const staged = window.innerWidth >= 860 && window.innerWidth / window.innerHeight >= 1.15;
      setS(staged ? Math.min(w / CW, h / CH) : null);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return s;
}

export default function Presentation() {
  const total = SLIDES.length;
  const [index, setIndex] = useHashIndex(total);
  const [dir, setDir] = useState(1);
  const [notes, setNotes] = useState(false);
  const [help, setHelp] = useState(false);
  const reduce = useReducedMotion();
  const touch = useRef<{ x: number; y: number } | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const scale = useStageScale(area);

  const go = useCallback(
    (to: number) => {
      const next = Math.max(0, Math.min(total - 1, to));
      setDir(next >= index ? 1 : -1);
      setIndex(next);
    },
    [index, total, setIndex],
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA")) return;
      if (["ArrowRight", "PageDown", " ", "Spacebar"].includes(e.key)) { e.preventDefault(); go(index + 1); }
      else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(index - 1); }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(total - 1);
      else if (e.key.toLowerCase() === "n") setNotes((v) => !v);
      else if (e.key.toLowerCase() === "f") toggleFullscreen();
      else if (e.key.toLowerCase() === "r") go(0);
      else if (e.key === "?") setHelp((v) => !v);
      else if (e.key === "Escape") { setHelp(false); setNotes(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, total, toggleFullscreen]);

  const slide = SLIDES[index];
  const scripts = slide.notes.map((n) => K.script[n - 1]);
  const accent = slide.accent;
  const staged = scale !== null;

  return (
    <MotionConfig reducedMotion="user">
      <main
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-navy"
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const dx = e.changedTouches[0].clientX - touch.current.x;
          const dy = e.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}
        aria-roledescription="presentation"
      >
        <Ambient accent={accent} index={index} />

        {/* top bar */}
        <header className="relative z-30 flex h-14 shrink-0 items-center justify-between px-5 md:px-8">
          <button onClick={() => go(0)} className="flex items-center gap-3" aria-label="Restart presentation">
            <img src="/brand/averra-lockup-white.svg" alt="AVERRA" className="h-5 w-auto md:h-6" />
          </button>
          <nav className="flex items-center gap-1 text-sm text-slate" aria-label="Presentation controls">
            <span className="t-num mr-2 hidden sm:inline" aria-live="polite"><span className="text-white">{String(index + 1).padStart(2, "0")}</span> / {total}</span>
            <IconButton label="Previous slide" onClick={() => go(index - 1)} disabled={index === 0}>‹</IconButton>
            <IconButton label="Next slide" onClick={() => go(index + 1)} disabled={index === total - 1}>›</IconButton>
            <IconButton label={notes ? "Hide presenter notes" : "Show presenter notes"} onClick={() => setNotes((v) => !v)} active={notes}>Notes</IconButton>
            <IconButton label="Toggle full screen" onClick={toggleFullscreen} wide>Full screen</IconButton>
            <IconButton label="Restart from the first slide" onClick={() => go(0)} wide>Restart</IconButton>
            <IconButton label="Keyboard shortcuts" onClick={() => setHelp((v) => !v)}>?</IconButton>
          </nav>
        </header>

        {/* stage */}
        <div ref={area} className="relative z-10 min-h-0 flex-1">
          <div
            className={staged ? "absolute left-1/2 top-1/2 @container" : "absolute inset-0 overflow-y-auto @container"}
            style={staged ? { width: CW, height: CH, transform: `translate(-50%, -50%) scale(${scale})` } : undefined}
          >
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.section
                key={slide.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 36, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -24, filter: "blur(4px)", transition: { duration: 0.25 } }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={staged ? "h-full w-full px-14 py-6" : "min-h-full w-full px-5 pb-24 pt-4"}
                aria-label={`Slide ${index + 1}: ${slide.title}`}
                data-slide={slide.id}
              >
                <slide.Component />
              </motion.section>
            </AnimatePresence>
          </div>
        </div>

        <WaveProgress index={index} total={total} onSelect={go} titles={SLIDES.map((s) => s.title)} accent={accent} />

        {/* presenter notes */}
        <AnimatePresence>
          {notes && (
            <motion.aside
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 z-40 max-h-[45dvh] overflow-y-auto border-t hairline bg-navy-3/95 px-6 py-5 backdrop-blur md:px-14"
              aria-label="Presenter notes"
            >
              <div className="mx-auto max-w-5xl">
                <p className="mb-2 text-sm text-cyan">Presenter notes · {slide.title}</p>
                {scripts.length === 0 && <p className="text-base text-mist">{slide.extraNote ?? "No scripted notes — optional deep-dive."}</p>}
                {scripts.map((s) => (
                  <div key={s.slide} className="mb-3">
                    <p className="text-sm text-slate"><span className={s.speaker === "Pranshu" ? "text-cyan" : "text-violet"}>{s.speaker}</span> · deck slide {s.slide} · {s.title} · about {s.seconds} s</p>
                    <p className="whitespace-pre-line text-base leading-relaxed text-mist">{s.text}</p>
                  </div>
                ))}
                {slide.extraNote && scripts.length > 0 && <p className="text-sm text-slate">{slide.extraNote}</p>}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* help */}
        <AnimatePresence>
          {help && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 grid place-items-center bg-navy/80 backdrop-blur" onClick={() => setHelp(false)}>
              <div className="panel w-[min(92vw,420px)] p-6" role="dialog" aria-label="Keyboard shortcuts">
                <p className="mb-4 text-xl font-semibold">Keyboard shortcuts</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-mist">
                  {[["→  Space  PgDn", "Next slide"], ["←  PgUp", "Previous slide"], ["Home / End", "First / last slide"], ["N", "Presenter notes"], ["F", "Full screen"], ["R", "Restart"], ["Esc", "Close panels"]].map(([k, v]) => (
                    <div key={k} className="contents"><dt className="text-white">{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
                <p className="mt-4 text-sm text-slate">On touch screens, swipe left or right.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}

/** Two soft light fields that drift to a new position and take the slide's accent colour. */
function Ambient({ accent, index }: { accent: string; index: number }) {
  const a = (index * 37) % 100, b = (index * 61 + 40) % 100;
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div className="dots absolute inset-0" />
      <motion.div className="absolute h-[70vmax] w-[70vmax] rounded-full opacity-[0.16] blur-[110px]"
        animate={{ left: `${-25 + a * 0.5}%`, top: `${-35 + (a % 30)}%`, backgroundColor: accent }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} />
      <motion.div className="absolute h-[60vmax] w-[60vmax] rounded-full bg-blue opacity-[0.10] blur-[120px]"
        animate={{ left: `${30 + b * 0.4}%`, top: `${25 + (b % 35)}%` }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }} />
    </div>
  );
}

function IconButton({ children, label, onClick, disabled, active, wide }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; active?: boolean; wide?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded-full px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 ${active ? "bg-white/10 text-white" : ""} ${wide ? "hidden md:inline" : ""}`}
    >
      {children}
    </button>
  );
}
