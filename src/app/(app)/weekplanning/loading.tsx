import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="-m-6 h-[calc(100%+3rem)] flex flex-col">
      {/* Week navigation header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Day headers */}
      <div className="flex border-b border-border">
        <div className="w-48 shrink-0 border-r border-border p-3">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex flex-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-border p-3 last:border-r-0"
            >
              <Skeleton className="h-4 w-12 mb-1" />
              <Skeleton className="h-6 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Employee rows */}
      <div className="flex-1 overflow-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex border-b border-border">
            {/* Employee info */}
            <div className="w-48 shrink-0 border-r border-border p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
            {/* Day cells */}
            <div className="flex flex-1">
              {Array.from({ length: 7 }).map((_, j) => (
                <div
                  key={j}
                  className="flex-1 border-r border-border p-2 last:border-r-0"
                >
                  <Skeleton className="h-8 w-full rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
