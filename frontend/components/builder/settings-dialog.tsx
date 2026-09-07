"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { Form } from "@/lib/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SWATCHES = ["#FF6B45", "#7C93FF", "#5FD98A", "#F2585F", "#E8B84B", "#C77CFF"];

export function SettingsDialog({
  open,
  onOpenChange,
  form,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: Form;
  onSave: (patch: Partial<Form>) => void;
}) {
  const [primaryColor, setPrimaryColor] = useState(form.theme_config?.primary_color ?? "#FF6B45");
  const [thankYouTitle, setThankYouTitle] = useState(form.thank_you_title ?? "Thank you!");
  const [thankYouMessage, setThankYouMessage] = useState(
    form.thank_you_message ?? "Your response has been recorded."
  );

  function handleSave() {
    onSave({
      theme_config: { ...form.theme_config, primary_color: primaryColor },
      thank_you_title: thankYouTitle,
      thank_you_message: thankYouMessage,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Form settings" className="max-w-xl">
        <Tabs defaultValue="theme" className="mt-2">
          <TabsList>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="thankyou">Thank you screen</TabsTrigger>
            <TabsTrigger value="logic">Logic</TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="mt-5 space-y-3">
            <Label>Accent color</Label>
            <div className="flex flex-wrap gap-2">
              {SWATCHES.map((color) => (
                <button
                  key={color}
                  aria-label={`Use ${color}`}
                  onClick={() => setPrimaryColor(color)}
                  className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-105"
                  style={{
                    backgroundColor: color,
                    borderColor: primaryColor === color ? "#F4F2EC" : "transparent",
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-muted">Used for buttons and progress on the public form.</p>
          </TabsContent>

          <TabsContent value="thankyou" className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ty-title">Title</Label>
              <Input id="ty-title" value={thankYouTitle} onChange={(e) => setThankYouTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ty-message">Message</Label>
              <Textarea
                id="ty-message"
                rows={3}
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="logic" className="mt-5">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
              <Sparkles className="h-5 w-5 text-muted-2" />
              <p className="mt-3 text-sm text-muted">Logic jumps coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
