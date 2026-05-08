export default function Loading() {
  return (
    <div className="space-y-6 flex flex-col h-full animate-pulse">
      <div>
        <div className="h-8 bg-muted rounded-md w-48 mb-2" />
        <div className="h-4 bg-muted rounded-md w-80" />
      </div>

      <div className="relative max-w-md">
        <div className="h-12 bg-muted rounded-xl w-full" />
      </div>

      <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl flex-1 overflow-hidden shadow-lg p-6 space-y-4">
        {/* Table header skeleton */}
        <div className="grid grid-cols-8 gap-4 border-b border-border/40 pb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded w-3/4" />
          ))}
        </div>
        
        {/* Table row skeletons */}
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-8 gap-4 py-4 border-b border-border/20">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded-full w-1/2" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-6 bg-muted rounded-full w-1/3" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
