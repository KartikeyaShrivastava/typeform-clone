"use client";

import * as Toast from "@radix-ui/react-toast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const icons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="h-4 w-4 text-periwinkle" />,
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  error: <XCircle className="h-4 w-4 text-danger" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
  }, []);

  const remove = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toast.Provider swipeDirection="right" duration={3600}>
        {children}
        {items.map((item) => (
          <Toast.Root
            key={item.id}
            onOpenChange={(open) => !open && remove(item.id)}
            className={cn(
              "group flex items-start gap-3 rounded-md border border-border bg-surface-2 px-4 py-3 shadow-pop",
              "data-[state=open]:animate-fade-up data-[swipe=end]:animate-none"
            )}
          >
            <div className="mt-0.5 shrink-0">{icons[item.variant]}</div>
            <div className="flex-1">
              <Toast.Title className="text-sm font-medium text-paper">{item.title}</Toast.Title>
              {item.description && (
                <Toast.Description className="mt-0.5 text-xs text-muted">
                  {item.description}
                </Toast.Description>
              )}
            </div>
            <Toast.Close aria-label="Dismiss" className="text-muted-2 hover:text-muted">
              <X className="h-3.5 w-3.5" />
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-0 right-0 z-[100] m-4 flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
