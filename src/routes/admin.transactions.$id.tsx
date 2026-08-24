import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Check, X, Ban, Paperclip, UserPlus } from "lucide-react";
import { toast } from "sonner";

import {
  getTransaction,
  decideTransaction,
  addExecutionProof,
  assignTransaction,
  listPartners,
} from "@/lib/admin.functions";
import { PageHeader, StatusPill, Field, EmptyState } from "@/components/admin/ui-bits";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { money, dateTime, label, TX_TYPE_LABELS } from "@/lib/format";

export const Route = createFileRoute("/admin/transactions/$id")({
  head: () => ({
    meta: [
      { title: "Détail transaction — Admin Zender237" },
      {
        name: "description",
        content: "Examen d'une transaction Zender237 : preuves, décision, affectation partenaire et historique.",
      },
      { property: "og:title", content: "Détail transaction — Admin Zender237" },
      { property: "og:description", content: "Preuves, décision et affectation d'une transaction Zender237." },
    ],
  }),
  component: TransactionDetail,
});

function TransactionDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fetchTx = useServerFn(getTransaction);
  const fetchPartners = useServerFn(listPartners);
  const decide = useServerFn(decideTransaction);
  const addProof = useServerFn(addExecutionProof);
  const assign = useServerFn(assignTransaction);

  const [reason, setReason] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [responsibility, setResponsibility] = useState("execution");

  const { data, isPending } = useQuery({
    queryKey: ["transaction", id],
    queryFn: () => fetchTx({ data: { id } }),
  });
  const partners = useQuery({ queryKey: ["partners"], queryFn: () => fetchPartners() });

  const refresh = () => qc.invalidateQueries({ queryKey: ["transaction", id] });

  const decideMut = useMutation({
    mutationFn: (status: string) => decide({ data: { id, status, reason: reason || undefined } }),
    onSuccess: () => {
      toast.success("Décision enregistrée");
      setReason("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const proofMut = useMutation({
    mutationFn: () => addProof({ data: { id, fileUrl: proofUrl, description: proofNote || undefined } }),
    onSuccess: () => {
      toast.success("Preuve d'exécution ajoutée");
      setProofUrl("");
      setProofNote("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignMut = useMutation({
    mutationFn: () => assign({ data: { id, partnerId, responsibility } }),
    onSuccess: () => {
      toast.success("Transaction affectée");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isPending) return <Skeleton className="h-96" />;
  if (!data) return <EmptyState message="Transaction introuvable." />;

  const tx = data.tx;

  return (
    <div className="space-y-5">
      <Link to="/admin/transactions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Retour aux transactions
      </Link>

      <PageHeader
        title={`${label(TX_TYPE_LABELS, tx.type)} · ${money(tx.amount)}`}
        subtitle={`Créée le ${dateTime(tx.created_at)}`}
        actions={<StatusPill status={tx.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="grid gap-4 p-4 sm:grid-cols-3">
            <Field label="Montant" value={money(tx.amount)} />
            <Field label="Frais" value={money(tx.fee_amount)} />
            <Field label="Étape" value={String(tx.workflow_stage ?? "—")} />
            <Field label="Expéditeur" value={tx.sender_name ?? data.profile?.username ?? "—"} />
            <Field label="Téléphone expéditeur" value={tx.sender_phone_number ?? "—"} />
            <Field label="Pays destinataire" value={tx.recipient_country ?? "—"} />
            <Field label="Bénéficiaire" value={tx.recipient_name ?? "—"} />
            <Field label="Numéro bénéficiaire" value={tx.recipient_mobile_number ?? "—"} />
            <Field label="Numéro MoMo dépôt" value={data.momo ? `${data.momo.holder_name} · ${data.momo.phone_number}` : "—"} />
            <Field
              label="Client"
              value={
                data.profile ? (
                  <Link to="/admin/users/$id" params={{ id: data.profile.id }} className="text-primary hover:underline">
                    {data.profile.username}
                  </Link>
                ) : (
                  "—"
                )
              }
            />
            <Field label="Confirmée le" value={dateTime(tx.confirmed_at)} />
            <Field label="Motif de rejet" value={tx.rejection_reason ?? "—"} />
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="font-display text-sm font-semibold tracking-wide uppercase">Preuves du client</h2>
            {data.proofs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune preuve envoyée.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.proofs.map((p: any) => (
                  <a
                    key={p.id}
                    href={p.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm hover:bg-muted/50"
                  >
                    <Paperclip className="size-4 text-muted-foreground" />
                    <span className="truncate">{p.file_name ?? p.file_url}</span>
                  </a>
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="font-display text-sm font-semibold tracking-wide uppercase">Preuves d'exécution</h2>
            {data.execProofs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune preuve d'exécution enregistrée.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.execProofs.map((p: any) => (
                  <li key={p.id} className="rounded-lg border border-border p-3">
                    <a href={p.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {p.file_url}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {p.description ?? "—"} · {dateTime(p.uploaded_at ?? p.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid gap-2 sm:grid-cols-[2fr_2fr_auto]">
              <Input value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="URL du justificatif" />
              <Input value={proofNote} onChange={(e) => setProofNote(e.target.value)} placeholder="Description (optionnel)" />
              <Button disabled={!proofUrl || proofMut.isPending} onClick={() => proofMut.mutate()}>
                Ajouter
              </Button>
            </div>
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="font-display text-sm font-semibold tracking-wide uppercase">Historique</h2>
            {data.history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun changement de statut.</p>
            ) : (
              <ol className="space-y-2">
                {data.history.map((h: any) => (
                  <li key={h.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-xs text-muted-foreground">{dateTime(h.created_at)}</span>
                    <StatusPill status={h.previous_status} />
                    <span className="text-muted-foreground">→</span>
                    <StatusPill status={h.new_status} />
                    {h.reason ? <span className="text-xs text-muted-foreground">({h.reason})</span> : null}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="space-y-3 p-4">
            <h2 className="font-display text-sm font-semibold tracking-wide uppercase">Décision</h2>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motif (obligatoire pour un rejet ou une annulation)"
              rows={3}
            />
            <div className="grid gap-2">
              <Button
                className="gap-1.5"
                disabled={decideMut.isPending}
                onClick={() => decideMut.mutate("under_review")}
              >
                Passer en examen
              </Button>
              <Button
                variant="default"
                className="gap-1.5"
                disabled={decideMut.isPending}
                onClick={() => decideMut.mutate("confirmed")}
              >
                <Check className="size-4" /> Confirmer
              </Button>
              <Button
                variant="destructive"
                className="gap-1.5"
                disabled={decideMut.isPending || !reason}
                onClick={() => decideMut.mutate("rejected")}
              >
                <X className="size-4" /> Rejeter
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                disabled={decideMut.isPending || !reason}
                onClick={() => decideMut.mutate("cancelled")}
              >
                <Ban className="size-4" /> Annuler
              </Button>
            </div>
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="font-display text-sm font-semibold tracking-wide uppercase">Affectation partenaire</h2>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Choisir un partenaire…</option>
              {(partners.data?.rows ?? [])
                .filter((p: any) => p.active)
                .map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
            </select>
            <select
              value={responsibility}
              onChange={(e) => setResponsibility(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="execution">Exécution</option>
              <option value="collection">Collecte</option>
              <option value="delivery">Remise</option>
            </select>
            <Button className="w-full gap-1.5" disabled={!partnerId || assignMut.isPending} onClick={() => assignMut.mutate()}>
              <UserPlus className="size-4" /> Affecter
            </Button>
            {data.assignments.length > 0 ? (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {data.assignments.map((a: any) => (
                  <li key={a.id}>
                    {a.responsibility} · {a.status} · {dateTime(a.assigned_at ?? a.created_at)}
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
