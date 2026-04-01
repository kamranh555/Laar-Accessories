import Link from "next/link";
import { db } from "@/lib/db";
import { orders, orderItems, profiles } from "@/lib/db/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-red-100 text-red-800",
};

const FILTER_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;

  let orderList: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    total: number;
    createdAt: Date | null;
    customerName: string | null;
    customerEmail: string | null;
    itemCount: number;
  }> = [];

  let totalCount = 0;

  try {
    const itemCountSubquery = db
      .select({
        orderId: orderItems.orderId,
        itemCount: count(orderItems.id).as("item_count"),
      })
      .from(orderItems)
      .groupBy(orderItems.orderId)
      .as("item_counts");

    const conditions = filterStatus
      ? and(eq(orders.status, filterStatus))
      : undefined;

    const results = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        paymentMethod: orders.paymentMethod,
        paymentStatus: orders.paymentStatus,
        total: orders.total,
        createdAt: orders.createdAt,
        customerName: profiles.fullName,
        customerEmail: profiles.email,
        itemCount: sql<number>`coalesce(${itemCountSubquery.itemCount}, 0)`,
      })
      .from(orders)
      .leftJoin(profiles, eq(orders.userId, profiles.id))
      .leftJoin(itemCountSubquery, eq(orders.id, itemCountSubquery.orderId))
      .where(conditions)
      .orderBy(desc(orders.createdAt));

    orderList = results.map((r: any) => ({
      ...r,
      itemCount: Number(r.itemCount),
    }));

    totalCount = orderList.length;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brown">Orders</h1>
          <p className="mt-1 text-muted-foreground">
            {totalCount} order{totalCount !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const isActive = (filterStatus || "") === tab.value;
          return (
            <Link
              key={tab.value}
              href={
                tab.value
                  ? `/admin/orders?status=${tab.value}`
                  : "/admin/orders"
              }
            >
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
              >
                {tab.label}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="mt-6 rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-8 text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orderList.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-brown">
                        {order.customerName || "Guest"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.customerEmail || "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {order.itemCount}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(order.total)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {order.paymentMethod}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        paymentStatusColors[order.paymentStatus] ||
                        "bg-gray-100 text-gray-800"
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColors[order.status] ||
                        "bg-gray-100 text-gray-800"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="icon-sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
