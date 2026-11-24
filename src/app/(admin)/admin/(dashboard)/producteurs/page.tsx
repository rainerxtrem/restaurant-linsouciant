import { listProducers } from "@/lib/services/house.service";
import { ListEditor } from "@/components/admin/list-editor";
import { saveProducersAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProducersPage() {
  const producers = await listProducers();
  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Nos producteurs</h1>
      <p className="mb-6 mt-2 max-w-2xl text-sm text-ink-500">
        Affichés dans la section « Nos producteurs » de la page La maison. La section reste masquée tant que
        la liste est vide.
      </p>
      <ListEditor
        action={saveProducersAction}
        itemLabel="Producteur"
        imageLabel="Photo"
        addLabel="Ajouter un producteur"
        emptyText="Aucun producteur pour l'instant."
        fields={[
          { key: "name", label: "Nom", required: true, placeholder: "Ferme du Grand Clos" },
          { key: "location", label: "Lieu", placeholder: "Yvré-l'Évêque (72)" },
          { key: "craft", label: "Métier / produit (FR)", placeholder: "Maraîcher bio" },
          { key: "craftEn", label: "Métier / produit (EN)", placeholder: "Organic market gardener" },
          { key: "description", label: "Quelques mots (FR)", type: "textarea" },
          { key: "descriptionEn", label: "Quelques mots (EN)", type: "textarea" },
          { key: "url", label: "Site web (facultatif)", type: "url", placeholder: "https://…", full: true },
        ]}
        initial={producers.map((p) => ({
          values: {
            name: p.name,
            location: p.location ?? "",
            craft: p.craft ?? "",
            craftEn: p.craftEn ?? "",
            description: p.description ?? "",
            descriptionEn: p.descriptionEn ?? "",
            url: p.url ?? "",
          },
          image: p.image ? { id: p.image.id, url: p.image.url } : null,
        }))}
      />
    </div>
  );
}
