export function ProgressBar({
  current,
  total,
  color,
}: {
  current: number;
  total: number;
  color?: string;
}) {
  const pct = total > 0 ? Math.min(100, ((current + 1) / total) * 100) : 0;
  return (
    <div className="h-[3px] w-full bg-surface-2">
      <div
        className="h-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color ?? "#FF6B45" }}
      />
    </div>
  );
}
