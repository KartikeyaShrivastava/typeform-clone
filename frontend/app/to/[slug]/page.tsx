"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { FormRunner, type RunnerAnswers } from "@/components/respondent/form-runner";
import { ThankYouScreen } from "@/components/respondent/thank-you";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnswerPayload } from "@/lib/types";

export default function PublicFormPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: form, isLoading, isError } = useQuery({
    queryKey: ["public-form", slug],
    queryFn: () => api.getPublicForm(slug),
    enabled: Boolean(slug),
    retry: 1,
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleComplete(answers: RunnerAnswers, completionSeconds: number) {
    if (!form) return;
    setSubmitting(true);
    setSubmitError(null);
    const payload: AnswerPayload[] = form.questions.map((q) => ({
      question_id: q.id,
      answer_value: answers[q.id] ?? null,
    }));
    try {
      await api.submitResponse(slug, { answers: payload, completion_time_seconds: completionSeconds });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Couldn't submit your response.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-display text-xl text-paper">This form isn't available</p>
        <p className="text-sm text-muted">It may be unpublished, or the link may be incorrect.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <ThankYouScreen
        title={form.thank_you_title ?? "Thank you!"}
        message={form.thank_you_message ?? "Your response has been recorded."}
        accent={(form.theme_config?.primary_color as string) ?? "#FF6B45"}
      />
    );
  }

  return (
    <>
      <FormRunner form={form} onComplete={handleComplete} submitting={submitting} submitLabel="Submit" />
      {submitError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-md border border-danger/30 bg-surface-2 px-4 py-2.5 text-sm text-danger shadow-pop">
          {submitError}
        </div>
      )}
    </>
  );
}
