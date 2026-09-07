import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 group", className)}>
      <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-ember text-white">
        <span className="font-display text-sm italic">f</span>
      </span>
      <span className="font-display text-lg tracking-tight text-paper">Formly</span>
    </Link>
  );
}
