import { useEffect, useRef } from "react";

const DEFAULT_TIMEOUT = 60 * 60 * 1000;

const useInactivityRefresh = (timeout: number = DEFAULT_TIMEOUT): void => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }, timeout);
  };

  useEffect(() => {
    const events: (keyof DocumentEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    events.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    resetTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [timeout]);
};

export default useInactivityRefresh;
