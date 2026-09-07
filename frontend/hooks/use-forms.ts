"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import type { Form, FormListItem } from "@/lib/types";
import { useToast } from "@/providers/toast-provider";

export const formsKeys = {
  all: ["forms"] as const,
  detail: (id: string) => ["forms", id] as const,
};

export function useForms() {
  return useQuery({ queryKey: formsKeys.all, queryFn: api.listForms });
}

export function useForm(id: string) {
  return useQuery({
    queryKey: formsKeys.detail(id),
    queryFn: () => api.getForm(id),
    enabled: Boolean(id),
  });
}

export function useCreateForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createForm,
    onSuccess: (form) => {
      qc.invalidateQueries({ queryKey: formsKeys.all });
      qc.setQueryData(formsKeys.detail(form.id), form);
    },
  });
}

export function useUpdateForm(formId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof api.updateForm>[1]) => api.updateForm(formId, payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: formsKeys.detail(formId) });
      const prev = qc.getQueryData<Form>(formsKeys.detail(formId));
      if (prev) qc.setQueryData(formsKeys.detail(formId), { ...prev, ...payload });
      return { prev };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.prev) qc.setQueryData(formsKeys.detail(formId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: formsKeys.detail(formId) });
      qc.invalidateQueries({ queryKey: formsKeys.all });
    },
  });
}

export function useDeleteForm() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.deleteForm,
    onMutate: async (formId: string) => {
      await qc.cancelQueries({ queryKey: formsKeys.all });
      const prev = qc.getQueryData<FormListItem[]>(formsKeys.all);
      qc.setQueryData<FormListItem[]>(formsKeys.all, (old) => old?.filter((f) => f.id !== formId));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(formsKeys.all, ctx.prev);
      toast({ title: "Couldn't delete form", variant: "error" });
    },
    onSuccess: () => toast({ title: "Form deleted", variant: "success" }),
    onSettled: () => qc.invalidateQueries({ queryKey: formsKeys.all }),
  });
}

export function useDuplicateForm() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.duplicateForm,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: formsKeys.all });
      toast({ title: "Form duplicated", variant: "success" });
    },
    onError: () => toast({ title: "Couldn't duplicate form", variant: "error" }),
  });
}

export function usePublishForm(formId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (publish: boolean) => (publish ? api.publishForm(formId) : api.unpublishForm(formId)),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: formsKeys.detail(formId) });
      qc.invalidateQueries({ queryKey: formsKeys.all });
      toast({
        title: res.status === "published" ? "Form published" : "Form unpublished",
        variant: "success",
      });
    },
    onError: () => toast({ title: "Couldn't update publish status", variant: "error" }),
  });
}
