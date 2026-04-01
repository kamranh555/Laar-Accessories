import Link from "next/link";
import { db } from "@/lib/db";
import { reviews, products, profiles } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ApproveButton,
  DeleteReviewButton,
} from "@/components/admin/review-actions";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status;

  // Build where conditions
  const conditions = [];
  if (statusFilter === "pending") {
    conditions.push(eq(reviews.isApproved, false));
  } else if (statusFilter === "approved") {
    conditions.push(eq(reviews.isApproved, true));
  }

  const allReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      isApproved: reviews.isApproved,
      createdAt: reviews.createdAt,
      productName: products.name,
      productSlug: products.slug,
      customerName: profiles.fullName,
      customerEmail: profiles.email,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .leftJoin(profiles, eq(reviews.userId, profiles.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(reviews.createdAt));

  // Compute counts
  const [countResult] = await db
    .select({
      total: sql<number>`count(*)`,
      pending: sql<number>`count(*) filter (where ${reviews.isApproved} = false)`,
      approved: sql<number>`count(*) filter (where ${reviews.isApproved} = true)`,
    })
    .from(reviews);

  const totalCount = Number(countResult.total);
  const pendingCount = Number(countResult.pending);
  const approvedCount = Number(countResult.approved);

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating ? "\u2605" : "\u2606"
    ).join("");
  }

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brown">Reviews</h1>
        <p className="mt-1 text-muted-foreground">
          Moderate customer reviews
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brown">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brown">
              {approvedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-olive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brown">{totalCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex gap-2">
        <Button
          variant={!statusFilter ? "default" : "outline"}
          size="sm"
          render={<Link href="/admin/reviews" />}
        >
          All ({totalCount})
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          size="sm"
          render={<Link href="/admin/reviews?status=pending" />}
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={statusFilter === "approved" ? "default" : "outline"}
          size="sm"
          render={<Link href="/admin/reviews?status=approved" />}
        >
          Approved ({approvedCount})
        </Button>
      </div>

      {/* Reviews Table */}
      <Card className="mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Body</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allReviews.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No reviews found.
                  </TableCell>
                </TableRow>
              ) : (
                allReviews.map((review: any) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.productName || "Deleted product"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {review.customerName || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {review.customerEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-amber-500">
                        {renderStars(review.rating)}
                      </span>
                    </TableCell>
                    <TableCell>{review.title || "--"}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {review.body || "--"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString("en-PK")
                        : "--"}
                    </TableCell>
                    <TableCell>
                      {review.isApproved ? (
                        <Badge className="bg-green-100 text-green-800">
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800">
                          Pending
                        </Badge>
                      )}
                      {review.isVerifiedPurchase && (
                        <Badge
                          variant="outline"
                          className="ml-1"
                        >
                          Verified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!review.isApproved && (
                          <ApproveButton reviewId={review.id} />
                        )}
                        <DeleteReviewButton reviewId={review.id} />
                      </div>
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
