import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "muted" | "ember";
  className?: string;
}) {
  const styles = {
    default: "bg-surface-3 text-muted border-border",
    success: "bg-success/10 text-success border-success/30",
    muted: "bg-surface-2 text-muted-2 border-border-soft",
    ember: "bg-ember/10 text-ember border-ember/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
