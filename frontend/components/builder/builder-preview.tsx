"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { Form } from "@/lib/types";
import { FormRunner } from "@/components/respondent/form-runner";
import { ThankYouScreen } from "@/components/respondent/thank-you";
import { Button } from "@/components/ui/button";

export function BuilderPreview({ form }: { form: Form }) {
  const [key, setKey] = useState(0);
  const [done, setDone] = useState(false);

  if (form.questions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-muted">Add a question to preview your form.</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-y-auto">
      <div className="absolute right-4 top-4 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setDone(false);
            setKey((k) => k + 1);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Restart preview
        </Button>
      </div>
      {done ? (
        <ThankYouScreen
          title={form.thank_you_title ?? "Thank you!"}
          message={form.thank_you_message ?? "Your response has been recorded."}
          accent={(form.theme_config?.primary_color as string) ?? "#FF6B45"}
        />
      ) : (
        <FormRunner key={key} form={form} onComplete={() => setDone(true)} />
      )}
    </div>
  );
}
