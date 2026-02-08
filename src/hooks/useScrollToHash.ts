import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Robust scroll-to-hash hook.
 * Observes DOM mutations to handle elements rendered after navigation.
 * Use this on pages where hash-anchored sections load asynchronously.
 */
export function useScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const targetId = hash.slice(1);

    const scrollToElement = () => {
      const el = document.getElementById(targetId);
      if (el) {
        // Small delay to ensure layout is settled
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
        return true;
      }
      return false;
    };

    // Try immediately
    if (scrollToElement()) return;

    // If element not found, use MutationObserver to wait for it
    const observer = new MutationObserver(() => {
      if (scrollToElement()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup after 3 seconds
    const timeout = setTimeout(() => observer.disconnect(), 3000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [hash]);
}
