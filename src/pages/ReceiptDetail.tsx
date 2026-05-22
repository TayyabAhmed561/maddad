import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/VerificationBadge";
import { getReceiptById } from "@/types/receipt";
import {
  ArrowLeft,
  TrendingUp,
  Copy,
  Download,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ReceiptDetail() {
  const { receiptId } = useParams<{ receiptId: string }>();
  const navigate = useNavigate();
  const receipt = receiptId ? getReceiptById(receiptId) : undefined;

  if (!receipt) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <AlertCircle size={64} className="mx-auto text-muted-foreground mb-4" />
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">
              Receipt Unavailable
            </h1>
            <p className="text-muted-foreground mb-6">
              This receipt could not be found. Receipts are generated after a donation is confirmed — if you completed a donation recently, please allow a moment for it to appear.
            </p>
            <Button onClick={() => navigate("/my-giving")}>
              <ArrowLeft size={16} className="mr-2" />
              My Giving History
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const dateFormatted = new Date(receipt.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeFormatted = new Date(receipt.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const campaignPath = receipt.campaignId
    ? `/appeals/${receipt.campaignId}`
    : receipt.needId
      ? `/need/${receipt.needId}`
      : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(receipt.receiptId);
    toast({ title: "Copied", description: "Receipt ID copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Back */}
          <Link
            to="/my-giving"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to My Giving
          </Link>

          {/* Receipt Card */}
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            {/* Header Band */}
            <div className="bg-primary/5 border-b border-border px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-primary" />
                <h1 className="font-serif text-xl font-semibold text-foreground">
                  Donation Receipt
                </h1>
              </div>
              <VerificationBadge status="verified" />
            </div>

            <div className="p-6 space-y-6">
              {/* Amount */}
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-foreground">
                  ${receipt.amount.toLocaleString()}
                </p>
                <p className="text-muted-foreground mt-2">
                  {receipt.campaignTitle}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <DetailRow label="Receipt ID" mono>
                  <span className="flex items-center gap-2">
                    {receipt.receiptId}
                    <button onClick={handleCopy} className="hover:text-foreground">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </span>
                </DetailRow>
                <DetailRow label="Date">
                  {dateFormatted}
                </DetailRow>
                <DetailRow label="Time">
                  {timeFormatted}
                </DetailRow>
                <DetailRow label="Donation Type">
                  <span className="capitalize">{receipt.donationType || "General"}</span>
                </DetailRow>
                <DetailRow label="Frequency">
                  <span className="capitalize">{receipt.frequency}</span>
                </DetailRow>
                <DetailRow label="Organization">
                  {receipt.organizationName}
                </DetailRow>
                <DetailRow label="Privacy">
                  {receipt.isAnonymous ? "Anonymous" : "Public"}
                  {receipt.hideAmount ? " · Amount hidden" : ""}
                </DetailRow>
              </div>

              {receipt.duaIntention && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Dua / Intention</p>
                  <p className="text-sm text-foreground italic">"{receipt.duaIntention}"</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {campaignPath && (
                  <Button
                    onClick={() => navigate(`${campaignPath}#impact-timeline`)}
                    className="flex-1"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Track Your Impact
                  </Button>
                )}
                <Button variant="outline" className="flex-1" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-muted/30 border-t border-border px-6 py-4">
              <p className="text-xs text-muted-foreground text-center">
                Tax-deductible receipts are issued by the registered organization. Contact them directly for official documentation.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function DetailRow({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="bg-muted/30 rounded-lg px-4 py-3">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-foreground ${mono ? "font-mono" : ""}`}>
        {children}
      </p>
    </div>
  );
}
