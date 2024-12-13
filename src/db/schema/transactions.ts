import { decimal, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";
import { usersTable } from "./users";
import { sql } from "drizzle-orm";
import { locationsTable } from "./locations";
import { timestamps, uuid } from "../utils";

export const transactionsTable = mysqlTable("transactions", {
    id: uuid("id").primaryKey(),
    status: varchar("status", { length: 255 }).notNull(),
    totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
    paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).notNull().default(sql`0.00`),
    pendingAmount: decimal("pending_amount", { precision: 15, scale: 2 }).notNull().default(sql`0.00`),
    tax: decimal("tax", { precision: 15, scale: 2 }).default(sql`0.00`),
    fee: decimal("fee", { precision: 15, scale: 2 }).default(sql`0.00`),
    locationId: uuid("location_id").references(() => locationsTable.id).notNull(),
    description: text("description"),
    employeeId: uuid("employee_id").references(() => usersTable.id).notNull(),
    categoryId: uuid("category_id").references(() => transactionCategoriesSchema.id).notNull(),
    ...timestamps,
});

export const transactionPaymentsTable = mysqlTable("transaction_payments", {
    id: uuid("id").primaryKey(),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    currency: varchar("currency", { length: 255 }).notNull(),
    method: uuid("method").references(() => paymentMethodsSchema.id).notNull(),
    transactionId: uuid("transaction_id").references(() => transactionsTable.id).notNull(),
    ...timestamps,
});

export const transactionCategoriesSchema = mysqlTable("transaction_categories", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    ...timestamps,
});

export const paymentMethodsSchema = mysqlTable("payment_methods", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    ...timestamps,
});

export type SelectTransaction = typeof transactionsTable.$inferSelect;
export type InsertTransaction = typeof transactionsTable.$inferInsert;

export type SelectPaymentMethod = typeof paymentMethodsSchema.$inferSelect;
export type InsetPaymentMethod = typeof paymentMethodsSchema.$inferInsert;

export type SelectTransactionCategory = typeof transactionCategoriesSchema.$inferSelect;
export type InsertTransactionCategory = typeof transactionCategoriesSchema.$inferInsert;

export type SelectTransactionPayment = typeof transactionPaymentsTable.$inferSelect;
export type InsertTransactionPayment = typeof transactionPaymentsTable.$inferInsert;