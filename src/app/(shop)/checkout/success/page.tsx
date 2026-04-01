import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function OrderSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;
  const orderNumber = params.order || "N/A";

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="font-serif text-3xl font-bold text-brown">
        Order Confirmed!
      </h1>

      <p className="mt-4 text-muted-foreground">
        Thank you for your order. Your order number is:
      </p>

      <div className="mt-4 inline-block rounded-lg bg-muted px-6 py-3">
        <span className="font-mono text-lg font-bold text-brown">
          {orderNumber}
        </span>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        We&apos;ll send you an update when your order ships. You can track your
        order status in your account.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button className="bg-terracotta hover:bg-terracotta-dark" render={<Link href="/account/orders" />}>
          <Package className="mr-2 h-4 w-4" />
          View Orders
        </Button>
        <Button variant="outline" render={<Link href="/shop" />}>
          Continue Shopping
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
