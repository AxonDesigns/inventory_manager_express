import { userRolesTable } from "@/db/schema/roles";
import { sql } from "drizzle-orm";
import { check, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { emailRegex, timestamps, uuid } from "../utils";

export const usersTable = mysqlTable("users", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  roleId: uuid("role_id").references(() => userRolesTable.id).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  ...timestamps,
},
  (table) => ({
    emailConstraint: check("user_email_check_001", sql.raw(`${table.email.name} REGEXP '${emailRegex}'`)),
  })
);

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;