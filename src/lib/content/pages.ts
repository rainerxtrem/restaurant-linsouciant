/**
 * Registre du contenu éditable de chaque page du site (Admin → Pages).
 *
 * Chaque champ a une valeur par défaut — le texte d'origine du site — tant
 * qu'il n'est pas modifié dans l'admin :
 *  - `msg`  : clé du fichier de traductions (messages/fr.json, en.json) ;
 *  - `fr`/`en` : texte littéral.
 * Un champ `setting` lit / écrit directement une colonne de SiteSetting
 * (même donnée que dans Réglages : modifier à un endroit met à jour l'autre).
 * Les champs `image` sans réglage associé retombent, s'ils sont vides, sur
 * la photo choisie automatiquement dans les albums (logique de chaque page).
 */

export type TextDefault = { msg: string } | { fr: string; en: string };

export interface TextField {
  key: string;
  label: string;
  type: "text" | "textarea";
  default?: TextDefault;
  /** Colonnes SiteSetting (FR, EN facultatif). */
  setting?: { fr: string; en?: string };
  /** La colonne SiteSetting ne peut pas être vide. */
  required?: boolean;
  hint?: string;
}

export interface ImageField {
  key: string;
  label: string;
  type: "image";
  /** Colonne SiteSetting contenant l'id du média. */
  setting?: string;
  hint?: string;
}

/** Lien vers un autre écran de l'admin (contenu géré ailleurs). */
export interface LinkField {
  key: string;
  label: string;
  type: "link";
  href: string;
  hint?: string;
}

export type ContentField = TextField | ImageField | LinkField;

export interface PageSection {
  title: string;
  fields: ContentField[];
}

export interface SitePageDef {
  key: string;
  label: string;
  path: string;
  sections: PageSection[];
}

const AUTO_PHOTO = "Vide = photo choisie automatiquement dans les albums.";

export const SITE_PAGES: SitePageDef[] = [
  {
    key: "home",
    label: "Accueil",
    path: "/",
    sections: [
      {
        title: "Bandeau plein écran",
        fields: [
          {
            key: "heroVideo",
            label: "Vidéo de fond (MP4 / WebM)",
            type: "text",
            setting: { fr: "heroVideoUrl" },
            hint: "Adresse d'un fichier vidéo (ex. /hero-video.mp4). Vide = photo ci-dessous.",
          },
          { key: "heroImage", label: "Photo du bandeau (si pas de vidéo)", type: "image", setting: "heroImageId" },
          {
            key: "tagline",
            label: "Accroche",
            type: "text",
            setting: { fr: "tagline", en: "taglineEn" },
            required: true,
            hint: "Affichée sous le logo et en titre de la section « En cuisine ».",
          },
          { key: "heroCta", label: "Lien de réservation", type: "text", default: { msg: "home.bookTable" } },
        ],
      },
      {
        title: "Section « En cuisine »",
        fields: [
          { key: "aboutImage", label: "Photo", type: "image", setting: "aboutImageId" },
          { key: "chefKicker", label: "Petit titre", type: "text", default: { msg: "home.chefTitle" } },
          {
            key: "intro",
            label: "Texte",
            type: "textarea",
            setting: { fr: "intro", en: "introEn" },
            hint: "Une ligne vide = nouveau paragraphe. Vide = section masquée.",
          },
        ],
      },
      {
        title: "Section « Nos cartes & menus »",
        fields: [
          { key: "menusKicker", label: "Petit titre", type: "text", default: { msg: "home.menusTitle" } },
          { key: "menusIntro", label: "Phrase d'accroche", type: "textarea", default: { msg: "home.menusIntro" } },
          { key: "readMore", label: "Lien sous chaque menu", type: "text", default: { msg: "common.readMore" } },
          { key: "menusLink", label: "Les menus eux-mêmes", type: "link", href: "/admin/menus" },
        ],
      },
      {
        title: "Section « En images »",
        fields: [
          { key: "photoMain", label: "Grande photo", type: "image", setting: "homePhotoMainId", hint: AUTO_PHOTO },
          { key: "photoSecond", label: "Petite photo superposée", type: "image", setting: "homePhotoSecondId", hint: AUTO_PHOTO },
          { key: "photosKicker", label: "Petit titre", type: "text", default: { msg: "home.photosTitle" } },
          { key: "photosIntro", label: "Texte", type: "textarea", default: { msg: "home.photosIntro" } },
          { key: "photosLink", label: "Lien vers la galerie", type: "text", default: { msg: "home.photosLink" } },
        ],
      },
      {
        title: "Section « Nous trouver »",
        fields: [
          { key: "findUsKicker", label: "Petit titre", type: "text", default: { msg: "home.findUsTitle" } },
          {
            key: "infosLink",
            label: "Adresse, téléphone, horaires, carte",
            type: "link",
            href: "/admin/reglages",
            hint: "Informations communes à tout le site, dans Réglages.",
          },
        ],
      },
    ],
  },
  {
    key: "house",
    label: "La maison",
    path: "/la-maison",
    sections: [
      {
        title: "Bandeau",
        fields: [
          { key: "bandImage", label: "Photo du bandeau", type: "image", hint: AUTO_PHOTO },
          { key: "kicker", label: "Petit titre", type: "text", default: { fr: "La Maison", en: "The House" } },
          {
            key: "introLink",
            label: "Titre de la page et texte d'introduction",
            type: "link",
            href: "/admin/pages?slug=la-maison",
            hint: "Éditeur de texte riche (mise en forme, liens).",
          },
        ],
      },
      {
        title: "Corentin (en cuisine)",
        fields: [
          { key: "chefPhoto", label: "Photo", type: "image", hint: "Vide = photo « En cuisine » de l'accueil." },
          { key: "chefKicker", label: "Petit titre", type: "text", default: { fr: "En cuisine", en: "In the kitchen" } },
          { key: "chefName", label: "Nom", type: "text", default: { fr: "Corentin Courtien", en: "Corentin Courtien" } },
          {
            key: "chefText",
            label: "Texte",
            type: "textarea",
            default: {
              fr: "Corentin Courtien compose une cuisine créative et instinctive, où les épices et les herbes tiennent le premier rôle. Près de 80 % des produits viennent de producteurs locaux, choisis en direct et au fil des saisons. Le midi, une bistronomie généreuse ; le soir, un menu dégustation plus ambitieux, ponctué de petits amuse-bouches entre les plats.",
              en: "Corentin Courtien creates a spontaneous, creative cuisine in which spices and herbs take the lead. Nearly 80% of the produce comes from local growers, chosen directly and with the seasons. At lunch, generous bistronomy; in the evening, a more ambitious tasting menu punctuated with small amuse-bouches between courses.",
            },
          },
        ],
      },
      {
        title: "Madeline (en salle)",
        fields: [
          { key: "madelinePhoto", label: "Photo", type: "image", hint: AUTO_PHOTO },
          { key: "madelineKicker", label: "Petit titre", type: "text", default: { fr: "En salle", en: "In the dining room" } },
          { key: "madelineName", label: "Nom", type: "text", default: { fr: "Madeline Courtien", en: "Madeline Courtien" } },
          {
            key: "madelineText",
            label: "Texte",
            type: "textarea",
            default: {
              fr: "Madeline Courtien orchestre un service précis et chaleureux, récompensé par le Trophée Gault&Millau du Jeune Talent Service en salle. Elle veille au rythme du repas, guide dans la carte des vins et compose les accords mets et vins qui prolongent chaque plat. Sa présence attentive, jamais pesante, fait de la salle un prolongement naturel de la cuisine — un lieu où l'on se sent reçu, pas simplement servi.",
              en: "Madeline Courtien leads a precise, warm service, honoured with the Gault&Millau Young Talent Award for front-of-house service. She keeps the rhythm of the meal, guides guests through the wine list and builds the pairings that carry each dish further. Her attentive, unobtrusive presence makes the dining room a natural extension of the kitchen — a place where you feel welcomed, not merely served.",
            },
          },
        ],
      },
      {
        title: "Nos producteurs",
        fields: [
          { key: "producersKicker", label: "Petit titre", type: "text", default: { fr: "Nos producteurs", en: "Our producers" } },
          {
            key: "producersTitle",
            label: "Titre",
            type: "text",
            default: { fr: "Ceux qui font notre cuisine", en: "The hands behind our produce" },
          },
          { key: "producersLink", label: "La liste des producteurs", type: "link", href: "/admin/producteurs" },
        ],
      },
    ],
  },
  {
    key: "menus",
    label: "Cartes & Menus",
    path: "/menus",
    sections: [
      {
        title: "Bandeau",
        fields: [
          { key: "bandImage", label: "Photo du bandeau", type: "image", hint: AUTO_PHOTO },
          { key: "kicker", label: "Petit titre", type: "text", default: { msg: "nav.menus" } },
          { key: "title", label: "Titre", type: "text", default: { msg: "menus.title" } },
          {
            key: "seasonLabel",
            label: "Carte du moment",
            type: "text",
            setting: { fr: "menusSeasonLabel", en: "menusSeasonLabelEn" },
            hint: "Ex. « Carte d'automne · novembre 2026 ». Vide = non affiché.",
          },
          { key: "intro", label: "Texte d'introduction", type: "textarea", default: { msg: "menus.intro" } },
        ],
      },
      {
        title: "Contenu",
        fields: [
          { key: "menusLink", label: "Les menus (plats, prix)", type: "link", href: "/admin/menus" },
          { key: "empty", label: "Message si aucun menu publié", type: "text", default: { msg: "menus.empty" } },
          { key: "bookLink", label: "Lien de réservation en bas de page", type: "text", default: { msg: "home.bookTable" } },
        ],
      },
    ],
  },
  {
    key: "photos",
    label: "Photos",
    path: "/photos",
    sections: [
      {
        title: "En-tête",
        fields: [
          { key: "kicker", label: "Petit titre", type: "text", default: { msg: "photos.title" } },
          { key: "title", label: "Titre", type: "textarea", default: { msg: "photos.intro" } },
          { key: "empty", label: "Message si aucune photo", type: "text", default: { msg: "photos.empty" } },
          { key: "albumsLink", label: "Les albums et leurs photos", type: "link", href: "/admin/photos" },
        ],
      },
    ],
  },
  {
    key: "giftVouchers",
    label: "Bons cadeaux",
    path: "/bons-cadeaux",
    sections: [
      {
        title: "Présentation",
        fields: [
          { key: "sideImage", label: "Photo (colonne de gauche)", type: "image", hint: AUTO_PHOTO },
          { key: "title", label: "Titre", type: "text", default: { msg: "giftVouchers.title" } },
          { key: "intro", label: "Texte de présentation", type: "textarea", default: { msg: "giftVouchers.intro" } },
          { key: "bookingNote", label: "Rappel sous le formulaire", type: "textarea", default: { msg: "giftVouchers.bookingNote" } },
          { key: "termsLink", label: "Lien vers les CGV", type: "text", default: { fr: "Conditions générales de vente", en: "Gift voucher terms" } },
        ],
      },
    ],
  },
  {
    key: "reservation",
    label: "Réservation",
    path: "/reservation",
    sections: [
      {
        title: "Présentation",
        fields: [
          { key: "sideImage", label: "Photo (colonne de gauche)", type: "image", hint: "Vide = photo du bandeau d'accueil." },
          { key: "kicker", label: "Petit titre", type: "text", default: { msg: "reservation.title" } },
          { key: "title", label: "Titre", type: "text", default: { msg: "reservation.title" } },
          { key: "intro", label: "Texte", type: "textarea", default: { msg: "reservation.intro" } },
          { key: "nextAvailability", label: "Titre des prochaines disponibilités", type: "text", default: { fr: "Prochaines disponibilités", en: "Next availability" } },
          { key: "openBooking", label: "Bouton de réservation", type: "text", default: { msg: "reservation.openBooking" } },
          { key: "fallback", label: "Lien de secours (si le module ne s'affiche pas)", type: "text", default: { msg: "reservation.fallback" } },
          {
            key: "giftVoucherNote",
            label: "Rappel « bon cadeau »",
            type: "textarea",
            default: { msg: "reservation.giftVoucherNote" },
            hint: "Affiché aussi sur Cartes & Menus et Accès & Contact.",
          },
          { key: "groups", label: "Groupes & privatisations", type: "text", default: { fr: "Groupes & privatisations", en: "Groups & private events" } },
        ],
      },
    ],
  },
  {
    key: "contact",
    label: "Accès & Contact",
    path: "/contact",
    sections: [
      {
        title: "Bandeau",
        fields: [
          { key: "bandImage", label: "Photo du bandeau", type: "image", hint: "Vide = photo du bandeau d'accueil." },
          { key: "kicker", label: "Petit titre", type: "text", default: { msg: "nav.contact" } },
          { key: "title", label: "Titre", type: "text", default: { msg: "contact.title" } },
        ],
      },
      {
        title: "Comment venir",
        fields: [
          { key: "howToCome", label: "Titre", type: "text", default: { msg: "contact.howToCome" } },
          { key: "mapsLink", label: "Bouton Google Maps", type: "text", default: { fr: "Ouvrir dans Google Maps", en: "Open in Google Maps" } },
          { key: "hoursTitle", label: "Titre des horaires", type: "text", default: { msg: "common.openingHours" } },
          {
            key: "infosLink",
            label: "Adresse, téléphone, e-mail, horaires, carte",
            type: "link",
            href: "/admin/reglages",
            hint: "Informations communes à tout le site, dans Réglages.",
          },
        ],
      },
      {
        title: "Infos pratiques",
        fields: [
          { key: "parkingTitle", label: "Stationnement : titre", type: "text", default: { msg: "contact.parking" } },
          { key: "parkingNote", label: "Stationnement : texte", type: "textarea", setting: { fr: "parkingNote", en: "parkingNoteEn" }, hint: "Vide = carte masquée." },
          { key: "servicesTitle", label: "Services : titre", type: "text", default: { msg: "contact.services" } },
          { key: "servicesNote", label: "Services : texte", type: "textarea", setting: { fr: "servicesNote", en: "servicesNoteEn" }, hint: "Vide = carte masquée." },
          { key: "paymentTitle", label: "Paiement : titre", type: "text", default: { msg: "contact.payment" } },
          { key: "paymentNote", label: "Paiement : texte", type: "textarea", setting: { fr: "paymentNote", en: "paymentNoteEn" }, hint: "Vide = carte masquée." },
        ],
      },
      {
        title: "Formulaire",
        fields: [
          { key: "formTitle", label: "Titre", type: "text", default: { msg: "contact.formTitle" } },
          { key: "formIntro", label: "Texte", type: "textarea", default: { msg: "contact.formIntro" } },
        ],
      },
    ],
  },
];

export function getPageDef(key: string): SitePageDef | undefined {
  return SITE_PAGES.find((p) => p.key === key);
}

export function allFields(def: SitePageDef): ContentField[] {
  return def.sections.flatMap((s) => s.fields);
}
