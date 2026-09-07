"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { QUESTION_TYPES } from "@/lib/question-types";
import type { QuestionType } from "@/lib/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function QuestionTypeList({ onAdd, disabled }: { onAdd: (type: QuestionType) => void; disabled?: boolean }) {
  return (
    <div className="space-y-1">
      {QUESTION_TYPES.map(({ type, label, icon: Icon, hint }) => (
        <button
          key={type}
          disabled={disabled}
          onClick={() => onAdd(type)}
          className="flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-surface-2 disabled:opacity-50"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted group-hover:text-paper">
            <Icon className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm text-paper">{label}</span>
            <span className="block truncate text-[11px] text-muted-2">{hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function TypeSidebar({ onAdd, disabled }: { onAdd: (type: QuestionType) => void; disabled?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border-soft bg-ink/60 p-4 lg:block">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-2">Add a question</p>
        <div className="mt-3">
          <QuestionTypeList onAdd={onAdd} disabled={disabled} />
        </div>
      </aside>

      {/* Below lg there's no room for the fixed sidebar, so adding a question
       * happens through a floating button + sheet instead. */}
      <button
        aria-label="Add a question"
        disabled={disabled}
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ember text-white shadow-pop transition-colors hover:bg-ember-hover disabled:opacity-50 lg:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          title="Add a question"
          className="bottom-0 left-0 right-0 top-auto max-h-[80vh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-b-none sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-full sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg lg:hidden"
        >
          <QuestionTypeList
            onAdd={(type) => {
              onAdd(type);
              setMobileOpen(false);
            }}
            disabled={disabled}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
