import { useState, useEffect } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/useAdminSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion administrateur — Zender237" },
      {
        name: "description",
        content: "Accès sécurisé au back-office administrateur Zender237 : transactions, règlements et wallets.",
      },
      { property: "og:title", content: "Connexion administrateur — Zender237" },
      {
        property: "og:description",
        content: "Accès sécurisé au back-office administrateur Zender237.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const { admin, session, reason } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (admin) router.navigate({ to: "/admin" });
  }, [admin, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) {
      setError("Identifiants invalides. Vérifiez votre email et votre mot de passe.");
      return;
    }
    router.navigate({ to: "/admin" });
  };

  const accountError =
    reason === "not_admin"
      ? "Accès refusé — compte administrateur introuvable."
      : reason === "disabled"
        ? "Compte désactivé — contactez le responsable de la plateforme."
        : null;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <span className="font-display grid size-10 place-items-center rounded-xl bg-primary-foreground/15 text-xl font-bold">
            Z
          </span>
          <span className="font-display text-xl font-semibold">Zender237</span>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="font-display text-3xl leading-tight font-semibold">
            Le centre de contrôle opérationnel de Zender237.
          </h2>
          <p className="text-sm text-primary-foreground/80">
            Supervision des transactions, vérification des preuves, affectation aux partenaires, règlements bancaires
            et audit complet — en un seul endroit.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">Accès réservé aux administrateurs autorisés.</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-sm p-7">
          <div className="mb-6 space-y-1.5 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <h1 className="font-display text-xl font-semibold">Connexion administrateur</h1>
            <p className="text-sm text-muted-foreground">Back-office Zender237</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Identifiant</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zender237.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {(error || (session && accountError)) && (
              <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error ?? accountError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              Se connecter
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Compte oublié ou bloqué ? Contactez le responsable de la plateforme.
          </p>
        </Card>
      </div>
    </div>
  );
}
