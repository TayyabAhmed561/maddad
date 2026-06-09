import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CONSENT_KEY = "maddad_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // sessionStorage: consent resets each session (privacy-friendly per PIPEDA)
    if (!sessionStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    sessionStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl shadow-lg px-5 py-4 flex items-center gap-4 pointer-events-auto">
        <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
          Maddad uses essential cookies for authentication and anonymous analytics.
          No advertising cookies.{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            Learn more
          </Link>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
          <button
            onClick={accept}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
