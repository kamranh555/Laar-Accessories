import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  productVariants,
  categories,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ImageGallery } from "@/components/product/image-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import type { Product, ProductImage, ProductVariant } from "@/types/product";
import type { Metadata } from "next";

export const revalidate = 1800;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    const result = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.slug, slug), eq(products.isActive, true)))
      .limit(1);

    if (result.length === 0) return null;

    const product = result[0];

    const [images, variants] = await Promise.all([
      db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.products.id))
        .orderBy(productImages.displayOrder),
      db
        .select()
        .from(productVariants)
        .where(
          and(
            eq(productVariants.productId, product.products.id),
            eq(productVariants.isActive, true)
          )
        ),
    ]);

    return {
      ...product.products,
      images: images as ProductImage[],
      variants: variants as ProductVariant[],
      category: product.categories,
    } as Product;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description || `Shop ${product.name} at Laar`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Shop", href: "/shop" },
    ...(product.category
      ? [
          {
            label: product.category.name,
            href: `/category/${product.category.slug}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={breadcrumbs} className="mb-8" />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ImageGallery images={product.images || []} productName={product.name} />
        <ProductInfo product={product} />
      </div>
    </div>
  );
}
