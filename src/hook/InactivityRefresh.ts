import { useEffect, useRef } from "react";
import { useAlert } from "../components/utils/alert/Alert";
import { AlertData, EAlertCategory } from "../interfaces/AlertData";

const TIMEOUT_DURATION = 60 * 60 * 1000;
const WARNING_DURATION = 5 * 60 * 1000;

const useInactivityRefresh = (timeout: number = TIMEOUT_DURATION, warning: number = WARNING_DURATION): void => {
  const { push, remove } = useAlert();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertRef = useRef<AlertData | null>(null);

  if(timeout == 0) {
    return;
  }

  if(!warning) {
    warning = WARNING_DURATION;
  }

  if(timeout < warning) {
    const newTimeout = timeout * 2;
    console.warn(`Reload timeout should be greater than warning timeout (${warning}): Found ${timeout}, changed to ${newTimeout}.`)
    timeout = newTimeout;
  }

  const resetTimer = (): void => {
    if(timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if(warningRef.current) {
      clearTimeout(warningRef.current);
    }

    if(alertRef.current) {
      remove(alertRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const seconds = warning / 1000;
      alertRef.current = {
        category: EAlertCategory.WARN,
        title: "You've been inactive",
        content: `The page will refresh in ${seconds} seconds due to inactivity. Move your mouse, type, or scroll to stay active.`,
        time: warning
      }
      push(alertRef.current);

      warningRef.current = setTimeout(() => {
        document.body.classList.add("fade-out");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }, warning);
    }, timeout - warning);
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
