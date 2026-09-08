import { notFound } from "next/navigation";
import { getPage } from "@/lib/services/page.service";
import { PageEditor } from "@/components/admin/page-editor";

export const dynamic = "force-dynamic";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getPage(id);
  if (!page) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">{page.title}</h1>
      <PageEditor page={page} />
    </div>
  );
}
