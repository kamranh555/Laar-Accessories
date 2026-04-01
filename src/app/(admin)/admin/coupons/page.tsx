import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { CouponManager } from "@/components/admin/coupon-manager";

export default async function CouponsPage() {
  const allCoupons = await db
    .select()
    .from(coupons)
    .orderBy(desc(coupons.createdAt));

  return <CouponManager coupons={allCoupons} />;
}
