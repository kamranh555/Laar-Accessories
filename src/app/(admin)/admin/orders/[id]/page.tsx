import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { orders, orderItems, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  StatusUpdater,
  TrackingUpdater,
  PaymentUpdater,
} from "@/components/admin/order-actions";
import { ArrowLeft } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-red-100 text-red-800",
};

interface ShippingAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    paymentReference: string | null;
    subtotal: number;
    shippingCost: number;
    discountAmount: number | null;
    total: number;
    shippingAddress: unknown;
    notes: string | null;
    trackingNumber: string | null;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    createdAt: Date | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
  } | null = null;

  let items: Array<{
    id: string;
    productName: string;
    variantLabel: string | null;
    price: number;
    quantity: number;
    total: number;
  }> = [];

  try {
    const results = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        paymentMethod: orders.paymentMethod,
        paymentStatus: orders.paymentStatus,
        paymentReference: orders.paymentReference,
        subtotal: orders.subtotal,
        shippingCost: orders.shippingCost,
        discountAmount: orders.discountAmount,
        total: orders.total,
        shippingAddress: orders.shippingAddress,
        notes: orders.notes,
        trackingNumber: orders.trackingNumber,
        shippedAt: orders.shippedAt,
        deliveredAt: orders.deliveredAt,
        createdAt: orders.createdAt,
        customerName: profiles.fullName,
        customerEmail: profiles.email,
        customerPhone: profiles.phone,
      })
      .from(orders)
      .leftJoin(profiles, eq(orders.userId, profiles.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (results.length === 0) {
      notFound();
    }

    order = results[0];

    items = await db
      .select({
        id: orderItems.id,
        productName: orderItems.productName,
        variantLabel: orderItems.variantLabel,
        price: orderItems.price,
        quantity: orderItems.quantity,
        total: orderItems.total,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, id));
  } catch (error) {
    console.error("Failed to fetch order:", error);
    notFound();
  }

  if (!order) {
    notFound();
  }

  const address = (order.shippingAddress || {}) as ShippingAddress;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 hover:text-brown"
        >
          <ArrowLeft className="h-4 w-4" />
          Orders
        </Link>
        <span>/</span>
        <span className="font-medium text-brown">
          Order #{order.orderNumber}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brown">
            Order #{order.orderNumber}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Placed on{" "}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-PK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"}
          </p>
        </div>
        <Badge
          className={statusColors[order.status] || "bg-gray-100 text-gray-800"}
        >
          {order.status}
        </Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Left column — Order details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer & Shipping Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-brown">Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="font-medium">
                    {order.customerName || "Guest"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span>{order.customerEmail || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span>{order.customerPhone || "-"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-brown">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {address.fullName && (
                  <div className="font-medium">{address.fullName}</div>
                )}
                {address.phone && (
                  <div className="text-muted-foreground">{address.phone}</div>
                )}
                {address.addressLine1 && <div>{address.addressLine1}</div>}
                {address.addressLine2 && <div>{address.addressLine2}</div>}
                <div>
                  {[address.city, address.province, address.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-brown">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.variantLabel || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(item.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="ml-auto max-w-xs space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                {(order.discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount!)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold text-brown">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-brown">Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          {(order.shippedAt || order.deliveredAt) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-brown">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {order.shippedAt && (
                  <div>
                    <span className="text-muted-foreground">Shipped: </span>
                    <span>
                      {new Date(order.shippedAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div>
                    <span className="text-muted-foreground">Delivered: </span>
                    <span>
                      {new Date(order.deliveredAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — Action cards */}
        <div className="space-y-6">
          <StatusUpdater orderId={order.id} currentStatus={order.status} />
          <TrackingUpdater
            orderId={order.id}
            currentTracking={order.trackingNumber}
          />
          <PaymentUpdater
            orderId={order.id}
            currentPaymentMethod={order.paymentMethod}
            currentPaymentStatus={order.paymentStatus}
            currentPaymentReference={order.paymentReference}
          />
        </div>
      </div>
    </div>
  );
}
