/**
 * Crée les pages thématiques « Pâques » (/paques) et « Saint-Valentin »
 * (/saint-valentin), désactivées, avec des produits et un menu D'EXEMPLE à
 * remplacer depuis l'admin. Photos provisoires : celles de l'album « Les
 * plats ». Création seule : une page dont l'adresse existe déjà est ignorée.
 *
 *   railway ssh -s restaurant-linsouciant "npx tsx prisma/seeds/fetes.ts"
 */
import { PrismaClient, type MenuPriceKind } from "@prisma/client";

const prisma = new PrismaClient();

const p = (label: string, labelEn: string, euros: number) => ({ label, labelEn, priceCents: Math.round(euros * 100) });
const dish = (name: string, nameEn: string, description: string, descriptionEn: string) => ({
  name,
  nameEn,
  description,
  descriptionEn,
});

interface Seed {
  slug: string;
  style: string;
  title: string;
  titleEn: string;
  intro: string;
  introEn: string;
  orderInfo: string;
  orderInfoEn: string;
  products: {
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    prices: ReturnType<typeof p>[];
  }[];
  menu: {
    slug: string;
    name: string;
    nameEn: string;
    note: string;
    noteEn: string;
    prices: { kind: MenuPriceKind; label: string; labelEn: string; euros: number }[];
    sections: { title: string; titleEn: string; subtitle: string; subtitleEn: string; dishes: ReturnType<typeof dish>[] }[];
  };
}

const choice = { subtitle: "au choix", subtitleEn: "your choice" };

const PAGES: Seed[] = [
  {
    slug: "paques",
    style: "easter",
    title: "Pâques à L'Insouciant",
    titleEn: "Easter at L'Insouciant",
    intro:
      "Le printemps s'invite en cuisine : asperges, agneau, premières herbes et chocolats maison.\n\nÀ savourer au restaurant ou à emporter pour vos tablées de Pâques.",
    introEn:
      "Spring comes to the kitchen: asparagus, lamb, the first herbs and homemade chocolates.\n\nEnjoy them at the restaurant or take them home for your Easter table.",
    orderInfo:
      "Date limite de commande : jeudi 25 mars.\nRetrait au restaurant le samedi 27 mars, de 10 h à 17 h.\n\nCommandes par téléphone ou par e-mail.",
    orderInfoEn:
      "Order deadline: Thursday 25 March.\nCollect at the restaurant on Saturday 27 March, 10 am to 5 pm.\n\nOrder by phone or email.",
    products: [
      {
        name: "Œuf de Pâques grand cru",
        nameEn: "Grand cru Easter egg",
        description: "Chocolat noir 70 %, garni de pralinés noisette et de petites fritures.",
        descriptionEn: "70% dark chocolate, filled with hazelnut pralines and little chocolate fish.",
        prices: [p("150 g", "150 g", 14), p("300 g", "300 g", 26)],
      },
      {
        name: "Épaule d'agneau confite sept heures",
        nameEn: "Seven-hour slow-cooked lamb shoulder",
        description: "Jus au thym, gratin dauphinois. Préparée à partir de 4 personnes.",
        descriptionEn: "Thyme jus, gratin dauphinois. Prepared for 4 people or more.",
        prices: [p("La part", "Per portion", 18)],
      },
      {
        name: "Asperges blanches, sauce mousseline",
        nameEn: "White asparagus, mousseline sauce",
        description: "Asperges du Val de Loire, sauce mousseline à l'orange.",
        descriptionEn: "Loire Valley asparagus, orange mousseline sauce.",
        prices: [p("La part", "Per portion", 9)],
      },
      {
        name: "Le Nid",
        nameEn: "The Nest",
        description: "Entremets chocolat au lait et passion, biscuit croustillant praliné.",
        descriptionEn: "Milk chocolate and passion fruit entremet, crunchy praline base.",
        prices: [p("4 personnes", "Serves 4", 26), p("6 personnes", "Serves 6", 36)],
      },
    ],
    menu: {
      slug: "menu-de-paques",
      name: "Menu de Pâques",
      nameEn: "Easter menu",
      note: "À emporter",
      noteEn: "Takeaway",
      prices: [{ kind: "FORMULA", label: "Entrée, plat, dessert", labelEn: "Starter, main course, dessert", euros: 42 }],
      sections: [
        {
          title: "Entrée",
          titleEn: "Starter",
          ...choice,
          dishes: [
            dish("Œuf parfait", "Slow-cooked egg", "Asperges vertes, morilles, émulsion au vin jaune", "Green asparagus, morels, vin jaune foam"),
            dish("Saumon gravlax", "Salmon gravlax", "Radis croquants, crème au raifort, aneth", "Crunchy radish, horseradish cream, dill"),
          ],
        },
        {
          title: "Plat",
          titleEn: "Main course",
          ...choice,
          dishes: [
            dish("Agneau de lait rôti", "Roast milk-fed lamb", "Petits pois à la française, jus à la sarriette", "French-style peas, savory jus"),
            dish("Dos de cabillaud", "Cod loin", "Carottes fanes, beurre blanc aux herbes", "Bunch carrots, herb beurre blanc"),
          ],
        },
        {
          title: "Dessert",
          titleEn: "Dessert",
          ...choice,
          dishes: [
            dish("Le Nid", "The Nest", "Chocolat au lait, passion, praliné croustillant", "Milk chocolate, passion fruit, crunchy praline"),
            dish("Tarte rhubarbe & fraise", "Rhubarb & strawberry tart", "Sablé breton, crème légère à la vanille", "Breton shortbread, light vanilla cream"),
          ],
        },
      ],
    },
  },
  {
    slug: "saint-valentin",
    style: "valentine",
    title: "Saint-Valentin",
    titleEn: "Valentine's Day",
    intro:
      "Le temps d'un dîner, le chef imagine un menu à partager en tête-à-tête.\n\nEt pour prolonger la soirée, quelques douceurs à offrir ou à emporter.",
    introEn:
      "For one evening, the chef creates a menu to share for two.\n\nAnd to make the night last, a few treats to give or take home.",
    orderInfo:
      "Dîner servi le samedi 13 et le dimanche 14 février, uniquement sur réservation.\n\nCoffrets et douceurs à commander avant le jeudi 11 février, à retirer au restaurant.",
    orderInfoEn:
      "Dinner served on Saturday 13 and Sunday 14 February, by reservation only.\n\nGift boxes and treats to order before Thursday 11 February, to collect at the restaurant.",
    products: [
      {
        name: "Coffret de chocolats L'Insouciant",
        nameEn: "L'Insouciant chocolate box",
        description: "Ganaches et pralinés maison : framboise, rose, passion, caramel au beurre salé.",
        descriptionEn: "Homemade ganaches and pralines: raspberry, rose, passion fruit, salted butter caramel.",
        prices: [p("12 pièces", "12 pieces", 18), p("24 pièces", "24 pieces", 32)],
      },
      {
        name: "Cœur framboise & litchi",
        nameEn: "Raspberry & lychee heart",
        description: "Entremets en forme de cœur, mousse litchi, insert framboise, touche de rose.",
        descriptionEn: "Heart-shaped entremet, lychee mousse, raspberry centre, a hint of rose.",
        prices: [p("Pour 2", "For 2", 16)],
      },
      {
        name: "Champagne rosé",
        nameEn: "Rosé Champagne",
        description: "Sélectionné par Madeline pour accompagner le dessert.",
        descriptionEn: "Selected by Madeline to go with dessert.",
        prices: [p("La bouteille (75 cl)", "Bottle (75 cl)", 58)],
      },
    ],
    menu: {
      slug: "menu-saint-valentin",
      name: "Menu Saint-Valentin",
      nameEn: "Valentine's menu",
      note: "Au restaurant · sur réservation",
      noteEn: "At the restaurant · by reservation",
      prices: [
        { kind: "FORMULA", label: "Menu en 5 temps, par personne", labelEn: "Five-course menu, per person", euros: 85 },
        { kind: "WINE_PAIRING", label: "Accord mets & vins, par personne", labelEn: "Wine pairing, per person", euros: 38 },
      ],
      sections: [
        {
          title: "Pour commencer",
          titleEn: "To begin",
          subtitle: "",
          subtitleEn: "",
          dishes: [dish("Huître pochée", "Poached oyster", "Beurre d'agrumes, caviar d'Aquitaine", "Citrus butter, Aquitaine caviar")],
        },
        {
          title: "Entrée",
          titleEn: "Starter",
          ...choice,
          dishes: [
            dish("Saint-Jacques snackées", "Seared scallops", "Topinambour, noisette, beurre noisette", "Jerusalem artichoke, hazelnut, brown butter"),
            dish("Foie gras poêlé", "Pan-fried foie gras", "Betterave, framboise, poivre de Timut", "Beetroot, raspberry, Timut pepper"),
          ],
        },
        {
          title: "Plat",
          titleEn: "Main course",
          ...choice,
          dishes: [
            dish("Homard bleu rôti", "Roast blue lobster", "Bisque légère, céleri, agrumes", "Light bisque, celeriac, citrus"),
            dish("Filet de bœuf", "Beef fillet", "Pomme de terre fondante, sauce truffée", "Fondant potato, truffle sauce"),
          ],
        },
        {
          title: "Dessert",
          titleEn: "Dessert",
          subtitle: "",
          subtitleEn: "",
          dishes: [dish("Cœur framboise & litchi", "Raspberry & lychee heart", "Rose, litchi, sorbet framboise", "Rose, lychee, raspberry sorbet")],
        },
      ],
    },
  },
];

async function main() {
  const plats = await prisma.galleryAlbum.findUnique({
    where: { slug: "les-plats" },
    include: { images: { orderBy: { order: "asc" } } },
  });
  const photos = plats?.images.map((i) => i.mediaId) ?? [];
  let next = 0;
  const photo = () => (photos.length ? photos[next++ % photos.length]! : null);

  for (const seed of PAGES) {
    if (await prisma.themePage.findUnique({ where: { slug: seed.slug } })) {
      console.log(`/${seed.slug} existe déjà — ignorée.`);
      continue;
    }

    const page = await prisma.themePage.create({
      data: {
        slug: seed.slug,
        style: seed.style,
        title: seed.title,
        titleEn: seed.titleEn,
        intro: seed.intro,
        introEn: seed.introEn,
        orderInfo: seed.orderInfo,
        orderInfoEn: seed.orderInfoEn,
        heroImageId: photo(),
        enabled: false,
        products: {
          create: seed.products.map((x, order) => ({
            name: x.name,
            nameEn: x.nameEn,
            description: x.description,
            descriptionEn: x.descriptionEn,
            imageId: photo(),
            prices: x.prices,
            order,
          })),
        },
      },
    });

    let slug = seed.menu.slug;
    for (let n = 2; await prisma.menu.findUnique({ where: { slug } }); n++) slug = `${seed.menu.slug}-${n}`;

    await prisma.menu.create({
      data: {
        slug,
        name: seed.menu.name,
        nameEn: seed.menu.nameEn,
        availabilityNote: seed.menu.note,
        availabilityNoteEn: seed.menu.noteEn,
        status: "PUBLISHED",
        publishedAt: new Date(),
        themePageId: page.id,
        prices: {
          create: seed.menu.prices.map((x, order) => ({
            kind: x.kind,
            label: x.label,
            labelEn: x.labelEn,
            priceCents: Math.round(x.euros * 100),
            order,
          })),
        },
        sections: {
          create: seed.menu.sections.map((s, order) => ({
            title: s.title,
            titleEn: s.titleEn,
            subtitle: s.subtitle || null,
            subtitleEn: s.subtitleEn || null,
            order,
            dishes: { create: s.dishes.map((d, dishOrder) => ({ ...d, order: dishOrder })) },
          })),
        },
      },
    });

    console.log(`/${seed.slug} créée (désactivée) : ${seed.products.length} produits + ${seed.menu.name}.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
