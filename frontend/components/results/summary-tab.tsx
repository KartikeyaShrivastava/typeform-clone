"use client";

import { Star } from "lucide-react";
import type { FormStatistics, QuestionStat } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="truncate text-paper">{label || "—"}</span>
        <span className="ml-2 shrink-0 text-muted-2">{count}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full bg-ember" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuestionStatCard({ stat }: { stat: QuestionStat }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-2">
        {stat.question_type.replace("_", " ")}
      </p>
      <h3 className="mt-1 font-display text-lg text-paper">{stat.question_text}</h3>

      {(stat.question_type === "multiple_choice" || stat.question_type === "dropdown") &&
        stat.option_counts && (
          <div className="mt-4 space-y-3">
            {Object.entries(stat.option_counts).map(([label, count]) => (
              <BarRow
                key={label}
                label={label}
                count={count}
                max={Math.max(...Object.values(stat.option_counts!))}
              />
            ))}
          </div>
        )}

      {stat.question_type === "yes_no" && stat.option_counts && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {Object.entries(stat.option_counts).map(([label, count]) => {
            const total = Object.values(stat.option_counts!).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={label} className="rounded-md border border-border-soft bg-surface-2 px-4 py-3 text-center">
                <p className="font-display text-2xl text-paper">{pct}%</p>
                <p className="mt-0.5 text-xs text-muted-2">{label}</p>
              </div>
            );
          })}
        </div>
      )}

      {stat.question_type === "rating" && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-ember text-ember" />
            <span className="font-display text-2xl text-paper">{(stat.average ?? 0).toFixed(1)}</span>
            <span className="text-sm text-muted-2">average</span>
          </div>
          {stat.distribution && (
            <div className="mt-3 space-y-2">
              {Object.entries(stat.distribution).map(([label, count]) => (
                <BarRow
                  key={label}
                  label={`${label} star${label === "1" ? "" : "s"}`}
                  count={count}
                  max={Math.max(...Object.values(stat.distribution!))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {stat.question_type === "number" && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Min", value: stat.min },
            { label: "Max", value: stat.max },
            { label: "Average", value: stat.average },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-border-soft bg-surface-2 px-3 py-3 text-center">
              <p className="font-display text-xl text-paper">{item.value ?? "—"}</p>
              <p className="mt-0.5 text-[11px] text-muted-2">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {(stat.question_type === "short_text" || stat.question_type === "long_text" || stat.question_type === "email") && (
        <div className="mt-4">
          <p className="text-sm text-muted">
            {stat.response_count ?? 0} response{stat.response_count === 1 ? "" : "s"}
          </p>
          {stat.recent_answers && stat.recent_answers.length > 0 && (
            <ul className="mt-3 space-y-2">
              {stat.recent_answers.slice(0, 5).map((a, i) => (
                <li key={i} className="rounded-md border border-border-soft bg-surface-2 px-3 py-2 text-sm text-paper">
                  “{a}”
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function SummaryTab({ stats, isLoading }: { stats: FormStatistics | undefined; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!stats || stats.total_responses === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-20 text-center">
        <p className="text-sm text-muted">Statistics will appear once you have responses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface px-5 py-4">
          <p className="font-display text-3xl text-paper">{stats.total_responses}</p>
          <p className="mt-1 text-xs text-muted-2">Total responses</p>
        </div>
        {stats.average_completion_seconds !== undefined && (
          <div className="rounded-lg border border-border bg-surface px-5 py-4">
            <p className="font-display text-3xl text-paper">{Math.round(stats.average_completion_seconds)}s</p>
            <p className="mt-1 text-xs text-muted-2">Avg. completion time</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {stats.questions.map((q) => (
          <QuestionStatCard key={q.question_id} stat={q} />
        ))}
      </div>
    </div>
  );
}
