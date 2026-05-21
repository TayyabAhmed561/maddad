import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

interface DonationPaymentStepProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

// Inner component — must live inside <Elements> to use Stripe hooks
function PaymentForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      // Redirect only when required (e.g. 3DS). For cards it resolves inline.
      redirect: "if_required",
      confirmParams: {
        return_url: window.location.href,
      },
    });

    setIsProcessing(false);

    if (error) {
      const msg = error.message ?? "Payment failed. Please try again.";
      setErrorMessage(msg);
      onError(msg);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Lock size={16} />
            Pay now
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Secured by Stripe. Supports cards, Apple Pay, and Google Pay.
      </p>
    </form>
  );
}

// Outer component — provides the Elements context with the Payment Intent secret
export function DonationPaymentStep({
  clientSecret,
  onSuccess,
  onError,
}: DonationPaymentStepProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            fontFamily: "inherit",
            borderRadius: "8px",
          },
        },
      }}
    >
      <PaymentForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
