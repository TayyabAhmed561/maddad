import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Heart size={20} className="text-primary-foreground fill-current" />
              </div>
              <span className="text-xl font-semibold text-foreground">Maddad</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting donors with verified humanitarian needs through transparency and trust.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Explore Needs
                </Link>
              </li>
              <li>
                <Link to="/appeals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Community Appeals
                </Link>
              </li>
              <li>
                <Link to="/verification" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Verification Process
                </Link>
              </li>
              <li>
                <Link to="/impact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Impact Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Trust & Safety</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/transparency" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Transparency
                </Link>
              </li>
              <li>
                <Link to="/verification" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How We Verify
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Partners
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Maddad. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with trust for the Muslim community
          </p>
        </div>
      </div>
    </footer>
  );
}
