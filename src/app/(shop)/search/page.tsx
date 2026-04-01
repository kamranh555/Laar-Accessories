import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { getImagesForProducts } from "@/lib/db/queries";
import { eq, and, ilike, or } from "drizzle-orm";
import { Search } from "lucide-react";
import { ProductGrid } from "@/components/shop/product-grid";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import type { Product } from "@/types/product";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  return {
    title: params.q ? `Search: ${params.q}` : "Search",
  };
}

async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim().length === 0) return [];

  try {
    const result = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.isActive, true),
          or(
            ilike(products.name, `%${query}%`),
            ilike(products.description, `%${query}%`)
          )
        )
      )
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const results = await searchProducts(query);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Search" }]} className="mb-6" />

      <h1 className="font-serif text-3xl font-bold text-brown">
        {query ? `Results for "${query}"` : "Search"}
      </h1>

      {query && (
        <p className="mt-2 text-sm text-muted-foreground">
          {results.length} result{results.length !== 1 ? "s" : ""} found
        </p>
      )}

      <div className="mt-8">
        {!query ? (
          <EmptyState
            icon={Search}
            title="Search for products"
            description="Enter a search term to find products."
          />
        ) : (
          <ProductGrid products={results} />
        )}
      </div>
    </div>
  );
}
