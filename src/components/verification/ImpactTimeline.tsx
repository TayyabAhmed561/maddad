import { useState } from "react";
import {
  CheckCircle,
  Banknote,
  Package,
  Loader2,
  Trophy,
  ChevronDown,
  Image,
  Video,
  FileText,
  ExternalLink,
  Hash,
  Bell,
  AlertTriangle,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MilestoneUpdate, MilestoneStage, EvidenceItem } from "@/types/verification";
import { getPublicEvidenceByIds } from "@/data/evidenceData";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { MediaViewerDialog } from "@/components/verification/MediaViewerDialog";

interface ImpactTimelineProps {
  /** Ordered milestone updates */
  milestones: MilestoneUpdate[];
  /** Display tracking ID */
  trackingId: string;
  /** Optional class name */
  className?: string;
  /** Total approved evidence count (for completeness display) */
  approvedEvidenceCount?: number;
  /** Total required evidence count */
  totalEvidenceCount?: number;
  /** Next expected update date (ISO string) — if overdue, shows "Update pending" badge */
  nextUpdateDue?: string;
  /** Callback when user clicks "Get updates" */
  onSubscribeUpdates?: () => void;
}

/** Visual config for each stage */
const stageConfig: Record<
  MilestoneStage,
  { icon: typeof CheckCircle; label: string; activeColor: string }
> = {
  verified: {
    icon: CheckCircle,
    label: "Verified",
    activeColor: "text-verified bg-verified/10 border-verified/30",
  },
  funds_allocated: {
    icon: Banknote,
    label: "Funds Allocated",
    activeColor: "text-trust bg-trust/10 border-trust/30",
  },
  procurement: {
    icon: Package,
    label: "Procurement",
    activeColor: "text-accent bg-accent/10 border-accent/30",
  },
  in_progress: {
    icon: Loader2,
    label: "In Progress",
    activeColor: "text-primary bg-primary/10 border-primary/30",
  },
  completed: {
    icon: Trophy,
    label: "Completed",
    activeColor: "text-verified bg-verified/10 border-verified/30",
  },
};

/** All stages in order */
const allStages: MilestoneStage[] = [
  "verified",
  "funds_allocated",
  "procurement",
  "in_progress",
  "completed",
];

/** Media kind icon helper */
function MediaKindIcon({ kind }: { kind: EvidenceItem["media"]["kind"] }) {
  switch (kind) {
    case "image":
      return <Image size={12} />;
    case "video":
      return <Video size={12} />;
    case "pdf":
      return <FileText size={12} />;
    case "link":
      return <ExternalLink size={12} />;
  }
}

/** Single milestone row */
function MilestoneRow({
  milestone,
  isActive,
  isFuture,
  isLast,
  onViewMedia,
}: {
  milestone?: MilestoneUpdate;
  stage: MilestoneStage;
  isActive: boolean;
  isFuture: boolean;
  isLast: boolean;
  onViewMedia: (item: EvidenceItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const stage = milestone?.stage ?? "verified";
  const config = stageConfig[stage];
  const Icon = config.icon;
  const evidence = milestone ? getPublicEvidenceByIds(milestone.evidenceIds) : [];

  return (
    <div className="flex gap-4">
      {/* Timeline rail */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
            isActive && config.activeColor,
            isFuture && "border-border bg-muted text-muted-foreground",
            !isActive && !isFuture && config.activeColor
          )}
        >
          <Icon size={14} className={isFuture ? "text-muted-foreground" : undefined} />
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 min-h-[24px]",
              isFuture ? "bg-border" : "bg-primary/20"
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
        <div className="flex items-center gap-2 mb-1">
          <h4
            className={cn(
              "text-sm font-semibold",
              isFuture ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {config.label}
          </h4>
          {isActive && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
              Current
            </span>
          )}
        </div>

        {milestone ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="text-xs text-muted-foreground mb-1">
              {new Date(milestone.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              {milestone.summary}
            </p>

            {evidence.length > 0 && (
              <>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
                  <span>View {evidence.length} evidence item{evidence.length > 1 ? "s" : ""}</span>
                  <ChevronDown
                    size={12}
                    className={cn(
                      "transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-3 space-y-2">
                  {evidence.map((item) => {
                    const isViewable = item.media.kind === "image" || item.media.kind === "video";
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg transition-colors",
                          isViewable && "cursor-pointer hover:bg-primary/10"
                        )}
                        onClick={() => isViewable && onViewMedia(item)}
                        role={isViewable ? "button" : undefined}
                        tabIndex={isViewable ? 0 : undefined}
                        onKeyDown={(e) => {
                          if (isViewable && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            onViewMedia(item);
                          }
                        }}
                      >
                        {/* Thumbnail */}
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden relative">
                          {item.media.kind === "image" ? (
                            <img
                              src={item.media.url}
                              alt={item.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : item.media.kind === "video" && item.media.thumbnailUrl ? (
                            <>
                              <img
                                src={item.media.thumbnailUrl}
                                alt={item.title}
                                className="w-full h-full object-cover rounded"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
                                <Play size={10} className="text-white" fill="white" />
                              </div>
                            </>
                          ) : (
                            <MediaKindIcon kind={item.media.kind} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <MediaKindIcon kind={item.media.kind} />
                            {item.media.kind.toUpperCase()}
                            {isViewable && (
                              <span className="text-primary ml-1">· Click to view</span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </>
            )}
          </Collapsible>
        ) : (
          <p className="text-xs text-muted-foreground italic">Awaiting update</p>
        )}
      </div>
    </div>
  );
}

export function ImpactTimeline({
  milestones,
  trackingId,
  className,
  approvedEvidenceCount,
  totalEvidenceCount,
  nextUpdateDue,
  onSubscribeUpdates,
}: ImpactTimelineProps) {
  // Build a map of stage → milestone
  const milestoneMap = new Map<MilestoneStage, MilestoneUpdate>();
  milestones.forEach((m) => milestoneMap.set(m.stage, m));

  // Find the latest active stage
  const activeStageIndex = allStages.reduce((latest, stage, index) => {
    return milestoneMap.has(stage) ? index : latest;
  }, -1);

  // Check if update is overdue
  const isOverdue = nextUpdateDue
    ? new Date(nextUpdateDue) < new Date()
    : false;

  // Media viewer state
  const [viewerMedia, setViewerMedia] = useState<EvidenceItem | null>(null);

  const handleViewMedia = (item: EvidenceItem) => {
    setViewerMedia(item);
  };

  return (
    <div id="impact-timeline" className={cn("space-y-0 scroll-mt-24", className)}>
      {/* Header with tracking ID */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-primary" />
          <h3 className="font-serif text-xl font-semibold text-foreground">
            Impact Tracking
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-mono text-muted-foreground">
          <Hash size={12} />
          {trackingId}
        </div>
      </div>

      {/* Metadata bar: proof completeness + update status */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {approvedEvidenceCount !== undefined && totalEvidenceCount !== undefined && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
            <CheckCircle size={12} />
            {approvedEvidenceCount} of {totalEvidenceCount} evidence approved
          </span>
        )}

        {nextUpdateDue && (
          isOverdue ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle size={12} />
              Update pending
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
              Next update due {new Date(nextUpdateDue).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )
        )}

        {onSubscribeUpdates && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSubscribeUpdates}
            className="text-xs h-7 gap-1"
          >
            <Bell size={12} />
            Get updates
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="pl-1">
        {allStages.map((stage, index) => {
          const milestone = milestoneMap.get(stage);
          const isActive = index === activeStageIndex;
          const isFuture = index > activeStageIndex;
          const isLast = index === allStages.length - 1;

          return (
            <MilestoneRow
              key={stage}
              stage={stage}
              milestone={milestone}
              isActive={isActive}
              isFuture={isFuture}
              isLast={isLast}
              onViewMedia={handleViewMedia}
            />
          );
        })}
      </div>

      {/* Media viewer dialog */}
      <MediaViewerDialog
        open={!!viewerMedia}
        onOpenChange={(open) => !open && setViewerMedia(null)}
        media={viewerMedia?.media ?? null}
        title={viewerMedia?.title}
      />
    </div>
  );
}
