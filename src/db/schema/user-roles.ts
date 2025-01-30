import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { timestamps, uuid } from "../utils";

export const userRolesTable = mysqlTable("user_roles", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 255 }).notNull(),
  ...timestamps
});

export type SelectUserRole = typeof userRolesTable.$inferSelect;
export type InsertUserRole = typeof userRolesTable.$inferInsert;