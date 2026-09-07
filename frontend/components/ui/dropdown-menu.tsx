"use client";

import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export function DropdownMenuContent({
  children,
  align = "end",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
}) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        sideOffset={6}
        className={cn(
          "z-50 min-w-[180px] rounded-md border border-border bg-surface-2 p-1 shadow-pop",
          "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95",
          className
        )}
      >
        {children}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  children,
  onSelect,
  className,
  destructive,
}: {
  children: React.ReactNode;
  onSelect?: (e: Event) => void;
  className?: string;
  destructive?: boolean;
}) {
  return (
    <DropdownPrimitive.Item
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-paper outline-none",
        "hover:bg-surface-3 focus:bg-surface-3",
        destructive && "text-danger hover:bg-danger/10 focus:bg-danger/10",
        className
      )}
    >
      {children}
    </DropdownPrimitive.Item>
  );
}

export const DropdownMenuSeparator = () => (
  <DropdownPrimitive.Separator className="my-1 h-px bg-border" />
);
