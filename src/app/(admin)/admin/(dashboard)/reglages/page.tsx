import { getSiteSettings } from "@/lib/services/settings.service";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Réglages du site</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
