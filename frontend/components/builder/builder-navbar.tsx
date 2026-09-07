"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Settings2, Share2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SaveStatus, type SaveState } from "./save-status";
import { Badge } from "@/components/ui/badge";

export function BuilderNavbar({
  title,
  onTitleChange,
  status,
  activeTab,
  onTabChange,
  saveState,
  publishing,
  onPublishToggle,
  onOpenSettings,
  onOpenShare,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  status: "draft" | "published";
  activeTab: "builder" | "preview";
  onTabChange: (tab: "builder" | "preview") => void;
  saveState: SaveState;
  publishing: boolean;
  onPublishToggle: () => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-ink/90 px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/forms"
          aria-label="Back to my forms"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-paper"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        {editing ? (
          <Input
            autoFocus
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
            className="h-8 w-64"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="max-w-[40vw] truncate rounded-md px-1.5 py-0.5 text-left font-display text-base text-paper hover:bg-surface-2"
          >
            {title || "Untitled form"}
          </button>
        )}
        <Badge variant={status === "published" ? "success" : "muted"}>
          {status === "published" ? "Published" : "Draft"}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "builder" | "preview")}>
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <SaveStatus state={saveState} />
        <Button variant="ghost" size="icon" aria-label="Settings" onClick={onOpenSettings}>
          <Settings2 className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="sm" onClick={onOpenShare}>
          <Share2 className="h-3.5 w-3.5" /> Share
        </Button>
        <Button size="sm" loading={publishing} onClick={onPublishToggle}>
          {status === "published" ? "Unpublish" : "Publish"}
        </Button>
      </div>
    </header>
  );
}
