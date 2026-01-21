import { cn } from "@/lib/utils";
import { Utensils, Home, Stethoscope, BookOpen, Building2 } from "lucide-react";

export type Category = "food" | "shelter" | "medical" | "education" | "masjid";

interface CategoryTagProps {
  category: Category;
  showIcon?: boolean;
  size?: "sm" | "md";
}

const categoryConfig = {
  food: {
    label: "Food",
    icon: Utensils,
    className: "tag-food",
  },
  shelter: {
    label: "Shelter",
    icon: Home,
    className: "tag-shelter",
  },
  medical: {
    label: "Medical",
    icon: Stethoscope,
    className: "tag-medical",
  },
  education: {
    label: "Education",
    icon: BookOpen,
    className: "tag-education",
  },
  masjid: {
    label: "Masjid",
    icon: Building2,
    className: "tag-masjid",
  },
};

export function CategoryTag({ category, showIcon = true, size = "md" }: CategoryTagProps) {
  const { label, icon: Icon, className } = categoryConfig[category];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium",
        className,
        size === "sm" ? "text-[10px]" : "text-xs"
      )}
    >
      {showIcon && <Icon size={size === "sm" ? 10 : 12} />}
      <span>{label}</span>
    </span>
  );
}
