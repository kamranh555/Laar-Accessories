"use client";

import { useState } from "react";
import { ShoppingBag, Heart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PriceDisplay } from "@/components/shared/price-display";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  const variants = product.variants || [];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const colors = [
    ...new Map(
      variants
        .filter((v) => v.color)
        .map((v) => [v.color, { color: v.color!, hex: v.colorHex }])
    ).values(),
  ];

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const effectivePrice = selectedVariant?.priceOverride || product.price;
  const effectiveStock = selectedVariant
    ? selectedVariant.stockQuantity
    : product.stockQuantity;
  const isOutOfStock = effectiveStock <= 0;

  const primaryImage = product.images?.find((img) => img.isPrimary) ||
    product.images?.[0];

  function getVariantLabel() {
    if (!selectedVariant) return null;
    const parts = [];
    if (selectedVariant.color) parts.push(selectedVariant.color);
    if (selectedVariant.size) parts.push(selectedVariant.size);
    return parts.join(" / ");
  }

  function handleAddToCart() {
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      variantId: selectedVariantId,
      quantity,
      name: product.name,
      price: effectivePrice,
      imageUrl: primaryImage?.url || "",
      variantLabel: getVariantLabel(),
      slug: product.slug,
      maxStock: effectiveStock,
    });
    openCartDrawer();
  }

  return (
    <div className="space-y-6">
      {/* Category & audience */}
      <div className="flex items-center gap-2">
        {product.category && (
          <Badge variant="outline">{product.category.name}</Badge>
        )}
        <Badge variant="secondary" className="capitalize">
          {product.targetAudience}
        </Badge>
      </div>

      {/* Name */}
      <h1 className="font-serif text-3xl font-bold text-brown lg:text-4xl">
        {product.name}
      </h1>

      {/* Rating */}
      {product.reviewCount && product.reviewCount > 0 ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.round(Number(product.averageRating))
                    ? "fill-olive text-olive"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {product.averageRating} ({product.reviewCount} reviews)
          </span>
        </div>
      ) : null}

      {/* Price */}
      <PriceDisplay
        price={effectivePrice}
        compareAtPrice={product.compareAtPrice}
        className="text-2xl"
      />

      <Separator />

      {/* Description */}
      {product.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      )}

      {/* Color picker */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Color</p>
          <div className="flex gap-2">
            {colors.map((c) => {
              const variant = variants.find((v) => v.color === c.color);
              return (
                <button
                  key={c.color}
                  onClick={() => variant && setSelectedVariantId(variant.id)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    selectedVariant?.color === c.color
                      ? "border-olive ring-2 ring-olive/30"
                      : "border-border hover:border-olive/50"
                  )}
                  style={{ backgroundColor: c.hex || "#ccc" }}
                  title={c.color}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Size picker */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variant = variants.find(
                (v) =>
                  v.size === size &&
                  (!selectedVariant?.color ||
                    v.color === selectedVariant.color)
              );
              return (
                <Button
                  key={size}
                  variant={
                    selectedVariant?.size === size ? "default" : "outline"
                  }
                  size="sm"
                  className={cn(
                    "min-w-[3rem]",
                    selectedVariant?.size === size &&
                      "bg-brown hover:bg-brown-light"
                  )}
                  onClick={() => variant && setSelectedVariantId(variant.id)}
                  disabled={!variant || variant.stockQuantity <= 0}
                >
                  {size}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Quantity</p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
            disabled={quantity >= effectiveStock}
          >
            +
          </Button>
          {effectiveStock <= 5 && effectiveStock > 0 && (
            <span className="text-xs text-terracotta">
              Only {effectiveStock} left
            </span>
          )}
        </div>
      </div>

      {/* Add to cart */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1 bg-terracotta hover:bg-terracotta-dark"
          onClick={handleAddToCart}
          disabled={isOutOfStock || (variants.length > 0 && !selectedVariantId)}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          {isOutOfStock
            ? "Out of Stock"
            : variants.length > 0 && !selectedVariantId
              ? "Select Options"
              : "Add to Cart"}
        </Button>
        <Button variant="outline" size="lg" className="shrink-0">
          <Heart className="h-5 w-5" />
        </Button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-4 rounded-lg border border-border/50 p-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <Truck className="h-5 w-5 text-olive" />
          <span className="text-xs text-muted-foreground">Free Shipping</span>
          <span className="text-[10px] text-muted-foreground/70">
            Over PKR 5,000
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <Shield className="h-5 w-5 text-olive" />
          <span className="text-xs text-muted-foreground">
            Secure Payment
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            SSL Encrypted
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <RotateCcw className="h-5 w-5 text-olive" />
          <span className="text-xs text-muted-foreground">Easy Returns</span>
          <span className="text-[10px] text-muted-foreground/70">
            7 Day Policy
          </span>
        </div>
      </div>
    </div>
  );
}
