import { notFound } from "next/navigation";
import { getMenu } from "@/lib/services/menu.service";
import { MenuForm } from "@/components/admin/menu-form";

export const dynamic = "force-dynamic";

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const menu = await getMenu(id);
  if (!menu) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Modifier « {menu.name} »</h1>
      <MenuForm menu={menu} />
    </div>
  );
}
