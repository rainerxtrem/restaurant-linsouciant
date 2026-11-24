import { listDistinctions } from "@/lib/services/house.service";
import { ListEditor } from "@/components/admin/list-editor";
import { saveDistinctionsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDistinctionsPage() {
  const distinctions = await listDistinctions();
  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Distinctions &amp; presse</h1>
      <p className="mb-6 mt-2 max-w-2xl text-sm text-ink-500">
        Affichées dans une bande discrète en bas de chaque page. Logo facultatif : utilisez le fichier officiel
        fourni par le guide (de préférence un PNG ou SVG sur fond transparent) ; il sera affiché en monochrome
        pour rester sobre. Sans logo, le nom est composé en typographie.
      </p>
      <ListEditor
        action={saveDistinctionsAction}
        itemLabel="Distinction"
        imageLabel="Logo (facultatif)"
        addLabel="Ajouter une distinction"
        emptyText="Aucune distinction pour l'instant."
        fields={[
          { key: "name", label: "Nom", required: true, placeholder: "Guide MICHELIN" },
          { key: "url", label: "Lien (facultatif)", type: "url", placeholder: "https://guide.michelin.com/…" },
          { key: "detail", label: "Détail (FR)", placeholder: "Assiette Michelin 2026" },
          { key: "detailEn", label: "Détail (EN)", placeholder: "Michelin Plate 2026" },
        ]}
        initial={distinctions.map((d) => ({
          values: { name: d.name, url: d.url ?? "", detail: d.detail ?? "", detailEn: d.detailEn ?? "" },
          image: d.image ? { id: d.image.id, url: d.image.url } : null,
        }))}
      />
    </div>
  );
}
