import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { uuid } from "../utils";

export const userRolesTable = mysqlTable("user_roles", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type SelectUserRole = typeof userRolesTable.$inferSelect;
export type InsertUserRole = typeof userRolesTable.$inferInsert;