"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex items-center gap-1 rounded-md bg-surface-2 p-1 border border-border", className)}
    >
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        "rounded-[6px] px-3.5 py-1.5 text-sm font-medium text-muted transition-colors",
        "data-[state=active]:bg-surface-3 data-[state=active]:text-paper"
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export const TabsContent = TabsPrimitive.Content;
