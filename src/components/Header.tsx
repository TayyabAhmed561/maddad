import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import maddadLogo from "@/assets/maddad-logo.png";

const navLinks = [
  { href: "/explore", label: "Explore Needs" },
  { href: "/giving", label: "Giving" },
  { href: "/appeals", label: "Community Appeals" },
  { href: "/verification", label: "Verification" },
  { href: "/impact", label: "Impact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo Lockup */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer flex-shrink-0">
            <div className="h-[60px] w-[60px] overflow-hidden flex items-center justify-center">
              <img
                src={maddadLogo}
                alt="Maddad logo"
                className="h-full w-full object-cover scale-[1.45] origin-center"
              />
            </div>

            <span className="text-2xl font-serif font-semibold text-foreground leading-none">Maddad</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.href || (link.href !== "/" && location.pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/my-giving">
              <Button variant="ghost" size="sm">
                My Giving
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/explore">
              <Button size="sm">Donate Now</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-lg hover:bg-secondary transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-5 border-t border-border animate-fade-in-up">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.href || (link.href !== "/" && location.pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col gap-2 mt-5 px-4">
              <Link to="/my-giving" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full">
                  My Giving
                </Button>
              </Link>
              <div className="flex gap-3">
              <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/explore" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Donate Now</Button>
              </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
