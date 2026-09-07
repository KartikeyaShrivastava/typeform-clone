"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveState = "idle" | "saving" | "saved";

export function SaveStatus({ state }: { state: SaveState }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs transition-opacity",
        state === "idle" ? "opacity-0" : "opacity-100",
        state === "saved" ? "text-success" : "text-muted-2"
      )}
    >
      {state === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" /> Saving…
        </>
      )}
      {state === "saved" && (
        <>
          <Check className="h-3 w-3" /> Saved
        </>
      )}
    </div>
  );
}
