import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/admin/ui-bits";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
};

export function DataTable<T extends { id?: string }>({
  columns,
  rows,
  loading,
  empty = "Aucune donnée disponible.",
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  loading?: boolean;
  empty?: string;
}) {
  return (
    <Card className="overflow-hidden p-0">
      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11" />
          ))}
        </div>
      ) : !rows || rows.length === 0 ? (
        <EmptyState message={empty} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={cn("px-4 py-3 font-medium", c.align === "right" && "text-right")}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, i) => (
                <tr key={(row.id as string) ?? i} className="hover:bg-muted/40">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn("px-4 py-3 align-top", c.align === "right" && "text-right")}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
