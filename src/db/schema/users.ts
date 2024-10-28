import { rolesTable } from "@/db/schema/roles";
import { char, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "node:crypto";

export const usersTable = mysqlTable("users", {
  id: char("id", { length: 36 }).primaryKey().$default(() => randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  roleId: char("role_id", { length: 36 }).references(() => rolesTable.id).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});