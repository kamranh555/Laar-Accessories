import Link from "next/link";
import { db } from "@/lib/db";
import { products, orders, profiles } from "@/lib/db/schema";
import { eq, sql, count, sum, gte, and, lt, ne } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-red-100 text-red-800",
};

export default async function AdminDashboard() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch all stats in parallel
  let totalRevenue = 0;
  let monthlyOrders = 0;
  let activeProducts = 0;
  let totalCustomers = 0;
  let recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: Date | null;
    customerName: string | null;
  }> = [];
  let lowStockProducts: Array<{
    id: string;
    name: string;
    stockQuantity: number;
  }> = [];

  try {
    const [revenueResult, ordersResult, productsResult, customersResult, recentResult, lowStockResult] =
      await Promise.all([
        // Total revenue this month (exclude cancelled orders)
        db
          .select({
            total: sum(orders.total),
          })
          .from(orders)
          .where(
            and(
              ne(orders.status, "cancelled"),
              gte(orders.createdAt, firstDayOfMonth)
            )
          ),

        // Orders this month
        db
          .select({
            count: count(),
          })
          .from(orders)
          .where(gte(orders.createdAt, firstDayOfMonth)),

        // Active products
        db
          .select({
            count: count(),
          })
          .from(products)
          .where(eq(products.isActive, true)),

        // Total customers
        db
          .select({
            count: count(),
          })
          .from(profiles)
          .where(eq(profiles.role, "customer")),

        // Recent orders (5 most recent)
        db
          .select({
            id: orders.id,
            orderNumber: orders.orderNumber,
            status: orders.status,
            total: orders.total,
            createdAt: orders.createdAt,
            customerName: profiles.fullName,
          })
          .from(orders)
          .leftJoin(profiles, eq(orders.userId, profiles.id))
          .orderBy(sql`${orders.createdAt} desc`)
          .limit(5),

        // Low stock products (stock < 10)
        db
          .select({
            id: products.id,
            name: products.name,
            stockQuantity: products.stockQuantity,
          })
          .from(products)
          .where(
            and(eq(products.isActive, true), lt(products.stockQuantity, 10))
          )
          .orderBy(products.stockQuantity),
      ]);

    totalRevenue = Number(revenueResult[0]?.total) || 0;
    monthlyOrders = ordersResult[0]?.count || 0;
    activeProducts = productsResult[0]?.count || 0;
    totalCustomers = customersResult[0]?.count || 0;
    recentOrders = recentResult;
    lowStockProducts = lowStockResult;
  } catch (error) {
    console.error("Dashboard query error:", error);
  }

  const stats = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      description: "This month",
      icon: TrendingUp,
    },
    {
      title: "Orders",
      value: String(monthlyOrders),
      description: "This month",
      icon: ShoppingCart,
    },
    {
      title: "Products",
      value: String(activeProducts),
      description: "Active listings",
      icon: Package,
    },
    {
      title: "Customers",
      value: String(totalCustomers),
      description: "Total registered",
      icon: Users,
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-brown">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Welcome to the Laar admin dashboard.
      </p>

      {/* Stats Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-olive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brown">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-brown">Recent Orders</CardTitle>
            <Link
              href="/admin/orders"
              className="text-sm text-olive hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No orders yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-sm font-medium text-brown hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.customerName || "Guest"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-PK",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatPrice(order.total)}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-brown">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                All products are well stocked.
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2"
                  >
                    <div>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm font-medium text-brown hover:underline"
                      >
                        {product.name}
                      </Link>
                    </div>
                    <Badge
                      className={
                        product.stockQuantity === 0
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {product.stockQuantity === 0
                        ? "Out of stock"
                        : `${product.stockQuantity} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
