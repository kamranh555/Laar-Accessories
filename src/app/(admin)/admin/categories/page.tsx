import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function CategoriesPage() {
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      displayOrder: categories.displayOrder,
      isActive: categories.isActive,
      createdAt: categories.createdAt,
      productCount: sql<number>`count(${products.id})`.as("product_count"),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.displayOrder, desc(categories.createdAt));

  return <CategoryManager categories={allCategories} />;
}
