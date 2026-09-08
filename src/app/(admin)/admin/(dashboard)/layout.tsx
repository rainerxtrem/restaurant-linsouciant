import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    redirect("/admin/login");
  }
  return (
    <AdminShell userName={session.user.name} isSuperAdmin={session.user.role === "SUPER_ADMIN"}>
      {children}
    </AdminShell>
  );
}
