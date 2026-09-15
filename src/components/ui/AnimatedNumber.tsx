import { useEffect, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  format: (value: number) => string;
};

export function AnimatedNumber({ value, format }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      displayRef.current = value;
      setDisplay(value);
      return;
    }

    const start = displayRef.current;
    const delta = value - start;
    const duration = 240;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const next = start + delta * progress;
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{format(display)}</span>;
}
