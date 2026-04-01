import { db } from "@/lib/db";
import { profiles, orders } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { Users } from "lucide-react";

export default async function CustomersPage() {
  const customers = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      phone: profiles.phone,
      createdAt: profiles.createdAt,
      orderCount: sql<number>`count(${orders.id})`.as("order_count"),
      totalSpent: sql<number>`coalesce(sum(${orders.total}), 0)`.as(
        "total_spent"
      ),
    })
    .from(profiles)
    .leftJoin(orders, eq(orders.userId, profiles.id))
    .where(eq(profiles.role, "customer"))
    .groupBy(profiles.id)
    .orderBy(desc(profiles.createdAt));

  const totalCustomers = customers.length;

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brown">
          Customers
        </h1>
        <p className="mt-1 text-muted-foreground">
          View registered customers
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6">
        <Card className="max-w-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-olive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brown">
              {totalCustomers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No customers yet.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer: any) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.fullName || "--"}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.phone || "--"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString(
                            "en-PK"
                          )
                        : "--"}
                    </TableCell>
                    <TableCell>{Number(customer.orderCount)}</TableCell>
                    <TableCell>
                      {formatPrice(Number(customer.totalSpent))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
