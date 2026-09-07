import { FilePlus2, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onCreate, loading }: { onCreate: () => void; loading?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-28 text-center">
      {/* Decorative icon cluster */}
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ember/10 text-ember">
          <FilePlus2 className="h-7 w-7" />
        </div>
        <div className="absolute -right-3 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-periwinkle/10 text-periwinkle">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="absolute -bottom-1 -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success">
          <Zap className="h-3 w-3" />
        </div>
      </div>

      <h3 className="mt-7 font-display text-2xl text-paper">Create your first form</h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
        Build beautiful, conversational forms that people actually enjoy filling out.
        One question at a time — no scrolling walls of fields.
      </p>
      <Button className="mt-8" size="lg" onClick={onCreate} loading={loading}>
        <FilePlus2 className="h-4 w-4" /> Create a form
      </Button>
    </div>
  );
}
