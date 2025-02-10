import { sql } from "drizzle-orm";
import { decimal, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";
import { bigIntId, primaryKey, timestamps } from "../utils";
import { locationsTable } from "./locations";
import { usersTable } from "./users";

export const transactionsTable = mysqlTable("transactions", {
  ...primaryKey,
  status: varchar("status", { length: 255 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).notNull().default(sql`0.00`),
  pendingAmount: decimal("pending_amount", { precision: 15, scale: 2 }).notNull().default(sql`0.00`),
  tax: decimal("tax", { precision: 15, scale: 2 }).default(sql`0.00`),
  fee: decimal("fee", { precision: 15, scale: 2 }).default(sql`0.00`),
  locationId: bigIntId("location_id").references(() => locationsTable.id, { onDelete: "restrict", onUpdate: "cascade" }).notNull(),
  description: text("description"),
  employeeId: bigIntId("employee_id").references(() => usersTable.id).notNull(),
  categoryId: bigIntId("category_id").references(() => transactionCategoriesSchema.id).notNull(),
  ...timestamps,
});

export type SelectTransaction = typeof transactionsTable.$inferSelect;
export type InsertTransaction = typeof transactionsTable.$inferInsert;

export const transactionPaymentsTable = mysqlTable("transaction_payments", {
  ...primaryKey,
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  currency: varchar("currency", { length: 255 }).notNull(),
  methodId: bigIntId("method_id").references(() => paymentMethodsSchema.id).notNull(),
  transactionId: bigIntId("transaction_id").references(() => transactionsTable.id).notNull(),
  ...timestamps,
});

export type SelectTransactionPayment = typeof transactionPaymentsTable.$inferSelect;
export type InsertTransactionPayment = typeof transactionPaymentsTable.$inferInsert;
export type SelectExpandedTransactionPayment = Omit<SelectTransactionPayment, "methodId" | "transactionId"> & {
  method: SelectPaymentMethod
  transaction: SelectTransaction
}

export const transactionCategoriesSchema = mysqlTable("transaction_categories", {
  ...primaryKey,
  name: varchar("name", { length: 255 }).notNull().unique(),
  ...timestamps,
});

export type SelectTransactionCategory = typeof transactionCategoriesSchema.$inferSelect;
export type InsertTransactionCategory = typeof transactionCategoriesSchema.$inferInsert;

export const paymentMethodsSchema = mysqlTable("payment_methods", {
  ...primaryKey,
  name: varchar("name", { length: 255 }).notNull().unique(),
  ...timestamps,
});

export type SelectPaymentMethod = typeof paymentMethodsSchema.$inferSelect;
export type InsetPaymentMethod = typeof paymentMethodsSchema.$inferInsert;