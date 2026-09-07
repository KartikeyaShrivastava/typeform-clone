"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import type { Question } from "@/lib/types";
import { QuestionCard } from "./question-card";
import { FileQuestion } from "lucide-react";

export function QuestionList({
  questions,
  selectedId,
  onSelect,
  onReorder,
  onDuplicate,
  onDelete,
}: {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    const reordered = [...questions];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onReorder(reordered.map((q) => q.id));
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-ember">
          <FileQuestion className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-display text-lg text-paper">Start with a question</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted">
          Pick a question type from the left to add your first field.
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                selected={q.id === selectedId}
                onSelect={() => onSelect(q.id)}
                onDuplicate={() => onDuplicate(q.id)}
                onDelete={() => onDelete(q.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}
