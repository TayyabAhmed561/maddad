import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Clock,
  Image,
  Video,
  FileText,
  ExternalLink,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvidenceItem, VerificationChecklist } from "@/types/verification";
import { getPublicEvidenceByIds } from "@/data/evidenceData";

interface ProofPackProps {
  /** All evidence IDs related to this entity */
  evidenceIds: string[];
  /** Verification checklist for status summary */
  checklist: VerificationChecklist;
  /** Optional class name */
  className?: string;
}

/** Icon for each media kind */
function MediaIcon({ kind }: { kind: EvidenceItem["media"]["kind"] }) {
  switch (kind) {
    case "image":
      return <Image size={14} className="text-trust" />;
    case "video":
      return <Video size={14} className="text-trust" />;
    case "pdf":
      return <FileText size={14} className="text-accent" />;
    case "link":
      return <ExternalLink size={14} className="text-muted-foreground" />;
  }
}

/** Status indicator dot */
function StatusDot({ status }: { status: EvidenceItem["status"] }) {
  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full shrink-0",
        status === "approved" && "bg-verified",
        status === "pending" && "bg-pending",
        status === "rejected" && "bg-destructive"
      )}
    />
  );
}

/** Single evidence card */
function EvidenceCard({ item }: { item: EvidenceItem }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 flex gap-4 items-start">
      {/* Thumbnail / icon area */}
      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        {item.media.kind === "image" ? (
          <img
            src={item.media.url}
            alt={item.title}
            className="w-full h-full object-cover rounded-md"
          />
        ) : item.media.kind === "video" && item.media.thumbnailUrl ? (
          <img
            src={item.media.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <MediaIcon kind={item.media.kind} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <StatusDot status={item.status} />
          <h4 className="text-sm font-medium text-foreground truncate">
            {item.title}
          </h4>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {item.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MediaIcon kind={item.media.kind} />
            {item.media.kind.toUpperCase()}
          </span>
          <span>{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}

/** Checklist summary header */
function ChecklistSummary({ checklist }: { checklist: VerificationChecklist }) {
  const isComplete = checklist.completionPercent === 100;

  return (
    <div className="bg-card rounded-xl border border-border p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className={isComplete ? "text-verified" : "text-pending"} />
          <h4 className="text-sm font-semibold text-foreground">
            Verification Status
          </h4>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {checklist.completionPercent}% complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isComplete ? "bg-verified" : "bg-pending"
          )}
          style={{ width: `${checklist.completionPercent}%` }}
        />
      </div>

      {/* Required evidence checklist */}
      <div className="space-y-2">
        {checklist.requiredEvidenceTypes.map((type) => {
          const isApproved = checklist.approvedEvidenceTypes.includes(type);
          return (
            <div key={type} className="flex items-center gap-2 text-xs">
              {isApproved ? (
                <CheckCircle size={14} className="text-verified shrink-0" />
              ) : (
                <Clock size={14} className="text-pending shrink-0" />
              )}
              <span className={cn(
                "capitalize",
                isApproved ? "text-foreground" : "text-muted-foreground"
              )}>
                {type.replace(/_/g, " ")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Last verified */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
        <Eye size={12} />
        <span>
          Last verified on{" "}
          {new Date(checklist.lastVerifiedDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}{" "}
          by {checklist.verifierDisplayName}
        </span>
      </div>
    </div>
  );
}

export function ProofPack({ evidenceIds, checklist, className }: ProofPackProps) {
  const allPublicEvidence = getPublicEvidenceByIds(evidenceIds);

  // Split evidence into "before" (org + campaign) and "after" (milestone) groups
  const beforeEvidence = allPublicEvidence.filter(
    (e) => e.type.startsWith("org_") || e.type.startsWith("campaign_")
  );
  const afterEvidence = allPublicEvidence.filter((e) =>
    e.type.startsWith("milestone_")
  );

  const [activeTab, setActiveTab] = useState("before");

  return (
    <div className={cn("space-y-0", className)}>
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={20} className="text-primary" />
        <h3 className="font-serif text-xl font-semibold text-foreground">
          Proof & Verification
        </h3>
      </div>

      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium rounded-full bg-accent-light text-accent-foreground mb-4">
        Guided Estimate
      </span>

      <ChecklistSummary checklist={checklist} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="before" className="text-xs">
            Before You Give
          </TabsTrigger>
          <TabsTrigger value="after" className="text-xs">
            After You Give
          </TabsTrigger>
        </TabsList>

        <TabsContent value="before">
          {beforeEvidence.length > 0 ? (
            <div className="space-y-3">
              {beforeEvidence.map((item) => (
                <EvidenceCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No pre-donation evidence available yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="after">
          {afterEvidence.length > 0 ? (
            <div className="space-y-3">
              {afterEvidence.map((item) => (
                <EvidenceCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Milestone updates will appear here once your donation is being tracked.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
