"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useResponse } from "@/hooks/use-responses";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";

export function ResponseDetailDialog({
  formId,
  responseId,
  onOpenChange,
}: {
  formId: string;
  responseId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useResponse(formId, responseId);

  return (
    <Dialog open={Boolean(responseId)} onOpenChange={onOpenChange}>
      <DialogContent title="Response" className="max-w-xl">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        )}
        {data && (
          <div>
            <p className="text-xs text-muted-2">Submitted {formatDateTime(data.submitted_at)}</p>
            <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {data.answers.map((a, i) => (
                <div key={i} className="rounded-md border border-border-soft bg-surface px-4 py-3">
                  <p className="text-xs font-medium text-muted-2">{a.question_text ?? `Question ${i + 1}`}</p>
                  <p className="mt-1 text-sm text-paper">
                    {a.answer_value === null || a.answer_value === undefined || a.answer_value === ""
                      ? "—"
                      : Array.isArray(a.answer_value)
                        ? a.answer_value.join(", ")
                        : String(a.answer_value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
