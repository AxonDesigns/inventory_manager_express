import { userRolesTable } from "@/db/schema/user-roles";
import { sql } from "drizzle-orm";
import { check, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { bigIntId, emailRegex, primaryKey, timestamps } from "../utils";
import { userStatusesTable } from "./user-statuses";

export const usersTable = mysqlTable("users", {
  ...primaryKey,
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  roleId: bigIntId("role_id").references(() => userRolesTable.id, { onDelete: "restrict", onUpdate: "cascade" }).notNull(),
  statusId: bigIntId("status_id").references(() => userStatusesTable.id, { onDelete: "restrict", onUpdate: "cascade" }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  verificationToken: varchar("verification_token", { length: 32 }),
  ...timestamps,
},
  (table) => ({
    emailConstraint: check("users_email_check_001", sql.raw(`${table.email.name} REGEXP '${emailRegex}'`)),
  })
);