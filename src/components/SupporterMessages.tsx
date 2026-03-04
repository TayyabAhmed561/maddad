import { Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupporterMessage } from "@/types/platform";

interface SupporterMessagesProps {
  messages: SupporterMessage[];
  className?: string;
}

export function SupporterMessages({ messages, className }: SupporterMessagesProps) {
  if (!messages || messages.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 text-primary" />
        <h2 className="heading-section text-xl text-foreground">Supporter Messages</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Duas and encouragement from the community.
      </p>

      <div className="space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-card rounded-lg border border-border p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {msg.isAnonymous ? "Anonymous Supporter" : msg.donorName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {msg.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{msg.message}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
