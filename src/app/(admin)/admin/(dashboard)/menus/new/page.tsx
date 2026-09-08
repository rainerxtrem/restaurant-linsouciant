import { MenuForm } from "@/components/admin/menu-form";

export default function NewMenuPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Nouveau menu</h1>
      <MenuForm menu={null} />
    </div>
  );
}
