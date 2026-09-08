"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import type { SiteSettings, OpeningDay } from "@/lib/services/settings.service";
import { OpeningHoursEditor, defaultOpeningHours } from "@/components/admin/opening-hours-editor";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import { saveSettingsAction, type SettingsActionState } from "@/app/(admin)/admin/(dashboard)/reglages/actions";

const inputCls = "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-ink-900/10 bg-white p-5">
      <h2 className="mb-4 font-medium text-ink-800">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  full?: boolean;
}) {
  return (
    <label className={`block text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-ink-600">{label}</span>
      {textarea ? (
        <textarea className={inputCls} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function ImageField({
  label,
  media,
  onPick,
  onClear,
}: {
  label: string;
  media: { url: string } | null;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="text-sm">
      <span className="mb-1 block text-xs font-medium text-ink-600">{label}</span>
      <div className="flex items-center gap-3">
        {media ? (
          <span className="relative h-14 w-14 overflow-hidden rounded border border-ink-100">
            <Image src={media.url} alt="" fill className="object-contain" sizes="56px" />
          </span>
        ) : null}
        <button type="button" onClick={onPick} className="rounded border border-ink-200 px-3 py-1 text-xs">
          Choisir
        </button>
        {media ? (
          <button type="button" onClick={onClear} className="text-xs text-red-600">
            Retirer
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState<SettingsActionState, FormData>(saveSettingsAction, {});
  const s = settings;

  const [f, setF] = useState({
    siteName: s.siteName,
    siteNameEn: s.siteNameEn ?? "",
    tagline: s.tagline,
    taglineEn: s.taglineEn ?? "",
    intro: s.intro ?? "",
    introEn: s.introEn ?? "",
    addressLine: s.addressLine,
    postalCode: s.postalCode,
    city: s.city,
    phone: s.phone,
    email: s.email,
    parkingNote: s.parkingNote ?? "",
    parkingNoteEn: s.parkingNoteEn ?? "",
    servicesNote: s.servicesNote ?? "",
    servicesNoteEn: s.servicesNoteEn ?? "",
    paymentNote: s.paymentNote ?? "",
    paymentNoteEn: s.paymentNoteEn ?? "",
    zenchefBookingUrl: s.zenchefBookingUrl ?? "",
    zenchefNewsletterUrl: s.zenchefNewsletterUrl ?? "",
    zenchefRestaurantId: s.zenchefRestaurantId ?? "",
    facebookUrl: s.facebookUrl ?? "",
    instagramUrl: s.instagramUrl ?? "",
    googleMapsUrl: s.googleMapsUrl ?? "",
    mapEmbedUrl: s.mapEmbedUrl ?? "",
    legalCompanyName: s.legalCompanyName ?? "",
    legalSiret: s.legalSiret ?? "",
    legalCapital: s.legalCapital ?? "",
    legalPublicationDirector: s.legalPublicationDirector ?? "",
    legalHost: s.legalHost ?? "",
    legalRcsCity: s.legalRcsCity ?? "",
    legalVatNumber: s.legalVatNumber ?? "",
    seoDefaultTitle: s.seoDefaultTitle ?? "",
    seoDefaultDescription: s.seoDefaultDescription ?? "",
    footerText: s.footerText ?? "",
    footerTextEn: s.footerTextEn ?? "",
  });
  const set = (k: keyof typeof f) => (v: string) => setF((prev) => ({ ...prev, [k]: v }));

  const [hours, setHours] = useState<OpeningDay[]>(
    Array.isArray(s.openingHours) && s.openingHours.length === 7
      ? (s.openingHours as unknown as OpeningDay[])
      : defaultOpeningHours()
  );

  type ImgRef = { id: string; url: string } | null;
  const toRef = (m: { id: string; url: string } | null): ImgRef => (m ? { id: m.id, url: m.url } : null);
  const [images, setImages] = useState<{ logo: ImgRef; favicon: ImgRef; ogImage: ImgRef; heroImage: ImgRef; aboutImage: ImgRef }>({
    logo: toRef(s.logo),
    favicon: toRef(s.favicon),
    ogImage: toRef(s.ogImage),
    heroImage: toRef(s.heroImage),
    aboutImage: toRef(s.aboutImage),
  });
  const [picker, setPicker] = useState<null | keyof typeof images>(null);

  function handlePick(media: PickedMedia[]) {
    const first = media[0];
    if (!picker || !first) return;
    setImages((prev) => ({ ...prev, [picker]: { id: first.id, url: first.url } }));
    setPicker(null);
  }

  function payload() {
    return JSON.stringify({
      ...f,
      openingHours: hours,
      logoId: images.logo?.id ?? null,
      faviconId: images.favicon?.id ?? null,
      ogImageId: images.ogImage?.id ?? null,
      heroImageId: images.heroImage?.id ?? null,
      aboutImageId: images.aboutImage?.id ?? null,
    });
  }

  return (
    <form action={formAction} className="max-w-4xl space-y-6">
      <input type="hidden" name="payload" value={payload()} />

      <Section title="Identité">
        <Field label="Nom du site (FR)" value={f.siteName} onChange={set("siteName")} />
        <Field label="Nom du site (EN)" value={f.siteNameEn} onChange={set("siteNameEn")} />
        <Field label="Accroche (FR)" value={f.tagline} onChange={set("tagline")} />
        <Field label="Accroche (EN)" value={f.taglineEn} onChange={set("taglineEn")} />
        <Field label="Texte d'introduction / philosophie (FR)" value={f.intro} onChange={set("intro")} textarea full />
        <Field label="Texte d'introduction (EN)" value={f.introEn} onChange={set("introEn")} textarea full />
      </Section>

      <Section title="Coordonnées">
        <Field label="Adresse" value={f.addressLine} onChange={set("addressLine")} />
        <Field label="Code postal" value={f.postalCode} onChange={set("postalCode")} />
        <Field label="Ville" value={f.city} onChange={set("city")} />
        <Field label="Téléphone" value={f.phone} onChange={set("phone")} />
        <Field label="Email public" value={f.email} onChange={set("email")} />
      </Section>

      <section className="rounded-lg border border-ink-900/10 bg-white p-5">
        <h2 className="mb-4 font-medium text-ink-800">Horaires d&apos;ouverture</h2>
        <OpeningHoursEditor value={hours} onChange={setHours} />
      </section>

      <Section title="Réservation (Zenchef)">
        <Field label="Identifiant restaurant Zenchef (rid)" value={f.zenchefRestaurantId} onChange={set("zenchefRestaurantId")} />
        <Field label="URL de réservation Zenchef" value={f.zenchefBookingUrl} onChange={set("zenchefBookingUrl")} />
        <Field label="URL d'inscription newsletter Zenchef (facultatif)" value={f.zenchefNewsletterUrl} onChange={set("zenchefNewsletterUrl")} full />
      </Section>

      <Section title="Réseaux sociaux & carte">
        <Field label="Facebook" value={f.facebookUrl} onChange={set("facebookUrl")} />
        <Field label="Instagram" value={f.instagramUrl} onChange={set("instagramUrl")} />
        <Field label="Lien Google Maps" value={f.googleMapsUrl} onChange={set("googleMapsUrl")} />
        <Field label="URL d'intégration de la carte (iframe src)" value={f.mapEmbedUrl} onChange={set("mapEmbedUrl")} textarea full />
      </Section>

      <Section title="Services & paiement">
        <Field label="Stationnement (FR)" value={f.parkingNote} onChange={set("parkingNote")} />
        <Field label="Stationnement (EN)" value={f.parkingNoteEn} onChange={set("parkingNoteEn")} />
        <Field label="Services (FR)" value={f.servicesNote} onChange={set("servicesNote")} textarea />
        <Field label="Services (EN)" value={f.servicesNoteEn} onChange={set("servicesNoteEn")} textarea />
        <Field label="Moyens de paiement (FR)" value={f.paymentNote} onChange={set("paymentNote")} textarea />
        <Field label="Moyens de paiement (EN)" value={f.paymentNoteEn} onChange={set("paymentNoteEn")} textarea />
      </Section>

      <section className="rounded-lg border border-ink-900/10 bg-white p-5">
        <h2 className="mb-4 font-medium text-ink-800">Images</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageField label="Logo" media={images.logo} onPick={() => setPicker("logo")} onClear={() => setImages((p) => ({ ...p, logo: null }))} />
          <ImageField label="Favicon" media={images.favicon} onPick={() => setPicker("favicon")} onClear={() => setImages((p) => ({ ...p, favicon: null }))} />
          <ImageField label="Image de partage (Open Graph)" media={images.ogImage} onPick={() => setPicker("ogImage")} onClear={() => setImages((p) => ({ ...p, ogImage: null }))} />
          <ImageField label="Image du bandeau d'accueil" media={images.heroImage} onPick={() => setPicker("heroImage")} onClear={() => setImages((p) => ({ ...p, heroImage: null }))} />
          <ImageField label="Image « En cuisine » (accueil)" media={images.aboutImage} onPick={() => setPicker("aboutImage")} onClear={() => setImages((p) => ({ ...p, aboutImage: null }))} />
        </div>
      </section>

      <Section title="Mentions légales">
        <Field label="Raison sociale" value={f.legalCompanyName} onChange={set("legalCompanyName")} />
        <Field label="SIRET" value={f.legalSiret} onChange={set("legalSiret")} />
        <Field label="Capital social" value={f.legalCapital} onChange={set("legalCapital")} />
        <Field label="Ville du RCS" value={f.legalRcsCity} onChange={set("legalRcsCity")} />
        <Field label="N° TVA intracommunautaire" value={f.legalVatNumber} onChange={set("legalVatNumber")} />
        <Field label="Directeur de la publication" value={f.legalPublicationDirector} onChange={set("legalPublicationDirector")} />
        <Field label="Hébergeur" value={f.legalHost} onChange={set("legalHost")} textarea full />
      </Section>

      <Section title="Référencement & pied de page">
        <Field label="Titre SEO par défaut" value={f.seoDefaultTitle} onChange={set("seoDefaultTitle")} />
        <Field label="Description SEO par défaut" value={f.seoDefaultDescription} onChange={set("seoDefaultDescription")} />
        <Field label="Texte du pied de page (FR)" value={f.footerText} onChange={set("footerText")} textarea />
        <Field label="Texte du pied de page (EN)" value={f.footerTextEn} onChange={set("footerTextEn")} textarea />
      </Section>

      <MediaPicker open={picker !== null} onClose={() => setPicker(null)} onSelect={handlePick} />

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-cta">
          {pending ? "Enregistrement…" : "Enregistrer les réglages"}
        </button>
        {state.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
        {state.success ? <span className="text-sm text-green-700">Réglages enregistrés.</span> : null}
      </div>
    </form>
  );
}
