import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, CheckCircle, Mail, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { addUpdateSubscription } from "@/hooks/useVerificationStore";

interface UpdatesSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  campaignTitle: string;
}

export function UpdatesSubscriptionDialog({
  open,
  onOpenChange,
  campaignId,
  campaignTitle,
}: UpdatesSubscriptionDialogProps) {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = () => {
    if (!email && !whatsapp) return;

    addUpdateSubscription({
      id: `sub-${Date.now()}`,
      campaignId,
      email: email || undefined,
      whatsapp: whatsapp || undefined,
      subscribedAt: new Date().toISOString(),
    });

    setSubmitted(true);
    toast({
      title: "Subscribed",
      description: "You'll receive updates for this campaign.",
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
      setWhatsapp("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Subscribed!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              You'll receive milestone updates for this campaign. No spam, ever.
            </p>
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="font-serif text-xl">
                Get Campaign Updates
              </DialogTitle>
              <DialogDescription>
                Receive milestone updates for "{campaignTitle}"
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail size={14} />
                  Email (optional)
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone size={14} />
                  WhatsApp (optional)
                </label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Provide at least one to subscribe. We'll only send campaign milestone updates — no marketing.
              </p>
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={!email && !whatsapp}
              className="w-full"
            >
              <Bell size={14} />
              Subscribe to Updates
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
