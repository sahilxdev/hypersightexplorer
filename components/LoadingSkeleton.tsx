'use client';

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card p-5 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-secondary rounded-md"></div>
              <div className="h-6 bg-secondary rounded w-16"></div>
            </div>
            <div className="h-6 bg-secondary rounded-full w-16"></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-secondary rounded w-16"></div>
              <div className="h-4 bg-secondary rounded w-20"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-secondary rounded w-24"></div>
              <div className="h-4 bg-secondary rounded w-16"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-secondary rounded w-20"></div>
              <div className="h-4 bg-secondary rounded w-16"></div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="h-4 bg-secondary rounded w-32"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}