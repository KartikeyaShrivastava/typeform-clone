"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;

export function SelectTrigger({
  children,
  className,
  placeholder,
}: {
  children?: React.ReactNode;
  className?: string;
  placeholder?: string;
}) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-12 w-full items-center justify-between rounded-md border border-border bg-surface px-4 text-base text-paper",
        "outline-none focus:border-ember/60",
        className
      )}
    >
      <SelectPrimitive.Value placeholder={placeholder} />
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 text-muted" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className="z-50 max-h-72 min-w-[--radix-select-trigger-width] overflow-hidden rounded-md border border-border bg-surface-2 shadow-pop"
        position="popper"
        sideOffset={6}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2.5 pr-8 text-sm text-paper outline-none hover:bg-surface-3 focus:bg-surface-3"
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2.5">
        <Check className="h-4 w-4 text-ember" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
