import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  className?: string;
}

export function NeedCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn("bg-card rounded-xl p-6 border border-border", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Location */}
      <Skeleton className="h-4 w-1/3 mb-5" />

      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function AppealCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn("bg-card rounded-xl border border-border p-7", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex-1">
          <Skeleton className="h-6 w-24 rounded-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>

      {/* Endorsement Badge */}
      <Skeleton className="h-8 w-48 rounded-full mb-5" />

      {/* Description */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-5" />

      {/* Location & Zakat */}
      <div className="flex items-center gap-5 mb-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <section className="section-warm py-12 md:py-16">
        <div className="container max-w-6xl mx-auto px-4 md:px-6">
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <Skeleton className="h-4 w-1/4 mb-8" />
          <div className="max-w-md">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="py-12 md:py-16">
        <div className="container max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div>
                <Skeleton className="h-8 w-32 mb-4" />
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              </div>
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
