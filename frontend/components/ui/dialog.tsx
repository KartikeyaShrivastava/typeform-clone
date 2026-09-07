"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({
  children,
  className,
  title,
  description,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
          "rounded-lg border border-border bg-surface-2 p-6 shadow-pop",
          "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95",
          className
        )}
      >
        {title && (
          <DialogPrimitive.Title className="font-display text-xl text-paper">{title}</DialogPrimitive.Title>
        )}
        {description && (
          <DialogPrimitive.Description className="mt-1 text-sm text-muted">
            {description}
          </DialogPrimitive.Description>
        )}
        <div className={cn(title || description ? "mt-4" : "")}>{children}</div>
        <DialogPrimitive.Close className="absolute right-4 top-4 text-muted-2 hover:text-paper" aria-label="Close">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
