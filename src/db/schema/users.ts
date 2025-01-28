import { SelectUserRole, userRolesTable } from "@/db/schema/roles";
import { sql } from "drizzle-orm";
import { boolean, check, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { emailRegex, timestamps, uuid } from "../utils";
import { userStatusTable } from "./user-status";

export const usersTable = mysqlTable("users", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  roleId: uuid("role_id").references(() => userRolesTable.id).notNull(),
  statusId: uuid("status").references(() => userStatusTable.id).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  verificationToken: varchar("verification_token", { length: 32 }),
  ...timestamps,
},
  (table) => ({
    emailConstraint: check("user_email_check_001", sql.raw(`${table.email.name} REGEXP '${emailRegex}'`)),
  })
);

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
//Omit roleId
export type SelectExpandedUser = Omit<SelectUser, "roleId"> & {
  role: SelectUserRole;
}