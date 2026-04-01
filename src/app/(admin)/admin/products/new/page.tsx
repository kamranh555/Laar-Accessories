import Link from "next/link";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProductForm } from "@/components/admin/product-form";
import { ChevronRight } from "lucide-react";

export default async function NewProductPage() {
  const allCategories = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.isActive, true));

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/admin/products"
          className="transition-colors hover:text-brown"
        >
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">New Product</span>
      </div>

      <h1 className="mt-4 font-serif text-3xl font-bold text-brown">
        New Product
      </h1>
      <p className="mt-1 text-muted-foreground">
        Add a new product to your catalog
      </p>

      <ProductForm categories={allCategories} />
    </div>
  );
}
