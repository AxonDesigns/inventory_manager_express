import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { uuid } from "../utils";

export const userStatusesTable = mysqlTable("user_statuses", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type SelectUserStatus = typeof userStatusesTable.$inferSelect;
export type InsertUserStatus = typeof userStatusesTable.$inferInsert;