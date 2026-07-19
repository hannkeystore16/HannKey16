import { pgTable, text, integer, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "expired",
  "failed",
  "cancelled",
]);

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  packageId: text("package_id").notNull(),
  packageName: text("package_name").notNull(),
  // Amount actually charged now, in IDR (may be a down payment, not the full package price).
  amount: integer("amount").notNull(),
  totalPrice: integer("total_price").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  notes: text("notes"),
  status: orderStatusEnum("status").notNull().default("pending"),
  dokuTokenId: text("doku_token_id"),
  dokuSessionId: text("doku_session_id"),
  checkoutUrl: text("checkout_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable, {
  customerEmail: (schema) => schema.email(),
}).omit({
  id: true,
  status: true,
  dokuTokenId: true,
  dokuSessionId: true,
  checkoutUrl: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
