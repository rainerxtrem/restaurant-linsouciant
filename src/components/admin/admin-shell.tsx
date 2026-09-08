"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Images,
  FileText,
  Mail,
  Gift,
  Send,
  Settings,
  Users,
  LogOut,
  Menu as MenuIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/app/(admin)/admin/(dashboard)/actions";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/menus", label: "Cartes & menus", icon: UtensilsCrossed },
  { href: "/admin/photos", label: "Photos", icon: Images },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/bons-cadeaux", label: "Bons cadeaux", icon: Gift },
  { href: "/admin/newsletter", label: "Newsletter", icon: Send },
  { href: "/admin/reglages", label: "Réglages", icon: Settings },
  { href: "/admin/administrateurs", label: "Administrateurs", icon: Users, superAdminOnly: true },
];

export function AdminShell({
  children,
  userName,
  isSuperAdmin,
}: {
  children: React.ReactNode;
  userName: string;
  isSuperAdmin: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = NAV.filter((item) => !item.superAdminOnly || isSuperAdmin);

  return (
    <div className="flex min-h-screen bg-cream-100 text-ink-800">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 shrink-0 border-r border-ink-900/10 bg-white transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-ink-900/10 px-5 font-display text-lg text-ink-900">
          L&apos;Insouciant
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {items.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-wine-700 text-cream-50" : "text-ink-600 hover:bg-cream-100"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-ink-900/10 p-3">
          <p className="px-3 pb-2 text-xs text-ink-400">{userName}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-600 hover:bg-cream-100"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-ink-900/10 bg-white px-4 lg:hidden">
          <button onClick={() => setOpen((v) => !v)} aria-label="Menu">
            <MenuIcon className="h-5 w-5" />
          </button>
          <span className="font-display text-ink-900">Administration</span>
        </header>
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
