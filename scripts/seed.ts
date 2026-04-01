import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import {
  categories,
  products,
  productImages,
  productVariants,
} from "../src/lib/db/schema";

config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const PLACEHOLDER_IMAGES = [
  // 0 - mens-clothing/1.jpg  (kurta / traditional)
  "/images/mens-clothing/1.jpg",
  // 1 - mens-clothing/2.jpg  (shalwar kameez)
  "/images/mens-clothing/2.jpg",
  // 2 - womens-clothing/1.jpg  (fashion dress)
  "/images/womens-clothing/1.jpg",
  // 3 - womens-clothing/2.jpg  (dupatta / textile)
  "/images/womens-clothing/2.jpg",
  // 4 - gems/1.jpg  (precious stones)
  "/images/gems/1.jpg",
  // 5 - gems/2.jpg  (gemstone close-up)
  "/images/gems/2.jpg",
  // 6 - handcrafts/1.jpg  (pottery / ceramics)
  "/images/handcrafts/1.jpg",
  // 7 - handcrafts/2.jpg  (embroidered cushion)
  "/images/handcrafts/2.jpg",
  // 8 - mens-clothing/3.jpg  (casual shirt)
  "/images/mens-clothing/3.jpg",
  // 9 - womens-clothing/3.jpg  (embroidered suit)
  "/images/womens-clothing/3.jpg",
  // 10 - accessories/1.jpg  (necklace / jewellery)
  "/images/accessories/1.jpg",
  // 11 - handcrafts/3.jpg  (carved wooden art)
  "/images/handcrafts/3.jpg",
  // 12 - mens-clothing/4.jpg  (formal / sherwani)
  "/images/mens-clothing/4.jpg",
  // 13 - womens-clothing/4.jpg  (traditional embroidered)
  "/images/womens-clothing/4.jpg",
  // 14 - accessories/2.jpg  (ring / gems jewellery)
  "/images/accessories/2.jpg",
  // 15 - handcrafts/4.jpg  (woven rug / basket)
  "/images/handcrafts/4.jpg",
];

async function seed() {
  console.log("Seeding database...");

  await db.delete(productVariants);
  await db.delete(productImages);
  await db.delete(products);
  await db.delete(categories);

  const [accessories, gems, handcrafts, menClothing, womenClothing] = await db
    .insert(categories)
    .values([
      { name: "Accessories", slug: "accessories", description: "Jewellery, necklaces, rings, and premium accessories", displayOrder: 1 },
      { name: "Gems & Stones", slug: "gems", description: "Precious and semi-precious gemstones from Pakistan", displayOrder: 2 },
      { name: "Handcrafts", slug: "handcrafts", description: "Traditional handmade artisan pieces", displayOrder: 3 },
      { name: "Men's Clothing", slug: "mens-clothing", description: "Kurtas, shalwar kameez, and shirts for men", displayOrder: 4 },
      { name: "Women's Clothing", slug: "womens-clothing", description: "Dresses, lawn suits, and dupattas for women", displayOrder: 5 },
    ])
    .returning();

  console.log("Categories:", [accessories, gems, handcrafts, menClothing, womenClothing].map((c) => c.name).join(", "));

  const productData = [
    // --- Accessories (primary category) ---
    { name: "Pearl Drop Necklace", slug: "pearl-drop-necklace", description: "Elegant hand-strung freshwater pearl necklace with a sterling silver clasp. 18-inch length, presented in a gift box.", price: 450000, compareAtPrice: 580000, categoryId: accessories.id, targetAudience: "women", sku: "ACC-001", stockQuantity: 20, isFeatured: true, imgIdx: 10 },
    { name: "Silver Bangle Set", slug: "silver-bangle-set", description: "Set of 3 sterling silver bangles with intricate filigree work. Lightweight and stackable, handcrafted by artisans.", price: 280000, categoryId: accessories.id, targetAudience: "women", sku: "ACC-002", stockQuantity: 35, imgIdx: 14 },
    { name: "Kundan Jhumka Earrings", slug: "kundan-jhumka-earrings", description: "Traditional Kundan jhumka earrings with meenakari enamel detailing. Gold-plated with dangling pearl drops.", price: 350000, compareAtPrice: 450000, categoryId: accessories.id, targetAudience: "women", sku: "ACC-003", stockQuantity: 28, isFeatured: true, imgIdx: 10 },
    { name: "Embroidered Silk Clutch", slug: "embroidered-silk-clutch", description: "Hand-embroidered silk clutch with mirror work and sequins. Magnetic clasp, satin lining. Perfect for formal occasions.", price: 420000, compareAtPrice: 520000, categoryId: accessories.id, targetAudience: "women", sku: "ACC-004", stockQuantity: 15, imgIdx: 14 },
    { name: "Men's Silver Cufflinks", slug: "mens-silver-cufflinks", description: "Handcrafted sterling silver cufflinks with semi-precious stone inlay. Presented in a luxury gift box.", price: 320000, categoryId: accessories.id, targetAudience: "men", sku: "ACC-005", stockQuantity: 25, imgIdx: 10 },
    { name: "Stone-Set Cocktail Ring", slug: "stone-set-cocktail-ring", description: "Statement cocktail ring with a natural tourmaline set in gold-plated silver. Adjustable band.", price: 580000, compareAtPrice: 750000, categoryId: accessories.id, targetAudience: "women", sku: "ACC-006", stockQuantity: 12, isFeatured: true, imgIdx: 14 },
    // --- Men's Clothing ---
    { name: "Embroidered White Kurta", slug: "embroidered-white-kurta", description: "Premium cotton white kurta with intricate hand embroidery on the collar and cuffs. Perfect for formal occasions.", price: 350000, compareAtPrice: 450000, categoryId: menClothing.id, targetAudience: "men", sku: "MCL-001", stockQuantity: 30, isFeatured: true, imgIdx: 0 },
    { name: "Classic Shalwar Kameez", slug: "classic-shalwar-kameez", description: "Traditional shalwar kameez in premium lawn fabric. Comfortable and breathable for daily wear.", price: 280000, categoryId: menClothing.id, targetAudience: "men", sku: "MCL-002", stockQuantity: 45, imgIdx: 1 },
    { name: "Festive Sherwani Set", slug: "festive-sherwani-set", description: "Elegant sherwani with matching kameez and shalwar. Gold zari work. Ideal for weddings.", price: 1200000, compareAtPrice: 1500000, categoryId: menClothing.id, targetAudience: "men", sku: "MCL-003", stockQuantity: 12, isFeatured: true, imgIdx: 12 },
    { name: "Casual Linen Kurta", slug: "casual-linen-kurta", description: "Lightweight linen kurta ideal for summer. Minimalist design with pintuck details.", price: 220000, categoryId: menClothing.id, targetAudience: "men", sku: "MCL-004", stockQuantity: 50, imgIdx: 8 },
    { name: "Ajrak Print Kameez", slug: "ajrak-print-kameez", description: "Contemporary kameez featuring traditional block-print patterns. 100% cotton, machine washable.", price: 315000, compareAtPrice: 380000, categoryId: menClothing.id, targetAudience: "men", sku: "MCL-005", stockQuantity: 35, isFeatured: true, imgIdx: 0 },
    { name: "Men's Peshawari Kurta", slug: "peshawari-kurta", description: "Loose-cut Peshawari style kurta in thick cotton with embroidery at neckline.", price: 260000, categoryId: menClothing.id, targetAudience: "men", sku: "MCL-006", stockQuantity: 28, imgIdx: 1 },
    { name: "Embroidered Lawn Suit", slug: "embroidered-lawn-suit", description: "3-piece embroidered lawn suit with printed dupatta. Premium summer fabric. Fully stitched.", price: 650000, compareAtPrice: 850000, categoryId: womenClothing.id, targetAudience: "women", sku: "WCL-001", stockQuantity: 25, isFeatured: true, imgIdx: 2 },
    { name: "Silk Dupatta", slug: "silk-dupatta", description: "Pure silk dupatta with hand-block printed borders. Lightweight and lustrous.", price: 420000, categoryId: womenClothing.id, targetAudience: "women", sku: "WCL-002", stockQuantity: 40, imgIdx: 3 },
    { name: "Chiffon Party Frock", slug: "chiffon-party-frock", description: "Elegant chiffon frock with heavy embellishments. Flowy silhouette, perfect for parties.", price: 980000, compareAtPrice: 1250000, categoryId: womenClothing.id, targetAudience: "women", sku: "WCL-003", stockQuantity: 15, isFeatured: true, imgIdx: 9 },
    { name: "Women's Casual Kurti", slug: "womens-casual-kurti", description: "Comfortable everyday kurti in breathable cotton. Printed floral design. A-line cut.", price: 195000, categoryId: womenClothing.id, targetAudience: "women", sku: "WCL-004", stockQuantity: 60, imgIdx: 2 },
    { name: "Bridal Sharara Set", slug: "bridal-sharara-set", description: "Luxurious bridal sharara with intricate zardozi embroidery. Matching dupatta and kameez.", price: 2500000, compareAtPrice: 3000000, categoryId: womenClothing.id, targetAudience: "women", sku: "WCL-005", stockQuantity: 5, isFeatured: true, imgIdx: 13 },
    { name: "Printed Cotton Suit", slug: "printed-cotton-suit", description: "2-piece digital printed cotton suit. Vibrant colors, comfortable fit. Ready to wear.", price: 340000, categoryId: womenClothing.id, targetAudience: "women", sku: "WCL-006", stockQuantity: 38, imgIdx: 9 },
    { name: "Natural Ruby Stone", slug: "natural-ruby-stone", description: "Certified natural ruby from Hunza Valley. Deep red, excellent clarity. 3-4 carats. Authenticity certificate included.", price: 1850000, compareAtPrice: 2400000, categoryId: gems.id, targetAudience: "unisex", sku: "GEM-001", stockQuantity: 8, isFeatured: true, imgIdx: 4 },
    { name: "Peridot Gemstone", slug: "peridot-gemstone", description: "Vivid olive-green peridot from Kohistan. Natural, untreated. 5-6 carats.", price: 750000, categoryId: gems.id, targetAudience: "unisex", sku: "GEM-002", stockQuantity: 15, imgIdx: 5 },
    { name: "Aquamarine Crystal", slug: "aquamarine-crystal", description: "Sky-blue aquamarine from Gilgit-Baltistan. Natural formation, 4-5 carats.", price: 920000, compareAtPrice: 1200000, categoryId: gems.id, targetAudience: "unisex", sku: "GEM-003", stockQuantity: 10, isFeatured: true, imgIdx: 10 },
    { name: "Tourmaline Collection", slug: "tourmaline-collection", description: "Set of 3 natural tourmalines from Skardu — pink, green, and watermelon. Each 2-3 carats.", price: 1100000, categoryId: gems.id, targetAudience: "unisex", sku: "GEM-004", stockQuantity: 12, imgIdx: 4 },
    { name: "Smoky Quartz Crystal", slug: "smoky-quartz-crystal", description: "Large smoky quartz cluster, raw and natural. Approx 200-250g.", price: 450000, categoryId: gems.id, targetAudience: "unisex", sku: "GEM-005", stockQuantity: 20, imgIdx: 5 },
    { name: "Lapis Lazuli Slab", slug: "lapis-lazuli-slab", description: "Premium grade lapis lazuli from Badakhshan. Deep blue with gold pyrite inclusions. Polished 8x6 cm.", price: 680000, compareAtPrice: 900000, categoryId: gems.id, targetAudience: "unisex", sku: "GEM-006", stockQuantity: 14, imgIdx: 10 },
    { name: "Blue Pottery Vase Set", slug: "blue-pottery-vase-set", description: "Set of 3 hand-painted blue pottery vases from Multan. Each piece is unique.", price: 580000, compareAtPrice: 720000, categoryId: handcrafts.id, targetAudience: "unisex", sku: "HCR-001", stockQuantity: 18, isFeatured: true, imgIdx: 6 },
    { name: "Embroidered Cushion Cover", slug: "embroidered-cushion-cover", description: "Hand-stitched cushion cover with Sindhi rilli patchwork. Vibrant mirror work. 18x18 inches.", price: 320000, categoryId: handcrafts.id, targetAudience: "unisex", sku: "HCR-002", stockQuantity: 30, imgIdx: 7 },
    { name: "Camel Bone Trinket Box", slug: "camel-bone-trinket-box", description: "Intricately carved camel bone trinket box with geometric patterns. Brass hinges. 15x10x8 cm.", price: 450000, compareAtPrice: 580000, categoryId: handcrafts.id, targetAudience: "unisex", sku: "HCR-003", stockQuantity: 22, isFeatured: true, imgIdx: 11 },
    { name: "Hand-Woven Kilim Rug", slug: "hand-woven-kilim-rug", description: "Authentic hand-woven kilim rug from Balochistan. 100% wool with natural dyes. 3x5 feet.", price: 1800000, compareAtPrice: 2200000, categoryId: handcrafts.id, targetAudience: "unisex", sku: "HCR-004", stockQuantity: 8, isFeatured: true, imgIdx: 15 },
    { name: "Lacquerware Serving Tray", slug: "lacquerware-serving-tray", description: "Hand-painted lacquerware tray in traditional Hala style. Floral motifs on black lacquer. 40x30 cm.", price: 370000, categoryId: handcrafts.id, targetAudience: "unisex", sku: "HCR-005", stockQuantity: 25, imgIdx: 6 },
    { name: "Copper Engraved Tea Set", slug: "copper-engraved-tea-set", description: "Handcrafted copper tea set — teapot + 6 cups. Engraved floral patterns.", price: 950000, compareAtPrice: 1200000, categoryId: handcrafts.id, targetAudience: "unisex", sku: "HCR-006", stockQuantity: 10, imgIdx: 7 },
  ];

  for (const p of productData) {
    const { imgIdx, ...productValues } = p;
    const [product] = await db
      .insert(products)
      .values({
        ...productValues,
        isActive: true,
        metadata: {},
        averageRating: String((3.5 + Math.random() * 1.5).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 50) + 5,
      })
      .returning();

    await db.insert(productImages).values({
      productId: product.id,
      url: PLACEHOLDER_IMAGES[imgIdx],
      altText: product.name,
      displayOrder: 0,
      isPrimary: true,
    });

    const secondaryIdx = (imgIdx + 1) % PLACEHOLDER_IMAGES.length;
    await db.insert(productImages).values({
      productId: product.id,
      url: PLACEHOLDER_IMAGES[secondaryIdx],
      altText: `${product.name} - alternate view`,
      displayOrder: 1,
      isPrimary: false,
    });

    console.log(`  Created: ${product.name}`);
  }

  console.log(`\nSeeded ${productData.length} products across 4 categories.`);
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
