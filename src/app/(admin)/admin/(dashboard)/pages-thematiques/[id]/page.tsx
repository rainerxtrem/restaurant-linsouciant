import { notFound } from "next/navigation";
import { getThemePage } from "@/lib/services/theme-page.service";
import { ThemePageForm } from "@/components/admin/theme-page-form";

export const dynamic = "force-dynamic";

export default async function EditThemePagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getThemePage(id);
  if (!page) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Modifier « {page.title} »</h1>
      <ThemePageForm page={page} />
    </div>
  );
}
