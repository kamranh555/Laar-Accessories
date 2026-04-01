"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { SHIPPING_RATES } from "@/lib/constants";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } =
    useCartStore();

  const total = subtotal();
  const count = itemCount();
  const shippingCost =
    total >= SHIPPING_RATES.freeThreshold ? 0 : SHIPPING_RATES.standard;
  const grandTotal = total + shippingCost;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Cart" }]} className="mb-8" />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added any items to your cart yet."
        >
          <Button className="bg-terracotta hover:bg-terracotta-dark" render={<Link href="/shop" />}>
            Start Shopping
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Cart" }]} className="mb-8" />

      <h1 className="font-serif text-3xl font-bold text-brown">
        Shopping Cart ({count} items)
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex gap-4 rounded-lg border border-border/50 bg-card p-4"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted sm:h-32 sm:w-32">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-medium text-brown hover:text-terracotta"
                  >
                    {item.name}
                  </Link>
                  {item.variantLabel && (
                    <p className="text-sm text-muted-foreground">
                      {item.variantLabel}
                    </p>
                  )}
                  <p className="mt-1 text-sm font-semibold text-brown">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity - 1
                        )
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity + 1
                        )
                      }
                      disabled={item.quantity >= item.maxStock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-brown">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        removeItem(item.productId, item.variantId)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brown"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Order summary */}
        <div className="rounded-lg border border-border/50 bg-card p-6">
          <h2 className="font-serif text-lg font-semibold text-brown">
            Order Summary
          </h2>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {shippingCost === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  formatPrice(shippingCost)
                )}
              </span>
            </div>
            {total < SHIPPING_RATES.freeThreshold && (
              <p className="text-xs text-muted-foreground">
                Add {formatPrice(SHIPPING_RATES.freeThreshold - total)} more for
                free shipping
              </p>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-lg text-brown">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>

          <Button
            className="mt-6 w-full bg-terracotta hover:bg-terracotta-dark"
            size="lg"
            render={<Link href="/checkout" />}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
