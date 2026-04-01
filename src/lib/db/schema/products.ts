import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    targetAudience: text("target_audience").notNull().default("unisex"),
    sku: text("sku").unique(),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    isActive: boolean("is_active").default(true),
    isFeatured: boolean("is_featured").default(false),
    metadata: jsonb("metadata").default({}),
    averageRating: numeric("average_rating", { precision: 2, scale: 1 }).default("0"),
    reviewCount: integer("review_count").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_products_category").on(table.categoryId),
    index("idx_products_slug").on(table.slug),
    index("idx_products_audience").on(table.targetAudience),
    index("idx_products_active_featured").on(table.isActive, table.isFeatured),
  ]
);

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  displayOrder: integer("display_order").default(0),
  isPrimary: boolean("is_primary").default(false),
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  size: text("size"),
  color: text("color"),
  colorHex: text("color_hex"),
  sku: text("sku").unique(),
  priceOverride: integer("price_override"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  isActive: boolean("is_active").default(true),
});
