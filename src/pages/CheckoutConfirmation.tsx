import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import maddadLogo from "@/assets/maddad-logo.png";

interface ConfirmationState {
  campaignTitle: string;
  donationAmount: number;
  tipAmount: number;
  totalCharged: number;
  email: string;
  receiptId?: string;
}

export default function CheckoutConfirmation() {
  const { state } = useLocation() as { state: ConfirmationState | null };

  // Fallback if someone lands here directly without state
  const campaignTitle  = state?.campaignTitle  ?? "this cause";
  const donationAmount = state?.donationAmount ?? 0;
  const tipAmount      = state?.tipAmount      ?? 0;
  const email          = state?.email          ?? "";
  const receiptId      = state?.receiptId;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="h-8 w-8 overflow-hidden flex items-center justify-center flex-shrink-0">
              <img
                src={maddadLogo}
                alt="Maddad"
                className="h-full w-full object-cover scale-[1.35] origin-center"
              />
            </div>
            <span className="font-serif font-semibold text-foreground">Maddad</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Checkmark */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              JazakAllah Khayran
            </h1>
            <p className="text-muted-foreground">
              Your donation of{" "}
              <span className="font-semibold text-foreground">
                ${donationAmount.toFixed(2)}
              </span>{" "}
              has been sent to{" "}
              <span className="font-medium text-foreground">{campaignTitle}</span>.
            </p>
          </div>

          {/* Tip thank-you */}
          {tipAmount > 0 && (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3">
              <Heart className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-foreground text-left">
                Thank you for supporting Maddad with{" "}
                <span className="font-semibold">${tipAmount.toFixed(2)}</span>.
                This keeps the platform running.
              </p>
            </div>
          )}

          {/* Receipt info */}
          <div className="bg-card border border-border rounded-xl p-5 text-left space-y-3">
            {email && (
              <p className="text-sm text-muted-foreground">
                Your receipt will arrive at{" "}
                <span className="font-medium text-foreground">{email}</span> shortly.
              </p>
            )}
            {receiptId && (
              <p className="text-xs text-muted-foreground">
                Receipt #{receiptId}
              </p>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link to="/my-giving">View my giving</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/explore">Explore more causes</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
