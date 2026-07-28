export default function SkeletonLoader({ count = 3, height = "h-24" }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`${height} bg-surface-hover rounded-xl animate-pulse`} />
      ))}
    </div>
  );
}
