"use client";

import { useEffect, useRef } from "react";
import { Star, Check } from "lucide-react";
import type { Question } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export type AnswerValue = string | number | boolean | null;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function QuestionView({
  question,
  value,
  onChange,
  onAutoAdvance,
  accent,
  error,
}: {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  onAutoAdvance?: () => void;
  accent: string;
  error?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [question.id]);

  const errorNode = error ? (
    <p role="alert" className="mt-3 text-sm text-danger">
      {error}
    </p>
  ) : null;

  switch (question.question_type) {
    case "short_text":
      return (
        <div>
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here…"
            aria-label={question.question_text}
            className="w-full border-b-2 border-border bg-transparent pb-3 font-display text-2xl text-paper outline-none placeholder:text-muted-2 focus:border-[--accent] sm:text-3xl"
            style={{ ["--accent" as string]: accent }}
          />
          {errorNode}
        </div>
      );

    case "long_text":
      return (
        <div>
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here…"
            aria-label={question.question_text}
            rows={4}
            className="w-full resize-none border-b-2 border-border bg-transparent pb-3 font-display text-xl text-paper outline-none placeholder:text-muted-2 focus:border-[--accent]"
            style={{ ["--accent" as string]: accent }}
          />
          {errorNode}
        </div>
      );

    case "email":
      return (
        <div>
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="email"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="name@example.com"
            aria-label={question.question_text}
            className="w-full border-b-2 border-border bg-transparent pb-3 font-display text-2xl text-paper outline-none placeholder:text-muted-2 focus:border-[--accent] sm:text-3xl"
            style={{ ["--accent" as string]: accent }}
          />
          {errorNode}
        </div>
      );

    case "number":
      return (
        <div>
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            inputMode="numeric"
            value={value === null || value === undefined ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            placeholder="0"
            aria-label={question.question_text}
            className="w-full border-b-2 border-border bg-transparent pb-3 font-display text-2xl text-paper outline-none placeholder:text-muted-2 focus:border-[--accent] sm:text-3xl"
            style={{ ["--accent" as string]: accent }}
          />
          {errorNode}
        </div>
      );

    case "multiple_choice": {
      const options = question.options ?? [];
      return (
        <div>
          <div className="space-y-2.5" role="radiogroup" aria-label={question.question_text}>
            {options.map((opt, i) => {
              const selected = value === opt;
              return (
                <button
                  key={i}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    onChange(opt);
                    onAutoAdvance?.();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md border px-4 py-3.5 text-left transition-colors",
                    selected
                      ? "border-[--accent] bg-[--accent]/10"
                      : "border-border bg-surface hover:border-muted-2/60"
                  )}
                  style={{ ["--accent" as string]: accent }}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-medium",
                      selected ? "border-[--accent] bg-[--accent] text-white" : "border-border text-muted"
                    )}
                    style={{ ["--accent" as string]: accent }}
                  >
                    {LETTERS[i] ?? i + 1}
                  </span>
                  <span className="text-base text-paper">{opt || `Option ${i + 1}`}</span>
                </button>
              );
            })}
          </div>
          {errorNode}
        </div>
      );
    }

    case "dropdown": {
      const options = question.options ?? [];
      return (
        <div>
          <Select value={(value as string) ?? undefined} onValueChange={(v) => onChange(v)}>
            <SelectTrigger placeholder="Choose an option" />
            <SelectContent>
              {options.map((opt, i) => (
                <SelectItem key={i} value={opt || `option-${i}`}>
                  {opt || `Option ${i + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errorNode}
        </div>
      );
    }

    case "yes_no":
      return (
        <div>
          <div className="grid grid-cols-2 gap-3">
            {["Yes", "No"].map((label) => {
              const boolVal = label === "Yes";
              const selected = value === boolVal;
              return (
                <button
                  key={label}
                  onClick={() => {
                    onChange(boolVal);
                    onAutoAdvance?.();
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-md border py-6 text-lg font-medium transition-colors",
                    selected
                      ? "border-[--accent] bg-[--accent]/10 text-paper"
                      : "border-border bg-surface text-muted hover:border-muted-2/60"
                  )}
                  style={{ ["--accent" as string]: accent }}
                >
                  {selected && <Check className="h-4 w-4" style={{ color: accent }} />}
                  {label}
                </button>
              );
            })}
          </div>
          {errorNode}
        </div>
      );

    case "rating": {
      const max = (question.settings?.max_rating as number) ?? 5;
      const current = typeof value === "number" ? value : 0;
      return (
        <div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: max }).map((_, i) => {
              const n = i + 1;
              const active = current >= n;
              return (
                <button
                  key={n}
                  aria-label={`Rate ${n} out of ${max}`}
                  onClick={() => {
                    onChange(n);
                    onAutoAdvance?.();
                  }}
                  className="p-1"
                >
                  <Star
                    className="h-9 w-9 transition-colors"
                    fill={active ? accent : "none"}
                    color={active ? accent : "#5C6072"}
                    strokeWidth={1.5}
                  />
                </button>
              );
            })}
          </div>
          {errorNode}
        </div>
      );
    }

    default:
      return null;
  }
}
