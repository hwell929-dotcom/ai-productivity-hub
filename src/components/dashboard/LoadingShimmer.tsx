export function LoadingShimmer({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="shimmer h-3 rounded"
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
