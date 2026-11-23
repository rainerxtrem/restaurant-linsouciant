import { ThemePageForm } from "@/components/admin/theme-page-form";

export default function NewThemePagePage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Nouvelle page thématique</h1>
      <ThemePageForm page={null} />
    </div>
  );
}
