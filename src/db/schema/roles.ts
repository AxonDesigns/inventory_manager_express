import { randomUUID } from "crypto";
import { char, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const rolesTable = mysqlTable("roles", {
  id: char("id", { length: 36 }).primaryKey().$default(() => randomUUID()),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});