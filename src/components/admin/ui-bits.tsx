import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TX_STATUS_LABELS, label } from "@/lib/format";

const STATUS_TONE: Record<string, string> = {
  confirmed: "bg-success/12 text-success border-success/25",
  completed: "bg-success/12 text-success border-success/25",
  executed: "bg-success/12 text-success border-success/25",
  approved: "bg-success/12 text-success border-success/25",
  active: "bg-success/12 text-success border-success/25",
  rejected: "bg-destructive/12 text-destructive border-destructive/25",
  failed: "bg-destructive/12 text-destructive border-destructive/25",
  cancelled: "bg-muted text-muted-foreground border-border",
  under_review: "bg-warning/15 text-warning border-warning/30",
  pending_proof: "bg-warning/15 text-warning border-warning/30",
  pending: "bg-warning/15 text-warning border-warning/30",
};

export function StatusPill({ status, className }: { status: unknown; className?: string }) {
  const key = String(status ?? "");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_TONE[key] ?? "bg-secondary text-secondary-foreground border-border",
        className,
      )}
    >
      {label(TX_STATUS_LABELS, key) || "—"}
    </span>
  );
}

export function KpiCard({
  title,
  value,
  hint,
  icon,
  tone = "default",
}: {
  title: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "warning" | "success" | "danger";
}) {
  const toneRing =
    tone === "warning"
      ? "text-warning bg-warning/10"
      : tone === "success"
        ? "text-success bg-success/10"
        : tone === "danger"
          ? "text-destructive bg-destructive/10"
          : "text-primary bg-primary/10";
  return (
    <Card className="flex flex-row items-center gap-4 p-4">
      {icon ? (
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", toneRing)}>{icon}</span>
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
        <p className="font-display truncate text-xl font-semibold text-foreground">{value}</p>
        {hint ? <p className="truncate text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </Card>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{message}</p>;
}

export function Field({ label: l, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{l}</p>
      <p className="text-sm font-medium break-words text-foreground">{value ?? "—"}</p>
    </div>
  );
}
