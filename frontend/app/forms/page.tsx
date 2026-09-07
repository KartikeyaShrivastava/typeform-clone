"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FormCard } from "@/components/dashboard/form-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { useCreateForm, useForms } from "@/hooks/use-forms";
import { useToast } from "@/providers/toast-provider";

export default function FormsDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: forms, isLoading, isError } = useForms();
  const createForm = useCreateForm();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const filtered = useMemo(() => {
    if (!forms) return [];
    if (!query.trim()) return forms;
    return forms.filter((f) => f.title.toLowerCase().includes(query.toLowerCase()));
  }, [forms, query]);

  const publishedCount = useMemo(
    () => (forms ?? []).filter((f) => f.status === "published").length,
    [forms]
  );

  const totalResponses = useMemo(
    () => (forms ?? []).reduce((sum, f) => sum + f.response_count, 0),
    [forms]
  );

  function handleCreate() {
    setNewTitle("");
    setCreateOpen(true);
  }

  function submitCreate() {
    createForm.mutate(
      { title: newTitle.trim() || "Untitled form" },
      {
        onSuccess: (form) => {
          setCreateOpen(false);
          router.push(`/forms/${form.id}/edit`);
        },
        onError: () => toast({ title: "Couldn't create form", variant: "error" }),
      }
    );
  }

  return (
    <div className="min-h-screen bg-ink">
      <Navbar
        right={
          <Button size="sm" onClick={handleCreate} loading={createForm.isPending}>
            <Plus className="h-4 w-4" /> Create a form
          </Button>
        }
      />

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Header section */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl text-paper">My workspace</h1>
            {forms ? (
              <p className="mt-1.5 text-sm text-muted">
                <span className="text-paper font-medium">{forms.length}</span> form{forms.length !== 1 ? "s" : ""}
                {publishedCount > 0 && (
                  <>
                    {" · "}
                    <span className="text-success">{publishedCount} published</span>
                  </>
                )}
                {totalResponses > 0 && (
                  <>
                    {" · "}
                    <span className="text-muted">{totalResponses} total response{totalResponses !== 1 ? "s" : ""}</span>
                  </>
                )}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">Loading your forms…</p>
            )}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search forms"
              className="pl-9"
            />
          </div>
        </div>

        <div className="mt-8">
          {isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-danger/30 bg-danger/5 px-5 py-4 text-sm text-danger">
              Couldn't load your forms. Check that the API is running at{" "}
              <code className="rounded bg-surface-3 px-1 py-0.5">NEXT_PUBLIC_API_URL</code>.
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && forms && forms.length === 0 && (
            <EmptyState onCreate={handleCreate} loading={createForm.isPending} />
          )}

          {!isLoading && !isError && forms && forms.length > 0 && filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-muted">No forms match &ldquo;{query}&rdquo;.</p>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((form) => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent title="Name your form" description="You can always change this later.">
          <div className="space-y-4">
            <Input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Untitled form"
              onKeyDown={(e) => e.key === "Enter" && submitCreate()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitCreate} loading={createForm.isPending}>
                Create form
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
