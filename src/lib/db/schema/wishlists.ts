import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { products } from "./products";

export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("wishlists_unique").on(table.userId, table.productId),
  ]
);
