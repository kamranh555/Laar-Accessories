"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  productVariants,
  categories,
  orders,
  reviews,
  coupons,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

// ---------------------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------------------

export async function createProduct(
  formData: FormData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    await requireAdmin();

    const name = formData.get("name") as string;
    const slug =
      (formData.get("slug") as string) || slugify(name);
    const description = formData.get("description") as string | null;
    const priceStr = formData.get("price") as string;
    const price = Math.round(parseFloat(priceStr) * 100);
    const compareAtPriceStr = formData.get("compareAtPrice") as string | null;
    const compareAtPrice = compareAtPriceStr
      ? Math.round(parseFloat(compareAtPriceStr) * 100)
      : null;
    const categoryId = (formData.get("categoryId") as string) || null;
    const targetAudience =
      (formData.get("targetAudience") as string) || "unisex";
    const sku = (formData.get("sku") as string) || null;
    const stockQuantity = parseInt(
      (formData.get("stockQuantity") as string) || "0",
      10
    );
    const isActive = formData.get("isActive") !== "false";
    const isFeatured = formData.get("isFeatured") === "true";

    const [inserted] = await db
      .insert(products)
      .values({
        name,
        slug,
        description,
        price,
        compareAtPrice,
        categoryId,
        targetAudience,
        sku,
        stockQuantity,
        isActive,
        isFeatured,
      })
      .returning({ id: products.id });

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true, id: inserted.id };
  } catch (error) {
    console.error("createProduct error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create product",
    };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const name = formData.get("name") as string;
    const slug =
      (formData.get("slug") as string) || slugify(name);
    const description = formData.get("description") as string | null;
    const priceStr = formData.get("price") as string;
    const price = Math.round(parseFloat(priceStr) * 100);
    const compareAtPriceStr = formData.get("compareAtPrice") as string | null;
    const compareAtPrice = compareAtPriceStr
      ? Math.round(parseFloat(compareAtPriceStr) * 100)
      : null;
    const categoryId = (formData.get("categoryId") as string) || null;
    const targetAudience =
      (formData.get("targetAudience") as string) || "unisex";
    const sku = (formData.get("sku") as string) || null;
    const stockQuantity = parseInt(
      (formData.get("stockQuantity") as string) || "0",
      10
    );
    const isActive = formData.get("isActive") !== "false";
    const isFeatured = formData.get("isFeatured") === "true";

    await db
      .update(products)
      .set({
        name,
        slug,
        description,
        price,
        compareAtPrice,
        categoryId,
        targetAudience,
        sku,
        stockQuantity,
        isActive,
        isFeatured,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("updateProduct error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update product",
    };
  }
}

export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    await db.delete(products).where(eq(products.id, id));

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("deleteProduct error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete product",
    };
  }
}

export async function toggleProductActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();

    await db
      .update(products)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(products.id, id));

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("toggleProductActive error:", error);
    return { success: false };
  }
}

export async function toggleProductFeatured(
  id: string,
  isFeatured: boolean
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();

    await db
      .update(products)
      .set({ isFeatured, updatedAt: new Date() })
      .where(eq(products.id, id));

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("toggleProductFeatured error:", error);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// PRODUCT IMAGES
// ---------------------------------------------------------------------------

export async function addProductImage(
  productId: string,
  url: string,
  altText: string,
  isPrimary: boolean
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();

    if (isPrimary) {
      await db
        .update(productImages)
        .set({ isPrimary: false })
        .where(eq(productImages.productId, productId));
    }

    await db.insert(productImages).values({
      productId,
      url,
      altText,
      isPrimary,
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("addProductImage error:", error);
    return { success: false };
  }
}

export async function deleteProductImage(
  imageId: string
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();

    await db.delete(productImages).where(eq(productImages.id, imageId));

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("deleteProductImage error:", error);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// PRODUCT VARIANTS
// ---------------------------------------------------------------------------

export async function addProductVariant(
  productId: string,
  data: {
    size?: string;
    color?: string;
    colorHex?: string;
    sku?: string;
    priceOverride?: number;
    stockQuantity: number;
  }
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();

    await db.insert(productVariants).values({
      productId,
      size: data.size ?? null,
      color: data.color ?? null,
      colorHex: data.colorHex ?? null,
      sku: data.sku ?? null,
      priceOverride: data.priceOverride ?? null,
      stockQuantity: data.stockQuantity,
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("addProductVariant error:", error);
    return { success: false };
  }
}

export async function updateProductVariant(
  variantId: string,
  data: {
    size?: string;
    color?: string;
    colorHex?: string;
    sku?: string;
    priceOverride?: number;
    stockQuantity: number;
    isActive?: boolean;
  }
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();

    await db
      .update(productVariants)
      .set({
        size: data.size ?? null,
        color: data.color ?? null,
        colorHex: data.colorHex ?? null,
        sku: data.sku ?? null,
        priceOverride: data.priceOverride ?? null,
        stockQuantity: data.stockQuantity,
        isActive: data.isActive,
      })
      .where(eq(productVariants.id, variantId));

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("updateProductVariant error:", error);
    return { success: false };
  }
}

export async function deleteProductVariant(
  variantId: string
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();

    await db
      .delete(productVariants)
      .where(eq(productVariants.id, variantId));

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("deleteProductVariant error:", error);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------------

export async function createCategory(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const name = formData.get("name") as string;
    const slug =
      (formData.get("slug") as string) || slugify(name);
    const description = formData.get("description") as string | null;
    const imageUrl = (formData.get("imageUrl") as string) || null;
    const parentId = (formData.get("parentId") as string) || null;
    const displayOrder = parseInt(
      (formData.get("displayOrder") as string) || "0",
      10
    );
    const isActive = formData.get("isActive") !== "false";

    await db.insert(categories).values({
      name,
      slug,
      description,
      imageUrl,
      parentId,
      displayOrder,
      isActive,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("createCategory error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const name = formData.get("name") as string;
    const slug =
      (formData.get("slug") as string) || slugify(name);
    const description = formData.get("description") as string | null;
    const imageUrl = (formData.get("imageUrl") as string) || null;
    const parentId = (formData.get("parentId") as string) || null;
    const displayOrder = parseInt(
      (formData.get("displayOrder") as string) || "0",
      10
    );
    const isActive = formData.get("isActive") !== "false";

    await db
      .update(categories)
      .set({
        name,
        slug,
        description,
        imageUrl,
        parentId,
        displayOrder,
        isActive,
      })
      .where(eq(categories.id, id));

    revalidatePath("/admin/categories");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("updateCategory error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    await db.delete(categories).where(eq(categories.id, id));

    revalidatePath("/admin/categories");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("deleteCategory error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}

// ---------------------------------------------------------------------------
// ORDERS
// ---------------------------------------------------------------------------

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (status === "shipped") {
      updates.shippedAt = new Date();
    }

    if (status === "delivered") {
      updates.deliveredAt = new Date();
    }

    await db.update(orders).set(updates).where(eq(orders.id, id));

    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update order status",
    };
  }
}

export async function updateTrackingNumber(
  id: string,
  trackingNumber: string
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();

    await db
      .update(orders)
      .set({ trackingNumber, updatedAt: new Date() })
      .where(eq(orders.id, id));

    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error) {
    console.error("updateTrackingNumber error:", error);
    return { success: false };
  }
}

export async function updatePaymentStatus(
  id: string,
  paymentStatus: string,
  paymentReference?: string
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();

    const updates: Record<string, unknown> = {
      paymentStatus,
      updatedAt: new Date(),
    };

    if (paymentReference) {
      updates.paymentReference = paymentReference;
    }

    await db.update(orders).set(updates).where(eq(orders.id, id));

    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error) {
    console.error("updatePaymentStatus error:", error);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// REVIEWS
// ---------------------------------------------------------------------------

export async function approveReview(
  id: string
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();

    await db
      .update(reviews)
      .set({ isApproved: true })
      .where(eq(reviews.id, id));

    revalidatePath("/admin/reviews");

    return { success: true };
  } catch (error) {
    console.error("approveReview error:", error);
    return { success: false };
  }
}

export async function deleteReview(
  id: string
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();

    await db.delete(reviews).where(eq(reviews.id, id));

    revalidatePath("/admin/reviews");

    return { success: true };
  } catch (error) {
    console.error("deleteReview error:", error);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// COUPONS
// ---------------------------------------------------------------------------

export async function createCoupon(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const code = (formData.get("code") as string).toUpperCase();
    const discountType = formData.get("discountType") as string;
    const discountValue = parseInt(
      formData.get("discountValue") as string,
      10
    );
    const minOrderAmountStr = formData.get("minOrderAmount") as string | null;
    const minOrderAmount = minOrderAmountStr
      ? parseInt(minOrderAmountStr, 10)
      : null;
    const maxUsesStr = formData.get("maxUses") as string | null;
    const maxUses = maxUsesStr ? parseInt(maxUsesStr, 10) : null;
    const isActive = formData.get("isActive") !== "false";
    const expiresAtStr = formData.get("expiresAt") as string | null;
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;

    await db.insert(coupons).values({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      isActive,
      expiresAt,
    });

    revalidatePath("/admin/coupons");

    return { success: true };
  } catch (error) {
    console.error("createCoupon error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create coupon",
    };
  }
}

export async function updateCoupon(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const code = (formData.get("code") as string).toUpperCase();
    const discountType = formData.get("discountType") as string;
    const discountValue = parseInt(
      formData.get("discountValue") as string,
      10
    );
    const minOrderAmountStr = formData.get("minOrderAmount") as string | null;
    const minOrderAmount = minOrderAmountStr
      ? parseInt(minOrderAmountStr, 10)
      : null;
    const maxUsesStr = formData.get("maxUses") as string | null;
    const maxUses = maxUsesStr ? parseInt(maxUsesStr, 10) : null;
    const isActive = formData.get("isActive") !== "false";
    const expiresAtStr = formData.get("expiresAt") as string | null;
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;

    await db
      .update(coupons)
      .set({
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxUses,
        isActive,
        expiresAt,
      })
      .where(eq(coupons.id, id));

    revalidatePath("/admin/coupons");

    return { success: true };
  } catch (error) {
    console.error("updateCoupon error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update coupon",
    };
  }
}

export async function deleteCoupon(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    await db.delete(coupons).where(eq(coupons.id, id));

    revalidatePath("/admin/coupons");

    return { success: true };
  } catch (error) {
    console.error("deleteCoupon error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete coupon",
    };
  }
}

export async function toggleCouponActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();

    await db
      .update(coupons)
      .set({ isActive })
      .where(eq(coupons.id, id));

    revalidatePath("/admin/coupons");

    return { success: true };
  } catch (error) {
    console.error("toggleCouponActive error:", error);
    return { success: false };
  }
}
