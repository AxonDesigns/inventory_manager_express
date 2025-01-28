import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { uuid } from "../utils";

export const userStatusTable = mysqlTable("user_status", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type SelectUserStatus = typeof userStatusTable.$inferSelect;
export type InsertUserStatus = typeof userStatusTable.$inferInsert;