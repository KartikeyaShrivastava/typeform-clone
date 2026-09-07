"use client";

import { useEffect, useMemo, useRef } from "react";

export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useMemo(() => {
    return (...args: Args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fnRef.current(...args), delayMs);
    };
  }, [delayMs]);
}
