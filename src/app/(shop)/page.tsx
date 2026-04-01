import { HeroSection } from "@/components/shop/hero-section";
import { CategoryGrid } from "@/components/shop/category-grid";
import { FeaturedProducts } from "@/components/shop/featured-products";
import { NewsletterSection } from "@/components/shop/newsletter-section";
import { DecorativeBorder } from "@/components/layout/decorative-border";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { getImagesForProducts } from "@/lib/db/queries";
import { eq, and, desc } from "drizzle-orm";
import type { Product } from "@/types/product";

export const revalidate = 3600;

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const result = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .limit(8);

    const productIds = result.map((r: any) => r.products.id);
    const imageMap = await getImagesForProducts(productIds);

    return result.map((r: any) => ({
      ...r.products,
      images: imageMap[r.products.id] || [],
      category: r.categories,
    })) as Product[];
  } catch {
    return [];
  }
}

async function getNewArrivals(): Promise<Product[]> {
  try {
    const result = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt))
      .limit(8);

    const productIds = result.map((r: any) => r.products.id);
    const imageMap = await getImagesForProducts(productIds);

    return result.map((r: any) => ({
      ...r.products,
      images: imageMap[r.products.id] || [],
      category: r.categories,
    })) as Product[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, newArrivals] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
  ]);

  return (
    <>
      <HeroSection />

      <CategoryGrid />

      <DecorativeBorder />

      <FeaturedProducts
        title="Featured Collection"
        subtitle="Handpicked favorites for you"
        products={featuredProducts}
      />

      {newArrivals.length > 0 && (
        <FeaturedProducts
          title="New Arrivals"
          subtitle="Fresh additions to our collection"
          products={newArrivals}
        />
      )}

      {/* Brand Story Section */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            Our Philosophy
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            We believe every accessory tells a story. At Laar, we curate
            pieces that blend quality craftsmanship with contemporary design
            &mdash; built to last, made to be worn every day.
          </p>
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}
