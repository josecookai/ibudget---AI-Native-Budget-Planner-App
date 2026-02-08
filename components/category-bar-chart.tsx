import { cn } from "@/lib/utils";

export type BarDatum = { label: string; value: number };

export function CategoryBarChart({
  data,
  className,
}: {
  data: BarDatum[];
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className={cn("space-y-3", className)}>
      {data.map((d) => {
        const pct = Math.round((d.value / max) * 100);
        return (
          <div key={d.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-900">{d.label}</span>
              <span className="tabular-nums text-zinc-600">${d.value.toFixed(2)}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-200">
              <div
                className="h-2 rounded-full bg-zinc-900"
                style={{ width: `${pct}%` }}
                aria-hidden
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

