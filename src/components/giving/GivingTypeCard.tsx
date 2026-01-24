import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowRight, LucideIcon } from "lucide-react";
import React from "react";

interface GivingTypeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  seasonal?: boolean;
  seasonLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function GivingTypeCard({
  title,
  description,
  icon: Icon,
  href,
  seasonal = false,
  seasonLabel,
  className,
  style
}: GivingTypeCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group block bg-card rounded-xl border border-border p-6 md:p-8",
        "transition-all duration-500 ease-out card-interactive",
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
          <Icon size={24} className="text-primary" />
        </div>
        {seasonal && seasonLabel && (
          <span className="px-3 py-1 rounded-full text-xs font-medium gold-highlight text-accent-foreground">
            {seasonLabel}
          </span>
        )}
      </div>
      
      <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
        {description}
      </p>
      
      <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all duration-300">
        <span>Learn more</span>
        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
