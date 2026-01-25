import { Link } from "react-router-dom";
import maddadLogo from "@/assets/maddad-logo.png";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="h-[76px] w-[76px] overflow-hidden flex items-center justify-center flex-shrink-0">
                <img
                  src={maddadLogo}
                  alt="Maddad logo"
                  className="h-full w-full object-cover scale-[1.35] origin-center"
                />
              </div>

              <span className="text-2xl font-serif font-semibold text-foreground leading-tight">Maddad</span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting donors with verified humanitarian needs through transparency and trust.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-foreground mb-5 font-serif">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/explore"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Explore Needs
                </Link>
              </li>
              <li>
                <Link
                  to="/appeals"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Community Appeals
                </Link>
              </li>
              <li>
                <Link
                  to="/verification"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Verification Process
                </Link>
              </li>
              <li>
                <Link
                  to="/impact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Impact Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="font-semibold text-foreground mb-5 font-serif">Trust & Safety</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/transparency"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Transparency
                </Link>
              </li>
              <li>
                <Link
                  to="/verification"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  How We Verify
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold text-foreground mb-5 font-serif">About</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Our Mission
                </Link>
              </li>
              <li>
                <Link
                  to="/partners"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Partners
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-subtle my-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2024 Maddad. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Built with trust for the Muslim community</p>
        </div>
      </div>
    </footer>
  );
}
