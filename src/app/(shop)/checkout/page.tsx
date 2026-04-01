"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import {
  PAKISTAN_CITIES,
  PAKISTAN_PROVINCES,
  PAYMENT_METHODS,
  SHIPPING_RATES,
} from "@/lib/constants";
import { CreditCard, Smartphone, Building2, Banknote } from "lucide-react";

const paymentIcons: Record<string, React.ReactNode> = {
  jazzcash: <Smartphone className="h-5 w-5 text-terracotta" />,
  easypaisa: <Smartphone className="h-5 w-5 text-green-600" />,
  bank_transfer: <Building2 className="h-5 w-5 text-brown" />,
  cod: <Banknote className="h-5 w-5 text-olive" />,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const total = subtotal();
  const shippingCost =
    total >= SHIPPING_RATES.freeThreshold ? 0 : SHIPPING_RATES.standard;
  const grandTotal = total + shippingCost;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            variantLabel: item.variantLabel,
          })),
          shippingAddress: {
            fullName: formData.get("fullName"),
            phone: formData.get("phone"),
            addressLine1: formData.get("addressLine1"),
            addressLine2: formData.get("addressLine2"),
            city: formData.get("city"),
            province: formData.get("province"),
            postalCode: formData.get("postalCode"),
          },
          paymentMethod,
          subtotal: total,
          shippingCost,
          total: grandTotal,
        }),
      });

      if (response.ok) {
        const { orderNumber } = await response.json();
        clearCart();
        router.push(`/checkout/success?order=${orderNumber}`);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
        className="mb-8"
      />

      <h1 className="font-serif text-3xl font-bold text-brown">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Shipping Address */}
          <div className="rounded-lg border border-border/50 bg-card p-6">
            <h2 className="font-serif text-lg font-semibold text-brown">
              Shipping Address
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  required
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="addressLine1">Address</Label>
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  required
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="addressLine2">
                  Address Line 2{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  placeholder="Apartment, suite, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select name="city" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAKISTAN_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Select name="province" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAKISTAN_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">
                  Postal Code{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  placeholder="XXXXX"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-lg border border-border/50 bg-card p-6">
            <h2 className="font-serif text-lg font-semibold text-brown">
              Payment Method
            </h2>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="mt-4 space-y-3"
            >
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50 has-[data-state=checked]:border-olive has-[data-state=checked]:bg-olive/5"
                >
                  <RadioGroupItem value={method.value} />
                  {paymentIcons[method.value]}
                  <span className="font-medium">{method.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-lg border border-border/50 bg-card p-6 h-fit lg:sticky lg:top-32">
          <h2 className="font-serif text-lg font-semibold text-brown">
            Order Summary
          </h2>

          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {item.name} x{item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}

            <Separator />

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

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-lg text-brown">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="mt-6 w-full bg-terracotta hover:bg-terracotta-dark"
            size="lg"
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
