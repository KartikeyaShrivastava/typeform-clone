"use client";

import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";

export function useResponses(formId: string, page: number, pageSize = 20) {
  return useQuery({
    queryKey: ["responses", formId, page, pageSize],
    queryFn: () => api.listResponses(formId, page, pageSize),
    enabled: Boolean(formId),
  });
}

export function useResponse(formId: string, responseId: string | null) {
  return useQuery({
    queryKey: ["responses", formId, "detail", responseId],
    queryFn: () => api.getResponse(formId, responseId as string),
    enabled: Boolean(formId) && Boolean(responseId),
  });
}

export function useStatistics(formId: string) {
  return useQuery({
    queryKey: ["statistics", formId],
    queryFn: () => api.getStatistics(formId),
    enabled: Boolean(formId),
  });
}
