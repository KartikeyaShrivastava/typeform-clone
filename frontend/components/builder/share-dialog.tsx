"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ShareDialog({
  open,
  onOpenChange,
  publicUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publicUrl: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const fullUrl =
    publicUrl && typeof window !== "undefined"
      ? `${window.location.origin}${publicUrl}`
      : publicUrl ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Share this form" description="Anyone with this link can respond.">
        {publicUrl ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input readOnly value={fullUrl} />
              <Button
                variant="secondary"
                size="icon"
                onClick={async () => {
                  await navigator.clipboard.writeText(fullUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                aria-label="Copy link"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-ember hover:text-ember-hover"
            >
              Open live form <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Publish this form first to get a shareable link.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
