"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2, Asterisk, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Question } from "@/lib/types";
import { cn, questionTypeLabel } from "@/lib/utils";
import { getQuestionTypeMeta } from "@/lib/question-types";

export function QuestionCard({
  question,
  index,
  selected,
  onSelect,
  onOpenSettings,
  onDuplicate,
  onDelete,
}: {
  question: Question;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onOpenSettings: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });
  const meta = getQuestionTypeMeta(question.question_type);
  const Icon = meta.icon;

  return (
    <motion.div
      ref={setNodeRef}
      layout
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative flex items-start gap-2 rounded-lg border bg-surface p-4 transition-colors",
        selected ? "border-ember/50 shadow-[0_0_0_1px_rgba(255,107,69,0.35)]" : "border-border hover:border-muted-2/50",
        isDragging && "z-10 opacity-70"
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect();
      }}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="mt-1 cursor-grab touch-none text-muted-2 hover:text-muted active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[11px] text-muted-2">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className="flex items-center gap-1">
            <Icon className="h-3 w-3" /> {questionTypeLabel(question.question_type)}
          </span>
          {question.required && (
            <span className="flex items-center gap-0.5 text-ember">
              <Asterisk className="h-3 w-3" /> Required
            </span>
          )}
        </div>
        <p className="mt-1.5 truncate text-sm font-medium text-paper">
          {question.question_text || "Untitled question"}
        </p>
        {question.description && (
          <p className="mt-0.5 truncate text-xs text-muted">{question.description}</p>
        )}
        {meta.hasOptions && question.options && question.options.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {question.options.slice(0, 4).map((opt, i) => (
              <span key={i} className="rounded-full border border-border-soft bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                {opt || `Option ${i + 1}`}
              </span>
            ))}
            {question.options.length > 4 && (
              <span className="text-[11px] text-muted-2">+{question.options.length - 4} more</span>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          aria-label="Edit question settings"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSettings();
          }}
          className="rounded-md p-1.5 text-muted-2 hover:bg-surface-3 hover:text-paper xl:hidden"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            aria-label="Duplicate question"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="rounded-md p-1.5 text-muted-2 hover:bg-surface-3 hover:text-paper"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Delete question"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-md p-1.5 text-muted-2 hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
