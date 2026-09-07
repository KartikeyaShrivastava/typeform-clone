"use client";

import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { FormResponse } from "@/lib/types";
import { formatDateTime, truncate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function previewAnswers(response: FormResponse): string {
  const first = response.answers.find((a) => a.answer_value !== null && a.answer_value !== "");
  if (!first) return "—";
  const v = first.answer_value;
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

export function ResponsesTable({
  responses,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onView,
}: {
  responses: FormResponse[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onView: (id: string) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-20 text-center">
        <p className="text-sm text-muted">No responses yet. Share your form to start collecting answers.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted-2">
            <tr>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Response ID</th>
              <th className="px-4 py-3 font-medium">Answer preview</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {responses.map((r) => (
              <tr key={r.id} className="bg-surface hover:bg-surface-2">
                <td className="whitespace-nowrap px-4 py-3 text-paper">{formatDateTime(r.submitted_at)}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">
                  {r.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-muted">{truncate(previewAnswers(r), 60)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => onView(r.id)}>
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-2">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
