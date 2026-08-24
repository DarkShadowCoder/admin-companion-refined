import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Landmark,
  Users,
  Wallet,
  XCircle,
  Handshake,
  Coins,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getDashboard } from "@/lib/admin.functions";
import { KpiCard, PageHeader, StatusPill, EmptyState } from "@/components/admin/ui-bits";
import { Card } from "@/components/ui/card";
import { money, dateTime, label, TX_TYPE_LABELS } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Console opérationnelle — Admin Zender237" },
      {
        name: "description",
        content: "Vue temps réel des transactions à traiter, règlements en attente et volumes Zender237.",
      },
      { property: "og:title", content: "Console opérationnelle — Admin Zender237" },
      { property: "og:description", content: "Transactions à traiter, règlements et volumes Zender237." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const fetchDashboard = useServerFn(getDashboard);
  const { data, isPending } = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDashboard() });

  if (isPending || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const k = data.kpis;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Console opérationnelle"
        subtitle="Qu'est-ce qui nécessite votre intervention maintenant ?"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="À examiner" value={k.toReview} tone="warning" icon={<AlertTriangle className="size-5" />} />
        <KpiCard title="Preuves attendues" value={k.pendingProof} tone="warning" icon={<Clock className="size-5" />} />
        <KpiCard title="Confirmées" value={k.confirmed} tone="success" icon={<CheckCircle2 className="size-5" />} />
        <KpiCard title="Rejetées" value={k.rejected} tone="danger" icon={<XCircle className="size-5" />} />
        <KpiCard
          title="Règlements en attente"
          value={k.pendingSettlements}
          icon={<Landmark className="size-5" />}
        />
        <KpiCard title="Solde disponible" value={money(k.available)} icon={<Wallet className="size-5" />} />
        <KpiCard title="Montant en attente" value={money(k.pending)} icon={<Coins className="size-5" />} />
        <KpiCard
          title="Utilisateurs"
          value={k.users}
          hint={`${k.partners} partenaires actifs`}
          icon={<Users className="size-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <h2 className="font-display mb-3 text-base font-semibold">Volumes des 14 derniers jours</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series}>
                <defs>
                  <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={60} />
                <Tooltip
                  formatter={(v: number) => money(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#vol)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-display mb-3 text-base font-semibold">Répartition par type</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.mix.map((m) => ({ ...m, type: label(TX_TYPE_LABELS, m.type) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="type" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={30} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                />
                <Bar dataKey="count" fill="var(--color-brand-yellow)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">À traiter maintenant</h2>
            <Link to="/admin/transactions" className="text-xs font-medium text-primary hover:underline">
              Tout voir
            </Link>
          </div>
          {data.queue.length === 0 ? (
            <EmptyState message="Aucune transaction en attente d'intervention." />
          ) : (
            <ul className="divide-y divide-border">
              {data.queue.map((t: any) => (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {label(TX_TYPE_LABELS, t.type)} · {money(t.amount)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.sender_name ?? "—"} → {t.recipient_name ?? "—"} · {dateTime(t.created_at)}
                    </p>
                  </div>
                  <StatusPill status={t.status} />
                  <Link
                    to="/admin/transactions/$id"
                    params={{ id: t.id }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Traiter
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Activité récente</h2>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Handshake className="size-3.5" /> {money(data.kpis.feesCollected)} de frais
            </span>
          </div>
          {data.recent.length === 0 ? (
            <EmptyState message="Aucune activité récente." />
          ) : (
            <ul className="divide-y divide-border">
              {data.recent.map((t: any) => (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {label(TX_TYPE_LABELS, t.type)} · {money(t.amount)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{dateTime(t.created_at)}</p>
                  </div>
                  <StatusPill status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
