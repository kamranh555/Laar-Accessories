import { Suspense } from "react";
import { db } from "@/lib/db";
import {
  products,
  categories as categoriesTable,
} from "@/lib/db/schema";
import { getImagesForProducts } from "@/lib/db/queries";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductFilters } from "@/components/shop/product-filters";
import { ProductSort } from "@/components/shop/product-sort";
import { MobileFilterSheet } from "@/components/shop/mobile-filter-sheet";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import type { Product, Category } from "@/types/product";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All",
  description:
    "Browse our complete collection of accessories for men, women, and children.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    audience?: string;
    min_price?: string;
    max_price?: string;
    size?: string;
    sort?: string;
    page?: string;
    search?: string;
  }>;
}

async function getCategories(): Promise<Category[]> {
  try {
    return (await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(categoriesTable.displayOrder)) as Category[];
  } catch {
    return [];
  }
}

async function getProducts(params: {
  category?: string;
  audience?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  search?: string;
}): Promise<{ products: Product[]; total: number }> {
  try {
    const conditions = [eq(products.isActive, true)];

    if (params.audience) {
      conditions.push(eq(products.targetAudience, params.audience));
    }

    if (params.minPrice) {
      conditions.push(gte(products.price, params.minPrice * 100));
    }

    if (params.maxPrice) {
      conditions.push(lte(products.price, params.maxPrice * 100));
    }

    let orderBy;
    switch (params.sort) {
      case "price_asc":
        orderBy = asc(products.price);
        break;
      case "price_desc":
        orderBy = desc(products.price);
        break;
      case "rating":
        orderBy = desc(products.averageRating);
        break;
      case "popular":
        orderBy = desc(products.reviewCount);
        break;
      default:
        orderBy = desc(products.createdAt);
    }

    const offset = ((params.page || 1) - 1) * PRODUCTS_PER_PAGE;

    const where = conditions.length > 1 ? and(...conditions) : conditions[0];

    let query = db
      .select()
      .from(products)
      .leftJoin(
        categoriesTable,
        eq(products.categoryId, categoriesTable.id)
      );

    if (params.category) {
      query = query.where(
        and(where!, eq(categoriesTable.slug, params.category))
      ) as typeof query;
    } else {
      query = query.where(where) as typeof query;
    }

    const result = await (query as any)
      .orderBy(orderBy)
      .limit(PRODUCTS_PER_PAGE)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(where);

    const productIds = result.map((r: any) => r.products.id);
    const imageMap = await getImagesForProducts(productIds);

    const mappedProducts = result.map((r: any) => ({
      ...r.products,
      images: imageMap[r.products.id] || [],
      category: r.categories,
    })) as Product[];

    return {
      products: mappedProducts,
      total: Number(countResult[0]?.count || 0),
    };
  } catch (err) {
    console.error("[ShopPage] getProducts error:", err);
    return { products: [], total: 0 };
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [allCategories, { products: shopProducts, total }] = await Promise.all([
    getCategories(),
    getProducts({
      category: params.category,
      audience: params.audience,
      minPrice: params.min_price ? Number(params.min_price) : undefined,
      maxPrice: params.max_price ? Number(params.max_price) : undefined,
      sort: params.sort,
      page: params.page ? Number(params.page) : 1,
      search: params.search,
    }),
  ]);

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const currentPage = Number(params.page) || 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Shop" }]} className="mb-6" />

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-brown">
          All Products
        </h1>
        <div className="flex items-center gap-3">
          {/* Mobile filter button */}
          <MobileFilterSheet categories={allCategories} />
          <div className="hidden sm:block">
            <Suspense fallback={<Skeleton className="h-10 w-44" />}>
              <ProductSort />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-8">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ProductFilters categories={allCategories} />
          </Suspense>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between sm:hidden">
            <span className="text-sm text-muted-foreground">
              {total} products
            </span>
            <Suspense fallback={<Skeleton className="h-10 w-36" />}>
              <ProductSort />
            </Suspense>
          </div>

          <p className="mb-6 hidden text-sm text-muted-foreground sm:block">
            Showing {shopProducts.length} of {total} products
          </p>

          <ProductGrid products={shopProducts} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <a
                    key={page}
                    href={`?${new URLSearchParams({
                      ...params,
                      page: String(page),
                    }).toString()}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                      page === currentPage
                        ? "bg-terracotta text-white"
                        : "border border-border hover:bg-muted"
                    }`}
                  >
                    {page}
                  </a>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
