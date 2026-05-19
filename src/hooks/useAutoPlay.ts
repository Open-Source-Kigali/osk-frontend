import { useState, useEffect, useCallback, useRef } from "react";

interface UseAutoPlayOptions {
  length:    number;
  interval?: number; // ms - default 4000
}

interface UseAutoPlayReturn {
  current:   number;
  paused:    boolean;
  next:      () => void;
  prev:      () => void;
  goTo:      (index: number) => void;
  setPaused: (paused: boolean) => void;
}

/**
 * Auto-advancing index with pause-on-hover support.
 * Works for any carousel regardless of what it renders.
 *
 * Usage:
 *   const { current, next, prev, goTo, setPaused } =
 *     useAutoPlay({ length: testimonials.length });
 */


export const useAutoPlay = ({
  length,
  interval = 4000,
}: UseAutoPlayOptions): UseAutoPlayReturn => {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c === length - 1 ? 0 : c + 1));
  }, [length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? length - 1 : c - 1));
  }, [length]);

  // Start (or restart) the interval from zero
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, interval);
  }, [next, interval]);

  // When user clicks prev/next manually, restart the timer
  // so the auto-advance doesn't fire immediately after
  const handleNext = useCallback(() => {
    next();
    startTimer();
  }, [next, startTimer]);

  const handlePrev = useCallback(() => {
    prev();
    startTimer();
  }, [prev, startTimer]);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(index);
      startTimer();
    },
    [startTimer]
  );

  // Start/stop based on paused state
  useEffect(() => {
    if (!paused) {
      startTimer();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, startTimer]);

  return {
    current,
    paused,
    next:      handleNext,
    prev:      handlePrev,
    goTo,
    setPaused,
  };
};