import { rolesSchema } from "@/db/schema/roles";
import { sql } from "drizzle-orm";
import { check, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { emailRegex, timestamps, uuid } from "../utils";

export const usersSchema = mysqlTable("users", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  roleId: uuid("role_id").references(() => rolesSchema.id).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  ...timestamps,
},
  (table) => ({
    emailConstraint: check("user_email_check_001", sql`${table.email} REGEXP '^(?=[a-zA-Z0-9@._%+-]{1,254}$)([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9-]+\\.[a-zA-Z]{2,})$'`),
  })
);

export type SelectUser = typeof usersSchema.$inferSelect;
export type InsertUser = typeof usersSchema.$inferInsert;