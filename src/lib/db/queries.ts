import { db } from ".";
import { productImages } from "./schema";
import { inArray } from "drizzle-orm";
import type { ProductImage } from "@/types/product";

/**
 * Fetch images for a batch of product IDs and return a map keyed by productId.
 */
export async function getImagesForProducts(
  productIds: string[]
): Promise<Record<string, ProductImage[]>> {
  if (productIds.length === 0) return {};

  const images = await db
    .select()
    .from(productImages)
    .where(inArray(productImages.productId, productIds));

  const map: Record<string, ProductImage[]> = {};
  for (const img of images) {
    if (!map[img.productId]) map[img.productId] = [];
    map[img.productId].push(img as ProductImage);
  }
  return map;
}
