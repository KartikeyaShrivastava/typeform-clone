"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FormListItem } from "@/lib/types";
import * as api from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formsKeys } from "@/hooks/use-forms";
import { useToast } from "@/providers/toast-provider";

export function RenameFormDialog({
  form,
  open,
  onOpenChange,
}: {
  form: FormListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState(form.title);
  const qc = useQueryClient();
  const { toast } = useToast();

  const rename = useMutation({
    mutationFn: (newTitle: string) => api.updateForm(form.id, { title: newTitle }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: formsKeys.all });
      toast({ title: "Form renamed", variant: "success" });
      onOpenChange(false);
    },
    onError: () => toast({ title: "Couldn't rename form", variant: "error" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Rename form">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim()) rename.mutate(title.trim());
          }}
          className="space-y-4"
        >
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Form title"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={rename.isPending}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
