import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook to scroll to top on route change
 * Implements smooth scrolling for hash anchors
 */
export function useScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Smooth scroll to hash anchor
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
}
