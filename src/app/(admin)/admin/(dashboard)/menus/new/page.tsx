import { MenuForm } from "@/components/admin/menu-form";
import { listAllThemePages } from "@/lib/services/theme-page.service";

export const dynamic = "force-dynamic";

export default async function NewMenuPage() {
  const themePages = await listAllThemePages();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Nouveau menu</h1>
      <MenuForm menu={null} themePages={themePages.map((p) => ({ id: p.id, title: p.title }))} />
    </div>
  );
}
