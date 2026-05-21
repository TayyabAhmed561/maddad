import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // True after a successful signup where email confirmation is required.
  // Switches the bottom message area from "coming soon" to "check your email."
  const [emailConfirmRequired, setEmailConfirmRequired] = useState(false);

  const { signUp, session, isLoading } = useAuth();
  const navigate = useNavigate();

  // If email confirmation is disabled in the Supabase dashboard, the session
  // becomes active immediately after signup. Redirect when that happens.
  useEffect(() => {
    if (!isLoading && session && !emailConfirmRequired) {
      navigate("/my-giving", { replace: true });
    }
  }, [session, isLoading, emailConfirmRequired, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailConfirmRequired(false);
    setIsSubmitting(true);

    const { error: signUpError, emailConfirmRequired: confirmRequired } =
      await signUp(email, password, name);

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    if (confirmRequired) {
      // Session is not active yet — user must confirm email first.
      // Do not navigate. Show the confirmation message in the UI.
      setEmailConfirmRequired(true);
    }
    // If !confirmRequired, the useEffect above handles the redirect.
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Join Maddad and track your giving journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || emailConfirmRequired}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

          {/* Status/error display area — same visual container as the original note.
              Shows: email confirmation prompt, error, or nothing. */}
          {emailConfirmRequired && (
            <div className="bg-muted/50 rounded-lg border border-border px-4 py-3">
              <p className="text-xs text-foreground text-center">
                Check your email to confirm your account. Once confirmed, you can sign in.
              </p>
            </div>
          )}

          {error && !emailConfirmRequired && (
            <div className="bg-muted/50 rounded-lg border border-border px-4 py-3">
              <p className="text-xs text-destructive text-center">{error}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
