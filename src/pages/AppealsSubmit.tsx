import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Mail, Users } from "lucide-react";

export default function AppealsSubmit() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Users size={28} className="text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground mb-3">
            Community Appeals — Coming Soon
          </h1>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Our self-serve community appeals submission is in development.
            Appeals require endorsement from a masjid or trusted community contact
            to ensure accountability.
          </p>
          <p className="text-muted-foreground mb-8">
            In the meantime, email us at{" "}
            <a
              href="mailto:appeals@maddad.ca"
              className="text-primary font-medium hover:underline"
            >
              appeals@maddad.ca
            </a>{" "}
            and we&apos;ll help you get started.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="mailto:appeals@maddad.ca">
              <Button className="gap-2">
                <Mail size={16} />
                Email us
              </Button>
            </a>
            <Link to="/appeals">
              <Button variant="outline">Browse appeals</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
