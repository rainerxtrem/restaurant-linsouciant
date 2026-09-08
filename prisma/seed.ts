/**
 * Seed du site L'Insouciant (Le Mans). Toutes les données sont reprises du
 * site d'origine restaurant-linsouciant.fr (menus, horaires, coordonnées,
 * mentions légales, photos) ; rien n'est inventé. Les photos, récupérées
 * depuis l'ancien site, sont committées dans public/gallery/ et servies
 * directement — modifiables ensuite depuis /admin/photos.
 */
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import sharp from "sharp";

const prisma = new PrismaClient();

const GALLERY_DIR = path.join(process.cwd(), "public", "gallery");

/** Crée (ou récupère) une ligne Media pour un fichier de public/gallery/. */
async function galleryMedia(file: string, alt: string, altEn: string) {
  const storageKey = `gallery/${file}`;
  const existing = await prisma.media.findUnique({ where: { storageKey } });
  if (existing) return existing;
  const abs = path.join(GALLERY_DIR, file);
  const buf = readFileSync(abs);
  const meta = await sharp(buf).metadata();
  return prisma.media.create({
    data: {
      filename: file,
      url: `/gallery/${file}`,
      storageKey,
      type: "IMAGE",
      mimeType: "image/jpeg",
      size: statSync(abs).size,
      width: meta.width ?? null,
      height: meta.height ?? null,
      alt,
      altEn,
    },
  });
}

async function seedAlbum(
  slug: string,
  files: { file: string; alt: string; altEn: string }[]
) {
  const album = await prisma.galleryAlbum.findUnique({ where: { slug }, include: { images: true } });
  if (!album || album.images.length > 0) return; // déjà rempli, on ne touche pas
  for (const [order, f] of files.entries()) {
    const media = await galleryMedia(f.file, f.alt, f.altEn);
    await prisma.galleryImage.create({ data: { albumId: album.id, mediaId: media.id, order } });
  }
}

type Slot = { start: string; end: string };
const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] as const;

function hours(open: Partial<Record<(typeof DAYS)[number], Slot[]>>) {
  return DAYS.map((day) => ({ day, closed: !open[day], slots: open[day] ?? [] }));
}

const LUNCH: Slot = { start: "12:00", end: "14:00" };
const DINNER: Slot = { start: "19:00", end: "21:30" };

async function main() {
  // -------------------------------------------------------------------------
  // Compte administrateur initial
  // -------------------------------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@restaurant-linsouciant.fr";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMoiAuPremierLancement1";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrateur",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✔ Compte SUPER_ADMIN : ${adminEmail}`);

  // -------------------------------------------------------------------------
  // Réglages du site — `update` = `create` (hors id) : le premier accès au
  // site crée déjà une ligne "singleton" vide via getSiteSettings(), donc un
  // `update: {}` la laisserait vide. On réapplique donc les valeurs à chaque
  // seed (idempotent, ne casse rien si les réglages ont été personnalisés
  // depuis /admin — à ne relancer que volontairement).
  // -------------------------------------------------------------------------
  // Images du site (hero + portrait du chef) — servies depuis public/gallery/.
  const heroMedia = await galleryMedia("hero.jpg", "Salle du restaurant L'Insouciant", "L'Insouciant dining room");
  const chefMedia = await galleryMedia(
    "dcc1a1a346735d8b3f8eb21d2327f1be.jpg",
    "Corentin Courtien, chef de L'Insouciant",
    "Corentin Courtien, head chef at L'Insouciant"
  );

  const siteSettingData = {
      heroImageId: heroMedia.id,
      aboutImageId: chefMedia.id,
      siteName: "L'Insouciant",
      tagline: "Gastronomie décomplexée",
      taglineEn: "Unpretentious gastronomy",
      intro:
        "Le chef Corentin Courtien et son équipe placent le respect de la nature et des saisons au cœur de leur cuisine. Les produits sont sourcés en direct, avec le moins d'intermédiaires possible, pour des saveurs marquées, aromatiques, délicates et surprenantes.\n\nEn salle, un esprit épuré et chaleureux, un service attentif et rigoureux : tout est pensé pour que le repas soit une véritable succession de surprises gustatives.",
      introEn:
        "Chef Corentin Courtien and his team put respect for nature and the seasons at the heart of their cooking. Ingredients are sourced directly, with as few intermediaries as possible, for bold, aromatic, delicate and surprising flavours.\n\nIn the dining room, a refined and welcoming atmosphere and attentive, meticulous service: everything is designed to make the meal a true succession of gustatory surprises.",
      addressLine: "6-8 rue de la Mission",
      postalCode: "72000",
      city: "Le Mans",
      phone: "02 43 40 00 58",
      email: "restaurant-linsouciant@orange.fr",
      openingHours: hours({
        mardi: [LUNCH],
        mercredi: [LUNCH, DINNER],
        jeudi: [LUNCH, DINNER],
        vendredi: [LUNCH, DINNER],
        samedi: [LUNCH, DINNER],
      }),
      parkingNote: "Parking Place Washington, à quelques pas du restaurant.",
      parkingNoteEn: "Place Washington car park, a short walk from the restaurant.",
      servicesNote:
        "Climatisation · Privatisation possible · Accès PMR · Wi-Fi · Bons cadeaux",
      servicesNoteEn:
        "Air conditioning · Private hire available · Wheelchair access · Wi-Fi · Gift vouchers",
      paymentNote:
        "Carte bancaire, American Express, Apple Pay, paiement sans contact, Visa, Mastercard, espèces, chèques.",
      paymentNoteEn:
        "Credit card, American Express, Apple Pay, contactless, Visa, Mastercard, cash, cheques.",
      zenchefBookingUrl: "https://bookings.zenchef.com/results?rid=354419",
      zenchefNewsletterUrl: "https://nl.zenchef.com/optin-form.php?rpid=rpid_328VF84X",
      zenchefRestaurantId: "354419",
      facebookUrl: "https://www.facebook.com/restaurant.linsouciant",
      instagramUrl: "https://www.instagram.com/restaurant.linsouciant/",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=L%27Insouciant+6+rue+de+la+Mission+72000+Le+Mans",
      mapEmbedUrl:
        "https://www.google.com/maps?q=6%20rue%20de%20la%20Mission%2072000%20Le%20Mans&output=embed",
      legalCompanyName: "MCOCOTIER",
      legalCapital: "5 000 €",
      legalSiret: "88788251200015",
      legalRcsCity: "Le Mans",
      legalHost: "Railway Corporation, 80 Broad Street, 5th Floor, New York, NY 10004, États-Unis — railway.com",
      seoDefaultTitle: "L'Insouciant · Restaurant gastronomique au Mans",
      seoDefaultDescription:
        "Restaurant L'Insouciant au Mans — cuisine créative et gourmande du chef Corentin Courtien, produits frais et de saison. Réservation en ligne.",
  };

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: siteSettingData,
    create: { id: "singleton", ...siteSettingData },
  });
  console.log("✔ Réglages du site");

  // -------------------------------------------------------------------------
  // Menu « Premier Pas »
  // -------------------------------------------------------------------------
  await prisma.menu.upsert({
    where: { slug: "menu-premier-pas" },
    update: {},
    create: {
      slug: "menu-premier-pas",
      name: "Menu Premier Pas",
      nameEn: "« Premier Pas » menu",
      order: 0,
      status: "PUBLISHED",
      publishedAt: new Date(),
      availabilityNote: "Du mardi au vendredi, le midi (hors jours fériés)",
      availabilityNoteEn: "Tuesday to Friday, lunch only (excluding public holidays)",
      description:
        "Une première approche de la cuisine de L'Insouciant, au déjeuner en semaine.",
      descriptionEn: "A first taste of L'Insouciant's cooking, for weekday lunch.",
      prices: {
        create: [
          { kind: "FORMULA", label: "Entrée + Plat", labelEn: "Starter + Main", priceCents: 3200, order: 0 },
          { kind: "FORMULA", label: "Plat + Dessert", labelEn: "Main + Dessert", priceCents: 3200, order: 1 },
          { kind: "FORMULA", label: "Entrée + Plat + Dessert", labelEn: "Starter + Main + Dessert", priceCents: 3800, order: 2 },
        ],
      },
      sections: {
        create: [
          {
            title: "Entrées",
            titleEn: "Starters",
            order: 0,
            dishes: {
              create: [
                { name: "Côté Terre", nameEn: "From the land", order: 0 },
                { name: "Côté Mer", nameEn: "From the sea", order: 1 },
              ],
            },
          },
          {
            title: "Plats",
            titleEn: "Mains",
            order: 1,
            dishes: {
              create: [
                { name: "Sélection carnée", nameEn: "Meat selection", order: 0 },
                { name: "Retour de la criée", nameEn: "Catch of the day", order: 1 },
              ],
            },
          },
          {
            title: "Dessert",
            titleEn: "Dessert",
            order: 2,
            dishes: { create: [{ name: "Le délice", nameEn: "The delight", order: 0 }] },
          },
        ],
      },
    },
  });

  // -------------------------------------------------------------------------
  // Menus « Plaisir »
  // -------------------------------------------------------------------------
  await prisma.menu.upsert({
    where: { slug: "menus-plaisir" },
    update: {},
    create: {
      slug: "menus-plaisir",
      name: "Menus Plaisir",
      nameEn: "« Plaisir » menus",
      order: 1,
      status: "PUBLISHED",
      publishedAt: new Date(),
      availabilityNote: "Du mercredi au samedi, midi et soir (jours fériés inclus)",
      availabilityNoteEn: "Wednesday to Saturday, lunch and dinner (public holidays included)",
      description:
        "Le menu dégustation de L'Insouciant, ponctué de petits amuse-bouches entre les plats — une vraie succession de surprises gustatives. Les plats ci-dessous sont donnés à titre d'exemple et évoluent au fil des saisons.",
      descriptionEn:
        "L'Insouciant's tasting menu, punctuated with small amuse-bouches between courses — a real succession of surprises. The dishes below are given as an example and change with the seasons.",
      prices: {
        create: [
          { kind: "FORMULA", label: "Balade de saison — 4 plats (entrée, poisson, viande, dessert)", labelEn: "Seasonal stroll — 4 courses", priceCents: 7500, order: 0 },
          { kind: "FORMULA", label: "Invitation au voyage — 6 plats (2 entrées, poisson, granité, viande, pré-desserts, dessert)", labelEn: "Invitation to travel — 6 courses", priceCents: 9800, order: 1 },
          { kind: "WINE_PAIRING", label: "Accord mets & vins — 3 verres", labelEn: "Wine pairing — 3 glasses", priceCents: 3000, order: 2 },
          { kind: "WINE_PAIRING", label: "Accord mets & vins — 4 verres", labelEn: "Wine pairing — 4 glasses", priceCents: 3600, order: 3 },
          { kind: "WINE_PAIRING", label: "Accord mets & vins dégustation — 5 verres", labelEn: "Tasting wine pairing — 5 glasses", priceCents: 4200, order: 4 },
        ],
      },
      sections: {
        create: [
          {
            title: "Entrées",
            titleEn: "Starters",
            order: 0,
            dishes: {
              create: [
                {
                  name: "La fève edamame",
                  order: 0,
                  description:
                    "Façon risotto, œufs de saumon, pain bao aux algues et sésame.",
                },
                {
                  name: "La crevette impériale de Charente",
                  order: 1,
                  description:
                    "Bavaroise de bisque safranée, condiment passion, céleri et amande.",
                },
              ],
            },
          },
          {
            title: "Plats",
            titleEn: "Mains",
            order: 1,
            dishes: {
              create: [
                {
                  name: "Le lieu jaune de ligne",
                  order: 0,
                  description: "Cappelletti de légumes, écume à l'estragon.",
                },
                {
                  name: "Le taureau de Camargue",
                  order: 1,
                  description:
                    "Bœuf fumé au pin, haricots à l'huile de persil, béarnaise au poivre de Belém.",
                },
              ],
            },
          },
          {
            title: "Desserts",
            titleEn: "Desserts",
            order: 2,
            dishes: {
              create: [
                {
                  name: "L'or jaune de Lorraine",
                  order: 0,
                  description:
                    "Mirabelles rôties à l'amaretto, crème vanille de Madagascar, sorbet œillet d'Inde.",
                },
                {
                  name: "Nuit pourpre",
                  order: 1,
                  description:
                    "Ganache chocolat « Chanco », marmelade mûre-cerise au gingembre, éclats de brioche.",
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("✔ Menus");

  // -------------------------------------------------------------------------
  // Galerie photos — récupérée de l'ancien site (public/gallery/).
  // -------------------------------------------------------------------------
  for (const [i, album] of [
    { slug: "le-restaurant", title: "Le Restaurant", titleEn: "The restaurant" },
    { slug: "les-plats", title: "Les Plats", titleEn: "The dishes" },
  ].entries()) {
    await prisma.galleryAlbum.upsert({
      where: { slug: album.slug },
      update: {},
      create: { ...album, order: i },
    });
  }

  await seedAlbum("le-restaurant", [
    { file: "hero.jpg", alt: "Salle du restaurant", altEn: "Dining room" },
    { file: "6b74d57f39ab1ee25a387937781692bd.jpg", alt: "Salle et escalier", altEn: "Dining room and staircase" },
    { file: "a2a8a6517b2e542018cd7b9283aa2aaa.jpg", alt: "Table ronde et cave à vins", altEn: "Round table and wine cellar" },
    { file: "25ed31ee058425b8d825a67e7edef026.jpg", alt: "Salle à l'étage", altEn: "Upstairs dining room" },
    { file: "bc3d7a299b05424d57ad87499bfacfef.jpg", alt: "Banquette et tables", altEn: "Bench seating and tables" },
    { file: "a0e024e51636aec61209f2f9f77690ff.jpg", alt: "Cave à vins", altEn: "Wine cellar" },
    { file: "dcc1a1a346735d8b3f8eb21d2327f1be.jpg", alt: "Corentin Courtien, chef", altEn: "Corentin Courtien, head chef" },
    { file: "68a95019c079496fe3c4b94948f5baaa.jpg", alt: "Madeline Blais, salle", altEn: "Madeline Blais, front of house" },
  ]);

  await seedAlbum("les-plats", [
    { file: "65b5d62b634ed4e10171a866a8682a58.jpg", alt: "Foie gras et figues", altEn: "Foie gras and figs" },
    { file: "c6c571f16b1b28afb08f1660bc512c16.jpg", alt: "Entrée fleurie", altEn: "Flower-topped starter" },
    { file: "e3dab38673e6f3a27a19177424ba2890.jpg", alt: "Dessert au miel", altEn: "Honey dessert" },
    { file: "ec29be179f60174ec756be17ce31430a.jpg", alt: "Viande et champignons", altEn: "Meat and mushrooms" },
    { file: "3a478f97a8eb1ef4ff3e5e0e883feec9.jpg", alt: "Dessert ananas", altEn: "Pineapple dessert" },
    { file: "5f439d54d86f3b22407e4f2f8bb0fe02.jpg", alt: "Poisson de ligne", altEn: "Line-caught fish" },
    { file: "cbb2805b95a98ff62faad59b88ea2e2f.jpg", alt: "Viande en habit vert", altEn: "Herb-crusted meat" },
    { file: "fa5b12320cf65a6a43daddc21c6b12a8.jpg", alt: "Dessert rouge", altEn: "Red fruit dessert" },
    { file: "b5a5e88efaf6f6276cab9cdd13d7fd09.jpg", alt: "Tarte pourpre", altEn: "Purple tart" },
    { file: "c5e3f7d1268914acb55ce20acebb1551.jpg", alt: "Dôme aux violettes", altEn: "Violet dome dessert" },
    { file: "f5b60a288a8063761f65d41527df469d.jpg", alt: "Pains maison", altEn: "House-made bread" },
    { file: "6152d8589e4ca627fd30b706646b65b9.jpg", alt: "Menu à emporter", altEn: "Takeaway menu" },
  ]);
  console.log("✔ Galerie photos");

  // -------------------------------------------------------------------------
  // Pages légales
  // -------------------------------------------------------------------------
  await prisma.page.upsert({
    where: { slug: "mentions-legales" },
    update: {},
    create: {
      slug: "mentions-legales",
      title: "Mentions légales",
      titleEn: "Legal notice",
      status: "PUBLISHED",
      publishedAt: new Date(),
      isSystem: true,
      content: `
        <h2>Éditeur</h2>
        <p>Restaurant L'Insouciant — MCOCOTIER, société au capital de 5 000 €.<br />
        Siège : 6-8 rue de la Mission, 72000 Le Mans.<br />
        SIRET : 88788251200015 — RCS Le Mans.</p>
        <h2>Directeur de la publication</h2>
        <p><em>À compléter depuis l'administration.</em></p>
        <h2>Hébergement</h2>
        <p>Railway Corporation, 80 Broad Street, 5th Floor, New York, NY 10004, États-Unis — railway.com.</p>
        <h2>Contact</h2>
        <p>02 43 40 00 58 — restaurant-linsouciant@orange.fr</p>
      `,
      contentEn: `
        <h2>Publisher</h2>
        <p>Restaurant L'Insouciant — MCOCOTIER, share capital €5,000.<br />
        Registered office: 6-8 rue de la Mission, 72000 Le Mans, France.<br />
        SIRET: 88788251200015 — Le Mans Trade Register.</p>
        <h2>Publication director</h2>
        <p><em>To be completed from the admin panel.</em></p>
        <h2>Hosting</h2>
        <p>Railway Corporation, 80 Broad Street, 5th Floor, New York, NY 10004, USA — railway.com.</p>
        <h2>Contact</h2>
        <p>+33 2 43 40 00 58 — restaurant-linsouciant@orange.fr</p>
      `,
    },
  });

  for (const page of [
    {
      slug: "politique-de-confidentialite",
      title: "Politique de confidentialité",
      titleEn: "Privacy policy",
    },
    { slug: "politique-cookies", title: "Politique cookies", titleEn: "Cookie policy" },
    { slug: "accessibilite", title: "Accessibilité", titleEn: "Accessibility" },
  ]) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        status: "DRAFT",
        isSystem: true,
        content:
          "<p><em>Contenu à rédiger et publier depuis /admin/pages avant la mise en production.</em></p>",
        contentEn: "<p><em>Content to be written and published from /admin/pages before going live.</em></p>",
      },
    });
  }

  await prisma.page.upsert({
    where: { slug: "cgv" },
    update: {},
    create: {
      slug: "cgv",
      title: "Conditions générales de vente — Bons cadeaux",
      titleEn: "Gift voucher terms and conditions",
      status: "PUBLISHED",
      publishedAt: new Date(),
      isSystem: true,
      content: `
        <p>Les présentes conditions encadrent la vente en ligne de bons cadeaux du restaurant L'Insouciant.</p>
        <h2>Validité</h2>
        <p>Chaque bon cadeau est valable 12 mois à compter de la date d'achat, non prorogeable.</p>
        <h2>Utilisation</h2>
        <p>Le bon est utilisable au restaurant L'Insouciant, 6-8 rue de la Mission, 72000 Le Mans, de préférence sur réservation, sur présentation du code ou du QR code figurant sur le bon.</p>
        <h2>Montant</h2>
        <p>Le bon n'est ni remboursable, ni échangeable contre des espèces, et n'est pas fractionnable. Si l'addition dépasse la valeur du bon, la différence reste à la charge du client ; si elle est inférieure, aucun rendu de monnaie n'est effectué.</p>
        <h2>Droit de rétractation</h2>
        <p>Conformément aux articles L221-18 et suivants du Code de la consommation, l'acheteur dispose de 14 jours à compter de l'achat pour se rétracter, sauf si le bon a déjà été utilisé.</p>
        <h2>Contact</h2>
        <p>Pour toute question : 02 43 40 00 58 — restaurant-linsouciant@orange.fr.</p>
      `,
      contentEn: `
        <p>These terms govern the online sale of gift vouchers for the restaurant L'Insouciant.</p>
        <h2>Validity</h2>
        <p>Each gift voucher is valid for 12 months from the purchase date and cannot be extended.</p>
        <h2>Use</h2>
        <p>The voucher can be used at L'Insouciant, 6-8 rue de la Mission, 72000 Le Mans, preferably with a reservation, on presentation of the code or QR code shown on the voucher.</p>
        <h2>Amount</h2>
        <p>The voucher is non-refundable, cannot be exchanged for cash and cannot be split. If the bill exceeds the voucher value, the difference is payable by the customer; if it is lower, no change is given.</p>
        <h2>Right of withdrawal</h2>
        <p>Under articles L221-18 et seq. of the French Consumer Code, the buyer has 14 days from purchase to withdraw, unless the voucher has already been used.</p>
        <h2>Contact</h2>
        <p>For any question: +33 2 43 40 00 58 — restaurant-linsouciant@orange.fr.</p>
      `,
    },
  });
  console.log("✔ Pages légales");

  console.log("Seed terminé.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
