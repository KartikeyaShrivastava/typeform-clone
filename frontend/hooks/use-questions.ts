"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import type { Form, Question } from "@/lib/types";
import { formsKeys } from "./use-forms";
import { useToast } from "@/providers/toast-provider";

export function useCreateQuestion(formId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: Partial<Question>) => api.createQuestion(formId, payload),
    onSuccess: (question) => {
      qc.setQueryData<Form | undefined>(formsKeys.detail(formId), (old) =>
        old ? { ...old, questions: [...old.questions, question] } : old
      );
    },
    onError: () => toast({ title: "Couldn't add question", variant: "error" }),
  });
}

export function useUpdateQuestion(formId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: string; payload: Partial<Question> }) =>
      api.updateQuestion(questionId, payload),
    onMutate: async ({ questionId, payload }) => {
      await qc.cancelQueries({ queryKey: formsKeys.detail(formId) });
      const prev = qc.getQueryData<Form>(formsKeys.detail(formId));
      if (prev) {
        qc.setQueryData<Form>(formsKeys.detail(formId), {
          ...prev,
          questions: prev.questions.map((q) => (q.id === questionId ? { ...q, ...payload } : q)),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(formsKeys.detail(formId), ctx.prev);
      toast({ title: "Couldn't save question", variant: "error" });
    },
  });
}

export function useDeleteQuestion(formId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.deleteQuestion,
    onMutate: async (questionId: string) => {
      await qc.cancelQueries({ queryKey: formsKeys.detail(formId) });
      const prev = qc.getQueryData<Form>(formsKeys.detail(formId));
      if (prev) {
        qc.setQueryData<Form>(formsKeys.detail(formId), {
          ...prev,
          questions: prev.questions.filter((q) => q.id !== questionId),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(formsKeys.detail(formId), ctx.prev);
      toast({ title: "Couldn't delete question", variant: "error" });
    },
    onSuccess: () => toast({ title: "Question deleted", variant: "success" }),
  });
}

export function useReorderQuestions(formId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (questionIds: string[]) => api.reorderQuestions(formId, questionIds),
    onMutate: async (questionIds) => {
      await qc.cancelQueries({ queryKey: formsKeys.detail(formId) });
      const prev = qc.getQueryData<Form>(formsKeys.detail(formId));
      if (prev) {
        const byId = new Map(prev.questions.map((q) => [q.id, q]));
        const reordered = questionIds
          .map((id, i) => {
            const q = byId.get(id);
            return q ? { ...q, position: i } : undefined;
          })
          .filter(Boolean) as Question[];
        qc.setQueryData<Form>(formsKeys.detail(formId), { ...prev, questions: reordered });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(formsKeys.detail(formId), ctx.prev);
      toast({ title: "Couldn't save new order", variant: "error" });
    },
  });
}
