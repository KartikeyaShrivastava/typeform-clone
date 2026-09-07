"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal, Copy, Trash2, Pencil, MessageSquare, BarChart3 } from "lucide-react";
import type { FormListItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeDate, pluralize } from "@/lib/utils";
import { useDeleteForm, useDuplicateForm } from "@/hooks/use-forms";
import { RenameFormDialog } from "./rename-form-dialog";

export function FormCard({ form }: { form: FormListItem }) {
  const [renaming, setRenaming] = useState(false);
  const duplicateForm = useDuplicateForm();
  const deleteForm = useDeleteForm();

  return (
    <>
      <div className="group relative flex flex-col rounded-xl border border-border bg-surface transition-all duration-200 hover:border-muted-2/60 hover:shadow-lg hover:shadow-black/20">
        {/* Card header — colored accent bar */}
        <div
          className="h-1.5 rounded-t-xl"
          style={{
            background:
              form.status === "published"
                ? "linear-gradient(90deg, #5FD98A 0%, #4FC77A 100%)"
                : "linear-gradient(90deg, #3A3F50 0%, #2A2E3B 100%)",
          }}
        />

        <div className="flex flex-1 flex-col p-5">
          {/* Title + menu */}
          <div className="flex items-start justify-between gap-3">
            <Link href={`/forms/${form.id}/edit`} className="min-w-0 flex-1">
              <h3 className="truncate font-display text-lg text-paper transition-colors group-hover:text-white">
                {form.title || "Untitled form"}
              </h3>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-2 opacity-0 transition-all hover:bg-surface-3 hover:text-paper group-hover:opacity-100 data-[state=open]:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setRenaming(true)}>
                  <Pencil className="h-3.5 w-3.5" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => duplicateForm.mutate(form.id)}>
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  destructive
                  onSelect={() => {
                    if (confirm(`Delete "${form.title || "Untitled form"}"? This can't be undone.`)) {
                      deleteForm.mutate(form.id);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Metadata row */}
          <Link href={`/forms/${form.id}/edit`} className="mt-5 block">
            <div className="flex items-center gap-3">
              <Badge variant={form.status === "published" ? "success" : "muted"}>
                {form.status === "published" ? "Published" : "Draft"}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-2">
                <MessageSquare className="h-3 w-3" />
                {pluralize(form.response_count, "response")}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-2">
              Edited {formatRelativeDate(form.updated_at)}
            </p>
          </Link>
        </div>
      </div>

      <RenameFormDialog form={form} open={renaming} onOpenChange={setRenaming} />
    </>
  );
}
