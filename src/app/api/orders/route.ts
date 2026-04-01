import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      total,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: user?.id || null,
        status: paymentMethod === "cod" ? "confirmed" : "pending",
        paymentMethod,
        paymentStatus: "pending",
        subtotal,
        shippingCost,
        total,
        shippingAddress,
      })
      .returning();

    // Create order items
    await db.insert(orderItems).values(
      items.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId || null,
        productName: item.name,
        variantLabel: item.variantLabel || null,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      }))
    );

    // Deduct stock
    for (const item of items) {
      await db
        .update(products)
        .set({
          stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));
    }

    return NextResponse.json({ orderNumber, orderId: order.id });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
