'use client';

/* Vero's motion pieces. Each explains something: a panel arriving, a number counting, a label decoding,
   the registry light following the pointer. All of them settle at once under reduced motion. */

import Lenis from 'lenis';
import { createElement, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { prefersCalm, tween } from '@/lib/motion';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Fades and lifts its content in when it first scrolls into view. `i` staggers siblings. */
export function Reveal({
  as = 'div',
  i = 0,
  className,
  style,
  children,
  ...rest
}: { as?: ElementType; i?: number; className?: string; style?: CSSProperties; children?: ReactNode } & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (prefersCalm() || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return createElement(
    as,
    { ref, className: `rv${shown ? ' in' : ''}${className ? ` ${className}` : ''}`, style: { ...style, '--i': i } as CSSProperties, ...rest },
    children,
  );
}

/** A headline whose words slide up out of a mask, as on the website. Read whole by screen readers. */
export function Words({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="words" aria-hidden="true" style={{ '--d': `${delay}ms` } as CSSProperties}>
        {words.map((word, index) => (
          <span key={`${word}-${index}`}>
            <span className="w">
              <span style={{ '--k': index } as CSSProperties}>{word}</span>
            </span>
            {index < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </>
  );
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_';

/** A mono label that decodes into its text, like the website's section labels. */
export function Scramble({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [shown, setShown] = useState(text);
  useEffect(() => {
    if (prefersCalm()) {
      setShown(text);
      return;
    }
    let frame = 0;
    let start = 0;
    const total = 520 + text.length * 22;
    const step = (now: number) => {
      if (!start) start = now;
      const t = now - start - delay;
      if (t < 0) {
        setShown(text.replace(/\S/g, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? 'X'));
        frame = requestAnimationFrame(step);
        return;
      }
      const settled = Math.floor((t / total) * text.length * 1.15);
      let out = '';
      for (let index = 0; index < text.length; index += 1) {
        const char = text[index] ?? '';
        out += index < settled || char === ' ' ? char : (GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? char);
      }
      setShown(out);
      if (settled < text.length) frame = requestAnimationFrame(step);
      else setShown(text);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [text, delay]);
  return (
    <span className={`scr${className ? ` ${className}` : ''}`}>
      {/* aria-label isn't allowed on a plain span (axe: aria-prohibited-attr), so the real words are read from here. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}

/** A number that counts up on arrival and eases to any new value. */
export function CountUp({ value, ms = 1300, className, from = 0 }: { value: number; ms?: number; className?: string; from?: number }) {
  const [shown, setShown] = useState(from);
  const last = useRef(from);
  useEffect(() => {
    const stop = tween(last.current, value, last.current === from ? ms : 700, (next) => {
      last.current = next;
      setShown(next);
    });
    return stop;
  }, [value, ms, from]);
  // The number itself is read: aria-label isn't allowed on a plain span (axe: aria-prohibited-attr).
  return <span className={className}>{shown}</span>;
}

const FLOW_PATHS = [
  'M-40 220 C 220 120, 380 320, 640 200 S 1080 60, 1500 180',
  'M-40 300 C 260 220, 420 380, 700 280 S 1100 150, 1500 260',
  'M-40 140 C 180 60, 460 220, 760 120 S 1180 20, 1500 100',
  'M-40 380 C 300 330, 520 440, 820 360 S 1200 260, 1500 340',
];

/** The flowing line art from the website, drawn in behind the hero. */
export function FlowLines({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useIso(() => {
    ref.current?.querySelectorAll('path').forEach((path) => {
      const length = Math.ceil(path.getTotalLength());
      path.style.setProperty('--len', String(length));
    });
  }, []);
  return (
    <svg ref={ref} className={`flow${className ? ` ${className}` : ''}`} viewBox="0 0 1440 460" preserveAspectRatio="none" aria-hidden="true">
      {FLOW_PATHS.map((d, index) => (
        <path key={d} d={d} style={{ '--k': index } as CSSProperties} />
      ))}
    </svg>
  );
}

/** The navy "registry light": drifting brand blooms, a pixel field and film grain. It leans toward the pointer. */
export function Atmos() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const host = element?.parentElement;
    if (!element || !host || prefersCalm() || window.matchMedia('(pointer: coarse)').matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = host.getBoundingClientRect();
        element.style.setProperty('--mx', (((event.clientX - box.left) / box.width) * 2 - 1).toFixed(3));
        element.style.setProperty('--my', (((event.clientY - box.top) / box.height) * 2 - 1).toFixed(3));
      });
    };
    host.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener('pointermove', onMove);
    };
  }, []);
  return (
    <div className="atmos" ref={ref} aria-hidden="true">
      <i className="b1" />
      <i className="b2" />
      <i className="b3" />
      <i className="b4" />
      <span className="grid" />
      <span className="grain" />
    </div>
  );
}

/** Smooth wheel scrolling, as on the website. Off for reduced motion and touch. */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersCalm() || window.matchMedia('(pointer: coarse)').matches) return;
    const lenis = new Lenis({ duration: 1.05, easing: (t) => 1 - Math.pow(1 - t, 3.2), wheelMultiplier: 0.95, prevent: (node) => Boolean(node.closest?.('[data-lenis-prevent],.drawer,.cmd,.menu')) });
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    // Open overlays stop the page underneath from scrolling.
    const observer = new MutationObserver(() => {
      const locked = document.body.classList.contains('open') || document.body.classList.contains('cmdo') || document.body.classList.contains('navo');
      if (locked) lenis.stop();
      else lenis.start();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      lenis.destroy();
    };
  }, []);
  return null;
}

/** A thin light that runs across the top of the window while a page is on its way. */
export function RouteBar() {
  const [state, setState] = useState<'idle' | 'going' | 'done'>('idle');
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      clearTimeout(timer);
      setState('going');
    };
    const end = () => {
      setState('done');
      timer = setTimeout(() => setState('idle'), 450);
    };
    window.addEventListener('vero:nav-start', start);
    window.addEventListener('vero:nav-end', end);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('vero:nav-start', start);
      window.removeEventListener('vero:nav-end', end);
    };
  }, []);
  const scale = state === 'idle' ? 0 : state === 'going' ? 0.7 : 1;
  return <div className="routebar" aria-hidden="true" style={{ transform: `scaleX(${scale})`, opacity: state === 'idle' ? 0 : 1, transition: state === 'going' ? 'transform 2.4s cubic-bezier(.1,.7,.2,1), opacity .2s' : undefined }} />;
}
