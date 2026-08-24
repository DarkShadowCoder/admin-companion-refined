import { useState, type ReactNode } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  Users,
  Handshake,
  Wallet,
  Smartphone,
  Percent,
  Boxes,
  Globe2,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { AdminAccount } from "@/hooks/useAdminSession";
import { Button } from "@/components/ui/button";

const NAV: { group: string; items: { to: string; label: string; icon: typeof Users }[] }[] = [
  {
    group: "Principal",
    items: [
      { to: "/admin", label: "Accueil", icon: LayoutDashboard },
      { to: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
      { to: "/admin/settlements", label: "Règlements", icon: Landmark },
      { to: "/admin/users", label: "Utilisateurs", icon: Users },
    ],
  },
  {
    group: "Opérations",
    items: [
      { to: "/admin/partners", label: "Partenaires", icon: Handshake },
      { to: "/admin/wallets", label: "Wallets", icon: Wallet },
      { to: "/admin/momo", label: "Mobile Money", icon: Smartphone },
      { to: "/admin/tariffs", label: "Tarifs", icon: Percent },
      { to: "/admin/batches", label: "Lots journaliers", icon: Boxes },
    ],
  },
  {
    group: "KmerDiaspora",
    items: [{ to: "/admin/kmerdiaspora", label: "Vue d'ensemble", icon: Globe2 }],
  },
  {
    group: "Système",
    items: [
      { to: "/admin/audit", label: "Audit", icon: ScrollText },
      { to: "/admin/settings", label: "Paramètres", icon: Settings },
    ],
  },
];

export function AdminShell({ admin, children }: { admin: AdminAccount; children: ReactNode }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/login" });
  };

  const isActive = (to: string) => (to === "/admin" ? pathname === "/admin" : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur">
        <button
          className="grid size-9 place-items-center rounded-lg border border-border lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
        <Link to="/admin" className="flex items-center gap-2">
          <span className="font-display grid size-9 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            Z
          </span>
          <span className="font-display hidden text-lg font-semibold tracking-tight sm:block">
            Zender<span className="text-primary">237</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <button
            className="relative grid size-9 place-items-center rounded-lg border border-border text-muted-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-border px-2.5 py-1.5">
            <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {admin.full_name?.slice(0, 2).toUpperCase()}
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium">{admin.full_name}</p>
              <p className="text-[11px] text-muted-foreground capitalize">{admin.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Quitter</span>
          </Button>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "fixed inset-y-16 left-0 z-30 w-64 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar p-3 transition-transform lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {NAV.map((section) => (
            <div key={section.group} className="mb-5">
              <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {section.group}
              </p>
              <nav className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.to)
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
