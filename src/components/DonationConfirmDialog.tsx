import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Receipt, TrendingUp, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import type { DonationReceipt } from "@/types/receipt";

interface DonationConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: DonationReceipt | null;
  /** Path to navigate for impact tracking (e.g. /appeals/1) */
  trackingPath?: string;
}

export function DonationConfirmDialog({
  open,
  onOpenChange,
  receipt,
  trackingPath,
}: DonationConfirmDialogProps) {
  const navigate = useNavigate();

  if (!receipt) return null;

  const handleTrackImpact = () => {
    onOpenChange(false);
    if (trackingPath) {
      navigate(`${trackingPath}#impact-timeline`);
    }
  };

  const handleViewReceipt = () => {
    onOpenChange(false);
    navigate(`/receipt/${receipt.receiptId}`);
  };

  const handleCopyReceiptId = () => {
    navigator.clipboard.writeText(receipt.receiptId);
    toast({ title: "Copied", description: "Receipt ID copied to clipboard" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-9 h-9 text-primary" />
          </div>
          <DialogTitle className="font-serif text-2xl">
            JazakAllah Khair
          </DialogTitle>
          <DialogDescription className="text-base">
            Your donation has been confirmed
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Amount */}
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">
              ${receipt.amount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {receipt.campaignTitle}
            </p>
          </div>

          {/* Receipt ID */}
          <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Receipt ID</p>
              <p className="text-sm font-mono font-medium text-foreground">
                {receipt.receiptId}
              </p>
            </div>
            <button
              onClick={handleCopyReceiptId}
              className="p-2 rounded-md hover:bg-background transition-colors"
            >
              <Copy className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium text-foreground">
                {new Date(receipt.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium text-foreground capitalize">
                {receipt.donationType || "General"}
              </p>
            </div>
          </div>

          {receipt.isAnonymous && (
            <p className="text-xs text-muted-foreground text-center">
              Your donation will remain anonymous
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          {trackingPath && (
            <Button onClick={handleTrackImpact} className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              Track Your Impact
            </Button>
          )}
          <Button variant="outline" onClick={handleViewReceipt} className="w-full">
            <Receipt className="w-4 h-4 mr-2" />
            View Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
