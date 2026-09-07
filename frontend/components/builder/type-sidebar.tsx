"use client";

import { QUESTION_TYPES } from "@/lib/question-types";
import type { QuestionType } from "@/lib/types";

export function TypeSidebar({ onAdd, disabled }: { onAdd: (type: QuestionType) => void; disabled?: boolean }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border-soft bg-ink/60 p-4 lg:block">
      <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-2">Add a question</p>
      <div className="mt-3 space-y-1">
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
    </aside>
  );
}
