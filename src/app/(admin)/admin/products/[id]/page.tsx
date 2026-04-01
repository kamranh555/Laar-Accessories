import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products, productImages, productVariants, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImagesSection } from "@/components/admin/product-images-section";
import { ProductVariantsSection } from "@/components/admin/product-variants-section";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch product
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) {
    notFound();
  }

  // Fetch categories, images, and variants in parallel
  const [allCategories, images, variants] = await Promise.all([
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.isActive, true)),
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id)),
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id)),
  ]);

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
        <span className="text-foreground">{product.name}</span>
      </div>

      <h1 className="mt-4 font-serif text-3xl font-bold text-brown">
        Edit Product
      </h1>
      <p className="mt-1 text-muted-foreground">
        Update product details, images, and variants
      </p>

      {/* Product Form */}
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          categoryId: product.categoryId,
          targetAudience: product.targetAudience,
          sku: product.sku,
          stockQuantity: product.stockQuantity,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
        }}
        categories={allCategories}
      />

      <Separator className="my-8" />

      {/* Images Section */}
      <ProductImagesSection productId={id} images={images} />

      <Separator className="my-8" />

      {/* Variants Section */}
      <ProductVariantsSection productId={id} variants={variants} />
    </div>
  );
}
