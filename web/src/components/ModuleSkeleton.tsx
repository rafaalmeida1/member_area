import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ModuleSkeleton() {
  return (
    <Card className="group hover:shadow-elegant transition-all duration-500 hover:scale-[1.02] bg-card border-border/50 hover:border-primary/30 overflow-hidden">
      {/* Cover Image Skeleton */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <Skeleton className="w-full h-full" />
        
        {/* Content Type Icons Skeleton */}
        <div className="absolute top-3 right-3 flex gap-1">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        
        {/* Module Info Overlay Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Skeleton className="w-16 h-5 mb-2 rounded-full" />
          <Skeleton className="w-3/4 h-6 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-4 h-3" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ModuleSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ModuleSkeleton key={index} />
      ))}
    </div>
  );
} 