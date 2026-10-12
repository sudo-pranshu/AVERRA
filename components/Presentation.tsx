"use client";

import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { SLIDES } from "@/components/slides";
import { WaveProgress } from "@/components/WaveProgress";
import { K } from "@/lib/data";

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

export default function Presentation() {
  const total = SLIDES.length;
  const [index, setIndex] = useHashIndex(total);
  const [dir, setDir] = useState(1);
  const [notes, setNotes] = useState(false);
  const [help, setHelp] = useState(false);
  const reduce = useReducedMotion();
  const touch = useRef<{ x: number; y: number } | null>(null);

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

  return (
    <MotionConfig reducedMotion="user">
      <main
        className="relative h-[100dvh] w-full overflow-hidden bg-navy"
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
        {/* top bar */}
        <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 md:px-10">
          <button onClick={() => go(0)} className="flex items-center gap-3" aria-label="Restart presentation">
            <img src="/brand/averra-lockup-white.svg" alt="AVERRA" className="h-6 w-auto md:h-7" />
          </button>
          <nav className="flex items-center gap-1 text-sm text-slate" aria-label="Presentation controls">
            <span className="t-num mr-3 hidden sm:inline" aria-live="polite">{index + 1} / {total}</span>
            <IconButton label="Previous slide" onClick={() => go(index - 1)} disabled={index === 0}>‹</IconButton>
            <IconButton label="Next slide" onClick={() => go(index + 1)} disabled={index === total - 1}>›</IconButton>
            <IconButton label={notes ? "Hide presenter notes" : "Show presenter notes"} onClick={() => setNotes((v) => !v)} active={notes}>Notes</IconButton>
            <IconButton label="Toggle full screen" onClick={toggleFullscreen}>Full screen</IconButton>
            <IconButton label="Restart from the first slide" onClick={() => go(0)}>Restart</IconButton>
            <IconButton label="Keyboard shortcuts" onClick={() => setHelp((v) => !v)}>?</IconButton>
          </nav>
        </header>

        {/* slides */}
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.section
            key={slide.id}
            custom={dir}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 overflow-y-auto px-5 pb-28 pt-20 md:px-14 md:pb-24 md:pt-24"
            aria-label={`Slide ${index + 1}: ${slide.title}`}
          >
            <slide.Component />
          </motion.section>
        </AnimatePresence>

        <WaveProgress index={index} total={total} onSelect={go} titles={SLIDES.map((s) => s.title)} />

        {/* presenter notes */}
        <AnimatePresence>
          {notes && (
            <motion.aside
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 z-40 max-h-[45dvh] overflow-y-auto border-t hairline bg-navy-3/95 px-6 py-5 backdrop-blur md:px-14"
              aria-label="Presenter notes"
            >
              <div className="mx-auto max-w-5xl">
                <p className="t-small mb-2 text-cyan">Presenter notes · {slide.title}</p>
                {scripts.length === 0 && <p className="t-body text-mist">{slide.extraNote ?? "No scripted notes — optional deep-dive."}</p>}
                {scripts.map((s) => (
                  <div key={s.slide} className="mb-3">
                    <p className="t-small text-slate">Deck slide {s.slide} · {s.title} · about {s.seconds} s</p>
                    <p className="t-body whitespace-pre-line text-mist">{s.text}</p>
                  </div>
                ))}
                {slide.extraNote && scripts.length > 0 && <p className="t-small text-slate">{slide.extraNote}</p>}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* help */}
        <AnimatePresence>
          {help && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 grid place-items-center bg-navy/80 backdrop-blur" onClick={() => setHelp(false)}>
              <div className="panel w-[min(92vw,420px)] p-6" role="dialog" aria-label="Keyboard shortcuts">
                <p className="t-h2 mb-4">Keyboard shortcuts</p>
                <dl className="t-body grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-mist">
                  {[["→  Space  PgDn", "Next slide"], ["←  PgUp", "Previous slide"], ["Home / End", "First / last slide"], ["N", "Presenter notes"], ["F", "Full screen"], ["R", "Restart"], ["Esc", "Close panels"]].map(([k, v]) => (
                    <div key={k} className="contents"><dt className="text-white">{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
                <p className="t-small mt-4 text-slate">On touch screens, swipe left or right.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}

function IconButton({ children, label, onClick, disabled, active }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded-full px-3 py-1.5 transition-colors hover:bg-navy-3 hover:text-white disabled:opacity-30 ${active ? "bg-navy-3 text-white" : ""} ${children === "Full screen" || children === "Restart" ? "hidden md:inline" : ""}`}
    >
      {children}
    </button>
  );
}
