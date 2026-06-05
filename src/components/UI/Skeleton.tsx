import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * A pulsing placeholder shown while data is loading.
 * Pass a className to size it (and recolor it, e.g. bg-white/20 on dark areas).
 *
 * Usage:
 *   {loading ? <Skeleton className="h-8 w-16" /> : <span>{value}</span>}
 */
export const Skeleton = ({ className }: SkeletonProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "inline-block align-middle animate-pulse rounded bg-gray-200",
      className
    )}
  />
);
