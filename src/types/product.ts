export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  categoryId: string | null;
  targetAudience: "men" | "women" | "children" | "unisex";
  sku: string | null;
  stockQuantity: number;
  isActive: boolean | null;
  isFeatured: boolean | null;
  metadata: Record<string, unknown>;
  averageRating: string;
  reviewCount: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: Category | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  displayOrder: number | null;
  isPrimary: boolean | null;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  sku: string | null;
  priceOverride: number | null;
  stockQuantity: number;
  isActive: boolean | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  displayOrder: number | null;
  isActive: boolean | null;
}

export interface ProductFilters {
  category?: string;
  audience?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "popular" | "rating";
  page?: number;
  search?: string;
}
