"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  const primaryImage = product.images?.find((img) => img.isPrimary) ||
    product.images?.[0];

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.stockQuantity <= 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      variantId: null,
      quantity: 1,
      name: product.name,
      price: product.price,
      imageUrl: primaryImage?.url || "",
      variantLabel: null,
      slug: product.slug,
      maxStock: product.stockQuantity,
    });
    openCartDrawer();
  }

  return (
    <div className={cn("group relative", className)}>
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {hasDiscount && (
              <Badge className="bg-terracotta text-white">Sale</Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-olive text-brown">Featured</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary">Out of Stock</Badge>
            )}
          </div>

          {/* Quick add overlay */}
          {!isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-3 transition-transform duration-300 group-hover:translate-y-0">
              <Button
                size="sm"
                className="w-full bg-terracotta hover:bg-terracotta-dark"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-1.5 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1 overflow-hidden">
          <p className="text-xs uppercase tracking-wider text-muted-foreground truncate">
            {product.category?.name || product.targetAudience}
          </p>
          <h3 className="font-medium text-brown group-hover:text-terracotta transition-colors line-clamp-2">
            {product.name}
          </h3>

          {product.reviewCount && product.reviewCount > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-olive text-olive" />
              <span className="text-xs text-muted-foreground">
                {product.averageRating} ({product.reviewCount})
              </span>
            </div>
          ) : null}

          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
          />
        </div>
      </Link>
    </div>
  );
}
