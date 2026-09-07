"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CornerDownLeft } from "lucide-react";
import type { Form } from "@/lib/types";
import { ProgressBar } from "./progress-bar";
import { QuestionView, type AnswerValue } from "./question-view";
import { cn } from "@/lib/utils";

export interface RunnerAnswers {
  [questionId: string]: AnswerValue;
}

function validate(question: Form["questions"][number], value: AnswerValue): string | null {
  const isEmpty =
    value === null || value === undefined || (typeof value === "string" && value.trim() === "");

  if (question.required && isEmpty) return "This question is required";
  if (isEmpty) return null;

  if (question.question_type === "email" && typeof value === "string") {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(value)) return "Enter a valid email address";
  }
  if (question.question_type === "number" && value !== null) {
    if (typeof value !== "number" || Number.isNaN(value)) return "Please enter a valid number";
  }
  return null;
}

export function FormRunner({
  form,
  onComplete,
  submitLabel = "Submit",
  submitting = false,
}: {
  form: Form;
  onComplete: (answers: RunnerAnswers, completionSeconds: number) => void;
  submitLabel?: string;
  submitting?: boolean;
}) {
  const questions = useMemo(
    () => [...form.questions].sort((a, b) => a.position - b.position),
    [form.questions]
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<RunnerAnswers>({});
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const startRef = useRef<number>(Date.now());

  const accent = (form.theme_config?.primary_color as string) ?? "#FF6B45";
  const question = questions[index];
  const isLast = index === questions.length - 1;

  useEffect(() => {
    setError(null);
  }, [index]);

  function goNext() {
    if (!question) return;
    const err = validate(question, answers[question.id] ?? null);
    if (err) {
      setError(err);
      return;
    }
    if (isLast) {
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      onComplete(answers, seconds);
      return;
    }
    setDirection(1);
    setIndex((i) => i + 1);
  }

  function goBack() {
    if (index === 0) return;
    setDirection(-1);
    setIndex((i) => i - 1);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTextArea = target.tagName === "TEXTAREA";
      if (e.key === "Enter" && !e.shiftKey && !isTextArea) {
        e.preventDefault();
        goNext();
      }
      if (e.key === "Enter" && isTextArea && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        goNext();
      }
      if (e.key === "Backspace" && (e.metaKey || e.altKey)) {
        // avoid interfering with text editing; explicit back button covers navigation
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, answers, question]);

  if (!question) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        This form doesn't have any questions yet.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <ProgressBar current={index} total={questions.length} color={accent} />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10 sm:py-16">
        <div className="flex items-center justify-between">
          <h2 className="truncate font-display text-base text-muted">{form.title}</h2>
          <span className="shrink-0 text-xs text-muted-2">
            {index + 1} of {questions.length}
          </span>
        </div>

        <div className="mt-10 flex-1 sm:mt-16">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={question.id}
              custom={direction}
              initial={{ opacity: 0, y: direction * 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction * -30 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-sm font-medium" style={{ color: accent }}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h1 className="mt-3 text-balance font-display text-2xl leading-tight text-paper sm:text-4xl">
                {question.question_text || "Untitled question"}
                {question.required && <span style={{ color: accent }}> *</span>}
              </h1>
              {question.description && (
                <p className="mt-3 text-sm text-muted sm:text-base">{question.description}</p>
              )}

              <div className="mt-8">
                <QuestionView
                  question={question}
                  value={answers[question.id] ?? null}
                  onChange={(v) => setAnswers((prev) => ({ ...prev, [question.id]: v }))}
                  onAutoAdvance={() => setTimeout(goNext, 260)}
                  accent={accent}
                  error={error}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border-soft pt-6">
          <button
            onClick={goBack}
            disabled={index === 0}
            className={cn(
              "flex items-center gap-1.5 text-sm text-muted transition-opacity hover:text-paper",
              index === 0 && "pointer-events-none opacity-0"
            )}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <button
            onClick={goNext}
            disabled={submitting}
            className="flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
            style={{ backgroundColor: accent }}
          >
            {isLast ? submitLabel : "Continue"}
            {isLast ? <ArrowRight className="h-4 w-4" /> : <CornerDownLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
