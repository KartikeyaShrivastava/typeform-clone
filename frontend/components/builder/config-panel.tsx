"use client";

import { Plus, X, Settings2 } from "lucide-react";
import type { Question } from "@/lib/types";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getQuestionTypeMeta } from "@/lib/question-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function ConfigPanelFields({
  question,
  onChange,
}: {
  question: Question;
  onChange: (patch: Partial<Question>) => void;
}) {
  const meta = getQuestionTypeMeta(question.question_type);
  const options = question.options ?? [];

  function updateOption(i: number, value: string) {
    const next = [...options];
    next[i] = value;
    onChange({ options: next });
  }

  function addOption() {
    onChange({ options: [...options, `Option ${options.length + 1}`] });
  }

  function removeOption(i: number) {
    onChange({ options: options.filter((_, idx) => idx !== i) });
  }

  return (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-2">{meta.label}</p>

      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="q-text">Question</Label>
          <Textarea
            key={question.id}
            id="q-text"
            value={question.question_text}
            onChange={(e) => onChange({ question_text: e.target.value })}
            rows={2}
            placeholder="Type your question"
            autoFocus={!question.question_text}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="q-desc">Description (optional)</Label>
          <Textarea
            id="q-desc"
            value={question.description ?? ""}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={2}
            placeholder="Add helper text"
          />
        </div>

        <div className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2.5">
          <Label htmlFor="q-required" className="text-paper">
            Required
          </Label>
          <Switch
            id="q-required"
            checked={question.required}
            onCheckedChange={(checked) => onChange({ required: checked })}
          />
        </div>

        {meta.hasOptions && (
          <div className="space-y-1.5">
            <Label>Options</Label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                  <button
                    aria-label="Remove option"
                    onClick={() => removeOption(i)}
                    className="shrink-0 rounded-md p-2 text-muted-2 hover:bg-surface-3 hover:text-danger"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="sm" onClick={addOption} className="mt-1 w-full">
              <Plus className="h-3.5 w-3.5" /> Add option
            </Button>
          </div>
        )}

        {question.question_type === "rating" && (
          <div className="space-y-1.5">
            <Label htmlFor="q-max-rating">Maximum rating</Label>
            <Input
              id="q-max-rating"
              type="number"
              min={3}
              max={10}
              value={question.settings?.max_rating ?? 5}
              onChange={(e) =>
                onChange({
                  settings: { ...question.settings, max_rating: Number(e.target.value) || 5 },
                })
              }
            />
          </div>
        )}
      </div>
    </>
  );
}

export function ConfigPanel({
  question,
  onChange,
}: {
  question: Question | null;
  onChange: (patch: Partial<Question>) => void;
}) {
  if (!question) {
    return (
      <aside className="hidden w-80 shrink-0 border-l border-border-soft bg-ink/60 p-6 xl:block">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <Settings2 className="h-5 w-5 text-muted-2" />
          <p className="mt-3 text-sm text-muted">Select a question to edit its settings.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-border-soft bg-ink/60 p-6 xl:block">
      <ConfigPanelFields question={question} onChange={onChange} />
    </aside>
  );
}

/** Below the xl breakpoint there's no room for the fixed side panel, so question
 * settings open as a modal instead, triggered from the selected question card. */
export function ConfigPanelSheet({
  question,
  onChange,
  open,
  onOpenChange,
}: {
  question: Question | null;
  onChange: (patch: Partial<Question>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!question) return null;
  const meta = getQuestionTypeMeta(question.question_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={meta.label} className="max-h-[85vh] overflow-y-auto xl:hidden">
        <ConfigPanelFields question={question} onChange={onChange} />
      </DialogContent>
    </Dialog>
  );
}
