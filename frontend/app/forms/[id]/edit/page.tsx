"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { Form, Question, QuestionType } from "@/lib/types";
import { formsKeys } from "@/hooks/use-forms";
import { useForm, usePublishForm, useUpdateForm } from "@/hooks/use-forms";
import {
  useCreateQuestion,
  useDeleteQuestion,
  useReorderQuestions,
  useUpdateQuestion,
} from "@/hooks/use-questions";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { BuilderNavbar } from "@/components/builder/builder-navbar";
import { TypeSidebar } from "@/components/builder/type-sidebar";
import { QuestionList } from "@/components/builder/question-list";
import { ConfigPanel, ConfigPanelSheet } from "@/components/builder/config-panel";
import { BuilderPreview } from "@/components/builder/builder-preview";
import { SettingsDialog } from "@/components/builder/settings-dialog";
import { ShareDialog } from "@/components/builder/share-dialog";
import type { SaveState } from "@/components/builder/save-status";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/providers/toast-provider";

export default function BuilderPage() {
  const params = useParams<{ id: string }>();
  const formId = params.id;
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: form, isLoading, isError } = useForm(formId);
  const updateForm = useUpdateForm(formId);
  const publishForm = usePublishForm(formId);
  const createQuestion = useCreateQuestion(formId);
  const updateQuestion = useUpdateQuestion(formId);
  const deleteQuestion = useDeleteQuestion(formId);
  const reorderQuestions = useReorderQuestions(formId);

  const [tab, setTab] = useState<"builder" | "preview">("builder");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [title, setTitle] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
  const titleHydrated = useRef(false);

  useEffect(() => {
    if (form && !titleHydrated.current) {
      setTitle(form.title);
      titleHydrated.current = true;
    }
  }, [form]);

  useEffect(() => {
    if (form && form.questions.length > 0 && !selectedId) {
      setSelectedId(form.questions[0].id);
    }
  }, [form, selectedId]);

  const debouncedTitleSave = useDebouncedCallback((value: string) => {
    setSaveState("saving");
    updateForm.mutate(
      { title: value },
      {
        onSuccess: () => {
          setSaveState("saved");
          setTimeout(() => setSaveState("idle"), 1500);
        },
        onError: () => setSaveState("idle"),
      }
    );
  }, 600);

  function handleTitleChange(value: string) {
    setTitle(value);
    debouncedTitleSave(value);
  }

  const debouncedQuestionSave = useDebouncedCallback(
    (questionId: string, patch: Partial<Question>) => {
      setSaveState("saving");
      updateQuestion.mutate(
        { questionId, payload: patch },
        {
          onSuccess: () => {
            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 1500);
          },
          onError: () => setSaveState("idle"),
        }
      );
    },
    500
  );

  function handleAddQuestion(type: QuestionType) {
    const defaults: Partial<Question> = {
      question_text: "",
      question_type: type,
      required: false,
      position: form?.questions.length ?? 0,
      options: type === "multiple_choice" || type === "dropdown" ? ["Option 1", "Option 2"] : undefined,
      settings: type === "rating" ? { max_rating: 5 } : undefined,
    };
    createQuestion.mutate(defaults, {
      onSuccess: (q) => setSelectedId(q.id),
      onError: () => toast({ title: "Couldn't add question", variant: "error" }),
    });
  }

  function handleQuestionPatch(questionId: string, patch: Partial<Question>) {
    // Instant local feedback in the cache; the network write is debounced.
    qc.setQueryData<Form | undefined>(formsKeys.detail(formId), (old) =>
      old
        ? { ...old, questions: old.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)) }
        : old
    );
    debouncedQuestionSave(questionId, patch);
  }

  const selectedQuestion = form?.questions.find((q) => q.id === selectedId) ?? null;

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <div className="h-16 border-b border-border-soft px-4 py-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex flex-1 gap-4 p-6">
          <Skeleton className="hidden w-64 lg:block" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="hidden w-80 xl:block" />
        </div>
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-center">
        <p className="text-paper">Couldn't load this form.</p>
        <p className="text-sm text-muted">Check that the API is running and the form exists.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-ink">
      <BuilderNavbar
        title={title}
        onTitleChange={handleTitleChange}
        status={form.status}
        activeTab={tab}
        onTabChange={setTab}
        saveState={saveState}
        publishing={publishForm.isPending}
        onPublishToggle={() => publishForm.mutate(form.status !== "published")}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenShare={() => setShareOpen(true)}
        disablePublish={form.questions.some((q) => !q.question_text || !q.question_text.trim())}
      />

      {tab === "builder" ? (
        <div className="flex flex-1 overflow-hidden">
          <TypeSidebar onAdd={handleAddQuestion} disabled={createQuestion.isPending} />

          <main className="flex-1 overflow-y-auto px-6 py-8">
            <div className="mx-auto max-w-2xl">
              <QuestionList
                questions={[...form.questions].sort((a, b) => a.position - b.position)}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onOpenSettings={(id) => {
                  setSelectedId(id);
                  setMobileConfigOpen(true);
                }}
                onReorder={(ids) => reorderQuestions.mutate(ids)}
                onDuplicate={(id) => {
                  const q = form.questions.find((x) => x.id === id);
                  if (!q) return;
                  createQuestion.mutate({
                    question_text: q.question_text,
                    description: q.description,
                    question_type: q.question_type,
                    required: q.required,
                    position: form.questions.length,
                    options: q.options ? [...q.options] : undefined,
                    settings: q.settings ? { ...q.settings } : undefined,
                  });
                }}
                onDelete={(id) => {
                  if (confirm("Delete this question? This can't be undone.")) {
                    deleteQuestion.mutate(id);
                    if (selectedId === id) setSelectedId(null);
                  }
                }}
              />
            </div>
          </main>

          <ConfigPanel
            question={selectedQuestion}
            onChange={(patch) => {
              if (!selectedQuestion) return;
              handleQuestionPatch(selectedQuestion.id, patch);
            }}
          />
          <ConfigPanelSheet
            question={selectedQuestion}
            onChange={(patch) => {
              if (!selectedQuestion) return;
              handleQuestionPatch(selectedQuestion.id, patch);
            }}
            open={mobileConfigOpen}
            onOpenChange={setMobileConfigOpen}
          />
        </div>
      ) : (
        <BuilderPreview form={form} />
      )}

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        form={form}
        onSave={(patch) => {
          setSaveState("saving");
          updateForm.mutate(patch, {
            onSuccess: () => {
              setSaveState("saved");
              toast({ title: "Settings saved", variant: "success" });
              setTimeout(() => setSaveState("idle"), 1500);
            },
            onError: () => setSaveState("idle"),
          });
        }}
      />

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        publicUrl={form.status === "published" && form.public_slug ? `/to/${form.public_slug}` : null}
      />
    </div>
  );
}
