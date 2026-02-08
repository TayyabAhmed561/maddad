import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: {
    kind: "image" | "video" | "pdf" | "link";
    url: string;
    thumbnailUrl?: string;
  } | null;
  title?: string;
}

export function MediaViewerDialog({
  open,
  onOpenChange,
  media,
  title,
}: MediaViewerDialogProps) {
  if (!media) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-3xl w-[95vw] p-0 overflow-hidden bg-black/95 border-border",
          "flex flex-col items-center justify-center"
        )}
      >
        {/* Header */}
        {title && (
          <div className="w-full px-4 py-3 bg-card border-b border-border">
            <p className="text-sm font-medium text-foreground truncate pr-8">
              {title}
            </p>
          </div>
        )}

        {/* Media content */}
        <div className="flex items-center justify-center w-full min-h-[300px] max-h-[80vh]">
          {media.kind === "image" && (
            <img
              src={media.url}
              alt={title || "Evidence"}
              className="max-w-full max-h-[75vh] object-contain"
            />
          )}

          {media.kind === "video" && (
            <video
              src={media.url}
              controls
              autoPlay
              className="max-w-full max-h-[75vh]"
              poster={media.thumbnailUrl}
            >
              Your browser does not support the video tag.
            </video>
          )}

          {media.kind === "pdf" && (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <p className="text-sm text-white/80">
                PDF document available for download
              </p>
              <a
                href={media.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Open PDF
              </a>
            </div>
          )}

          {media.kind === "link" && (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <p className="text-sm text-white/80">External link</p>
              <a
                href={media.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Open Link
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
