"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "@/hooks/use-forms";
import { useResponses, useStatistics } from "@/hooks/use-responses";
import { ResponsesTable } from "@/components/results/responses-table";
import { SummaryTab } from "@/components/results/summary-tab";
import { ResponseDetailDialog } from "@/components/results/response-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const formId = params.id;
  const { data: form, isLoading: formLoading } = useForm(formId);

  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const { data: responseData, isLoading: responsesLoading } = useResponses(formId, page, PAGE_SIZE);
  const { data: stats, isLoading: statsLoading } = useStatistics(formId);

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-30 border-b border-border-soft bg-ink/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link
            href={`/forms/${formId}/edit`}
            aria-label="Back to builder"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-paper"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          {formLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <>
              <h1 className="font-display text-xl text-paper">{form?.title ?? "Untitled form"}</h1>
              {form && (
                <Badge variant={form.status === "published" ? "success" : "muted"}>
                  {form.status === "published" ? "Published" : "Draft"}
                </Badge>
              )}
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Tabs defaultValue="responses">
          <TabsList>
            <TabsTrigger value="responses">Responses</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="mt-6">
            <ResponsesTable
              responses={responseData?.items ?? []}
              isLoading={responsesLoading}
              page={page}
              pageSize={PAGE_SIZE}
              total={responseData?.total ?? 0}
              onPageChange={setPage}
              onView={setViewingId}
            />
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <SummaryTab stats={stats} isLoading={statsLoading} />
          </TabsContent>
        </Tabs>
      </main>

      <ResponseDetailDialog formId={formId} responseId={viewingId} onOpenChange={(o) => !o && setViewingId(null)} />
    </div>
  );
}
