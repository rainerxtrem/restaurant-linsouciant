/**
 * Crée la page thématique « Noël à emporter » (/noel) et son menu à emporter,
 * d'après le flyer des fêtes. Création seule : si /noel existe déjà, rien
 * n'est modifié (les retouches faites dans l'admin sont préservées).
 *
 *   railway ssh -s restaurant-linsouciant "npx tsx prisma/seeds/noel.ts"
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const p = (label: string, labelEn: string, euros: number) => ({
  label,
  labelEn,
  priceCents: Math.round(euros * 100),
});

const products = [
  {
    name: "Plateau de mises en bouche",
    nameEn: "Appetiser platter",
    description:
      "Pour l'apéritif, 5 pièces par personne :\nMaki de daurade aux écorces de kalamansi\nGambas à l'agastache, crémeux de patate douce\nPâté en croûte de volaille et ris de veau\nCroque de cochon sarthois à l'ail noir & miso\nGougère à la tomme sarthoise & truffe noire",
    descriptionEn:
      "For the aperitif, 5 pieces per person:\nSea bream maki with kalamansi zest\nAgastache prawns, sweet potato cream\nChicken and veal sweetbread pâté en croûte\nSarthe pork croque with black garlic & miso\nGougère with Sarthe tomme & black truffle",
    prices: [p("Par personne (5 pièces)", "Per person (5 pieces)", 12)],
  },
  {
    name: "Saumon fumé par nos soins",
    nameEn: "House-smoked salmon",
    description: "Fumé au restaurant, à la coupe.",
    descriptionEn: "Smoked in our kitchen, sliced to order.",
    prices: [p("Le kg", "Per kg", 65)],
  },
  {
    name: "Ballotine de foie gras au Jasnières",
    nameEn: "Foie gras ballotine with Jasnières wine",
    description: "Foie gras du Sud-Ouest français.",
    descriptionEn: "Foie gras from south-west France.",
    prices: [p("250 g", "250 g", 32.5), p("500 g", "500 g", 65), p("1 kg", "1 kg", 130)],
  },
  {
    name: "Ballotine de foie gras à la truffe noire",
    nameEn: "Foie gras ballotine with black truffle",
    description: "Foie gras du Sud-Ouest français.",
    descriptionEn: "Foie gras from south-west France.",
    prices: [p("250 g", "250 g", 55), p("500 g", "500 g", 90), p("1 kg", "1 kg", 160)],
  },
  {
    name: "Pain d'épices maison",
    nameEn: "Homemade gingerbread",
    description: "",
    descriptionEn: "",
    prices: [p("", "", 8.5)],
  },
  {
    name: "Bœuf Wellington",
    nameEn: "Beef Wellington",
    description: "Le grand classique des fêtes & sa garniture. Préparé à partir de 4 personnes.",
    descriptionEn: "The great festive classic, with its garnish. Prepared for 4 people or more.",
    prices: [p("La part", "Per portion", 12.5)],
  },
  {
    name: "Bûche de Noël",
    nameEn: "Yule log",
    description:
      "Poire façon tatin à la vanille grillée, biscuit moelleux au citron sudachi, noix de pécan caramélisées.",
    descriptionEn: "Tatin-style pear with toasted vanilla, soft sudachi lemon sponge, caramelised pecans.",
    prices: [p("6/8 personnes", "Serves 6 to 8", 38)],
  },
];

const menuSections = [
  {
    title: "Entrée",
    titleEn: "Starter",
    subtitle: "au choix",
    subtitleEn: "your choice",
    dishes: [
      {
        name: "Saint-Jacques fumée en coquille lutée",
        nameEn: "Smoked scallop baked in a sealed shell",
        description: "Fondue de poireaux, citron noir, brioche aux algues, beurre blanc safrané",
        descriptionEn: "Leek fondue, black lemon, seaweed brioche, saffron beurre blanc",
      },
      {
        name: "Opéra de foie gras",
        nameEn: "Foie gras opéra",
        description: "Marbré au poivre de Timut, gel fruit de la passion et kumquat, pain d'épices",
        descriptionEn: "Marbled with Timut pepper, passion fruit and kumquat gel, gingerbread",
      },
    ],
  },
  {
    title: "Plat",
    titleEn: "Main course",
    subtitle: "au choix",
    subtitleEn: "your choice",
    dishes: [
      {
        name: "Lotte en papillote",
        nameEn: "Monkfish en papillote",
        description: "Chou-fleur grillé, pommes dauphine, sauce à l'ail noir",
        descriptionEn: "Grilled cauliflower, dauphine potatoes, black garlic sauce",
      },
      {
        name: "Suprême de chapon",
        nameEn: "Capon supreme",
        description: "Farci aux champignons, pressé de courge, jus réduit au vin jaune",
        descriptionEn: "Mushroom stuffing, pressed squash, vin jaune reduction",
      },
    ],
  },
  {
    title: "Dessert",
    titleEn: "Dessert",
    subtitle: "au choix",
    subtitleEn: "your choice",
    dishes: [
      {
        name: "La Boule de Noël",
        nameEn: "The Christmas bauble",
        description: "Mûre et litchi, touche de Cointreau et yuzu",
        descriptionEn: "Blackberry and lychee, a touch of Cointreau and yuzu",
      },
      {
        name: "La courge",
        nameEn: "The squash",
        description: "Chocolat intense, notes de fève de tonka, croustillant noisettes et spéculoos",
        descriptionEn: "Intense chocolate, tonka bean, hazelnut and speculoos crunch",
      },
    ],
  },
];

async function main() {
  if (await prisma.themePage.findUnique({ where: { slug: "noel" } })) {
    console.log("La page /noel existe déjà — rien n'est modifié.");
    return;
  }

  const plats = await prisma.galleryAlbum.findUnique({
    where: { slug: "les-plats" },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  const page = await prisma.themePage.create({
    data: {
      slug: "noel",
      title: "Noël à emporter",
      titleEn: "Christmas takeaway",
      navLabel: "Noël à emporter",
      navLabelEn: "Christmas takeaway",
      intro:
        "Toute l'équipe de L'Insouciant vous souhaite de joyeuses fêtes de fin d'année !\n\nLe chef vous propose ses créations, à savourer chez soi.",
      introEn:
        "The whole L'Insouciant team wishes you a joyful festive season!\n\nThe chef offers his creations, to enjoy at home.",
      orderInfo:
        "Dates limites de commande :\nNoël : 22 décembre\nNouvel An : 29 décembre\n\nÀ retirer au restaurant, 6 rue de la Mission, 72000 Le Mans.\nCommandes par téléphone au 02 43 40 00 58 ou par e-mail à restaurant-linsouciant@orange.fr.",
      orderInfoEn:
        "Order deadlines:\nChristmas: 22 December\nNew Year: 29 December\n\nCollect at the restaurant, 6 rue de la Mission, 72000 Le Mans.\nOrder by phone on +33 2 43 40 00 58 or by email at restaurant-linsouciant@orange.fr.",
      heroImageId: plats?.images[0]?.mediaId ?? null,
      enabled: false,
      products: {
        create: products.map((x, order) => ({
          name: x.name,
          nameEn: x.nameEn,
          description: x.description || null,
          descriptionEn: x.descriptionEn || null,
          prices: x.prices,
          order,
        })),
      },
    },
  });

  let slug = "menu-a-emporter-noel";
  for (let n = 2; await prisma.menu.findUnique({ where: { slug } }); n++) slug = `menu-a-emporter-noel-${n}`;

  await prisma.menu.create({
    data: {
      slug,
      name: "Menu à emporter",
      nameEn: "Takeaway menu",
      availabilityNote: "Noël & Nouvel An",
      availabilityNoteEn: "Christmas & New Year",
      status: "PUBLISHED",
      publishedAt: new Date(),
      themePageId: page.id,
      prices: {
        create: [
          {
            kind: "FORMULA",
            label: "Entrée, plat, dessert",
            labelEn: "Starter, main course, dessert",
            priceCents: 3800,
            order: 0,
          },
        ],
      },
      sections: {
        create: menuSections.map((s, order) => ({
          title: s.title,
          titleEn: s.titleEn,
          subtitle: s.subtitle,
          subtitleEn: s.subtitleEn,
          order,
          dishes: { create: s.dishes.map((d, dishOrder) => ({ ...d, order: dishOrder })) },
        })),
      },
    },
  });

  console.log(`Page /noel créée (désactivée) avec ${products.length} produits et le menu à emporter.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
