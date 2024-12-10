import { char, decimal, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "node:crypto";
import { usersTable } from "./users";
import { sql } from "drizzle-orm";

export const transactionsTable = mysqlTable("transactions", {
    id: char("id", { length: 36 }).primaryKey().$default(() => randomUUID()),
    status: varchar("status", { length: 255 }).notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default(sql`0.00`),
    pendingAmount: decimal("pending_amount", { precision: 10, scale: 2 }).notNull().default(sql`0.00`),
    tax: decimal("tax", { precision: 10, scale: 2 }).default(sql`0.00`),
    fee: decimal("fee", { precision: 10, scale: 2 }).default(sql`0.00`),
    location: varchar("location", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    employeeId: char("employee_id", { length: 36 }).references(() => usersTable.id).notNull(),
    categoryId: char("category_id", { length: 36 }).references(() => transactionCategoriesTable.id).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const transactionPaymentsTable = mysqlTable("transaction_payments", {
    id: char("id", { length: 36 }).primaryKey().$default(() => randomUUID()),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    currency: varchar("currency", { length: 255 }).notNull(),
    method: char("method", { length: 36 }).references(() => paymentMethodsTable.id).notNull(),
    transactionId: char("transaction_id", { length: 36 }).references(() => transactionsTable.id).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const transactionCategoriesTable = mysqlTable("transaction_categories", {
    id: char("id", { length: 36 }).primaryKey().$default(() => randomUUID()),
    name: varchar("name", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const paymentMethodsTable = mysqlTable("payment_methods", {
    id: char("id", { length: 36 }).primaryKey().$default(() => randomUUID()),
    name: varchar("name", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});