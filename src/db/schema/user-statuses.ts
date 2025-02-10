import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { primaryKey, timestamps } from "../utils";

export const userStatusesTable = mysqlTable("user_statuses", {
  ...primaryKey,
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 255 }).notNull(),
  ...timestamps
});