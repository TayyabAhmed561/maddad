import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import {
  Heart,
  Share2,
  Sparkles,
  Check,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function SupportMaddad() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setIsSubmitting(true);
    setWaitlistError(null);
    const { error: dbError } = await supabase
      .from("maddad_waitlist")
      .insert({ email: trimmed, source: "support-page" });
    setIsSubmitting(false);
    if (dbError) {
      if (dbError.code === "23505") {
        setIsSubmitted(true); // already on waitlist — treat as success
      } else {
        setWaitlistError("Something went wrong. Please try again.");
      }
    } else {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl">
              <h1 className="heading-display text-4xl md:text-5xl text-foreground mb-6">
                Maddad is free — and always will be
              </h1>
              <p className="text-xl text-muted-foreground text-body max-w-2xl">
                Every dollar you donate goes directly to the cause. We keep the lights on
                through voluntary tips and the generosity of our community.
              </p>
            </div>
          </div>
        </section>

        {/* How we sustain ourselves */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-10">
            How we sustain ourselves
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                <Heart size={22} className="text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                Tip when you donate
              </h3>
              <p className="text-sm text-muted-foreground">
                Quick and optional. Most donors who tip choose 10%. It appears as a
                dedicated step in checkout — skip it anytime with one tap, no pressure.
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                <Share2 size={22} className="text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                Tell a friend
              </h3>
              <p className="text-sm text-muted-foreground">
                The best thing you can do is share Maddad with someone who cares.
                Every new donor who finds us through a friend is how we grow.
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 relative">
              <div className="absolute top-4 right-4">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent-light text-accent-foreground">
                  Coming soon
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                <Sparkles size={22} className="text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                Maddad Pro
              </h3>
              <p className="text-sm text-muted-foreground">
                A subscription with perks for donors who want more.
                Join the waitlist below.
              </p>
            </div>
          </div>
        </section>

        {/* Pro features + waitlist */}
        <section className="bg-card border-y border-border">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-start">

                {/* Pro feature list */}
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-accent-light text-accent-foreground mb-6">
                    <Sparkles size={12} />
                    Maddad Pro — Coming soon
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    For donors who want more
                  </h2>
                  <p className="text-muted-foreground text-sm mb-8">
                    CAD $8/month or $72/year (save 25%)
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Annual giving summary (PDF, tax-ready)",
                      "Giving streak tracking + milestone badges",
                      "Early access to Ramadan and Dhul Hijjah campaigns",
                      "Priority support from our team",
                      '"Pro supporter" badge on your public donor profile',
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check size={16} className="text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Waitlist signup */}
                <div className="bg-background rounded-xl border border-border p-6">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                    Join the waitlist
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    We'll reach out when Maddad Pro launches. One email, ever.
                  </p>
                  {isSubmitted ? (
                    <div className="flex items-start gap-3 bg-primary-light rounded-lg p-4">
                      <Check size={16} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">You're on the list</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          We'll reach out when Pro launches.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleJoinWaitlist} className="space-y-3">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      {waitlistError && (
                        <p className="text-sm text-destructive">{waitlistError}</p>
                      )}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting || !email.trim()}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Joining…
                          </>
                        ) : (
                          <>
                            Join waitlist
                            <ArrowRight size={16} />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
