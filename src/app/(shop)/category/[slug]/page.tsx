import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { getImagesForProducts } from "@/lib/db/queries";
import { eq, and, desc } from "drizzle-orm";
import { ProductGrid } from "@/components/shop/product-grid";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import type { Product } from "@/types/product";
import type { Metadata } from "next";

export const revalidate = 3600;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const audienceCategories = ["men", "women", "children"];

async function getProductsByAudience(audience: string): Promise<Product[]> {
  try {
    const result = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.isActive, true),
          eq(products.targetAudience, audience)
        )
      )
      .orderBy(desc(products.createdAt))
      .limit(24);

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

async function getProductsByCategory(categorySlug: string): Promise<{
  category: { name: string; slug: string; description: string | null } | null;
  products: Product[];
}> {
  try {
    const cat = await db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, categorySlug), eq(categories.isActive, true)))
      .limit(1);

    if (cat.length === 0) return { category: null, products: [] };

    const result = await db
      .select()
      .from(products)
      .where(
        and(eq(products.isActive, true), eq(products.categoryId, cat[0].id))
      )
      .orderBy(desc(products.createdAt))
      .limit(24);

    const productIds = result.map((r: any) => r.id);
    const imageMap = await getImagesForProducts(productIds);

    return {
      category: cat[0],
      products: result.map((r: any) => ({
        ...r,
        images: imageMap[r.id] || [],
        category: cat[0],
      })) as Product[],
    };
  } catch {
    return { category: null, products: [] };
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const isAudience = audienceCategories.includes(slug);
  const title = isAudience
    ? `${slug.charAt(0).toUpperCase() + slug.slice(1)}'s Accessories`
    : slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title,
    description: `Shop ${title.toLowerCase()} at Laar`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const isAudience = audienceCategories.includes(slug);

  let categoryProducts: Product[];
  let title: string;
  let description: string | null = null;

  if (isAudience) {
    categoryProducts = await getProductsByAudience(slug);
    title = `${slug.charAt(0).toUpperCase() + slug.slice(1)}'s Collection`;
  } else {
    const result = await getProductsByCategory(slug);
    if (!result.category) notFound();
    categoryProducts = result.products;
    title = result.category!.name;
    description = result.category!.description;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: "Shop", href: "/shop" }, { label: title }]}
        className="mb-6"
      />

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-brown">{title}</h1>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {categoryProducts.length} products
        </p>
      </div>

      <ProductGrid products={categoryProducts} />
    </div>
  );
}
