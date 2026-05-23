import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import maddadLogo from "@/assets/maddad-logo.png";

const navLinks = [
  { href: "/explore", label: "Explore Needs" },
  { href: "/giving", label: "Giving" },
  { href: "/appeals", label: "Community Appeals" },
  { href: "/verification", label: "Verification" },
  { href: "/impact", label: "Impact" },
];

function getInitials(name: string | null | undefined): string | null {
  if (!name?.trim()) return null;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, session, isLoading, signOut } = useAuth();

  const isAuthenticated = !isLoading && !!session;

  useEffect(() => {
    if (!user?.id) {
      setDisplayName(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("donors")
      .select("display_name, full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setDisplayName(data?.display_name ?? data?.full_name ?? null);
        }
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  const initials = getInitials(displayName);
  const labelText = displayName ?? user?.email ?? "";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
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
                location.pathname === link.href ||
                (link.href !== "/" && location.pathname.startsWith(link.href));
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
            <Link
              to="/partners"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 px-2"
            >
              For organizations
            </Link>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label="Account menu"
                  >
                    {initials ?? <User size={16} />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-medium text-foreground truncate">{labelText}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/my-giving" className="flex items-center gap-2 cursor-pointer">
                      <Heart size={14} />
                      My Giving
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
            )}
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
                  location.pathname === link.href ||
                  (link.href !== "/" && location.pathname.startsWith(link.href));
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
              {isAuthenticated ? (
                <>
                  {/* Identity row */}
                  <div className="flex items-center gap-3 px-1 py-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {initials ?? <User size={14} />}
                    </div>
                    <span className="text-sm font-medium text-foreground truncate">{labelText}</span>
                  </div>
                  <Link to="/my-giving" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Heart size={14} />
                      My Giving
                    </Button>
                  </Link>
                  <div className="flex gap-3 mt-1">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </Button>
                    <Link to="/explore" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Donate Now</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/explore" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Donate Now</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
