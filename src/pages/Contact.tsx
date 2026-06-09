import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { submitContactMessage } from "@/lib/queries/contact";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitize";

const SUBJECTS = [
  "General question",
  "Organization inquiry",
  "Report an issue",
  "Other",
];

const CONTACT_CARDS = [
  { label: "General", email: "hello@maddad.ca" },
  { label: "Organizations", email: "partners@maddad.ca" },
  { label: "Privacy", email: "privacy@maddad.ca" },
];

export default function Contact() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError]     = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const ok = await submitContactMessage({
      name:    sanitizeText(name, 200),
      email:   sanitizeEmail(email),
      subject: sanitizeText(subject, 200),
      message: sanitizeText(message, 2000),
    });
    setSubmitting(false);
    if (!ok) {
      setError("Something went wrong. Please email us directly at hello@maddad.ca.");
    } else {
      setDone(true);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="section-spacing-sm">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="heading-display text-4xl text-foreground mb-3">Get in touch</h1>
            <p className="text-muted-foreground mb-12">
              We&apos;d love to hear from you. We typically reply within 2 business days.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Contact cards */}
              <div className="space-y-4">
                {CONTACT_CARDS.map(({ label, email: e }) => (
                  <div key={e} className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">
                      {label}
                    </p>
                    <a
                      href={`mailto:${e}`}
                      className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5"
                    >
                      <Mail size={13} />
                      {e}
                    </a>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="md:col-span-2">
                {done ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                      <CheckCircle size={28} className="text-primary" />
                    </div>
                    <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                      Message sent
                    </h2>
                    <p className="text-muted-foreground">
                      JazakAllah Khayran. We&apos;ll be in touch within 2 business days.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="bg-card border border-border rounded-xl p-6 space-y-5"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Email <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          type="email"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Subject <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select a subject…</option>
                        {SUBJECTS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="How can we help?"
                        rows={5}
                        className="w-full rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-2" />
                          Sending…
                        </>
                      ) : (
                        "Send message"
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
