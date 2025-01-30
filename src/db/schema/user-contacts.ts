import { check, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { numbersOnlyregex as numbersOnlyRegex, timestamps, uuid } from "../utils";
import { usersTable } from "@/db/schema/users";
import { locationsTable } from "@/db/schema/locations";
import { sql } from "drizzle-orm";

export const userContactsTable = mysqlTable("user_contacts", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  locationId: uuid("location_id").references(() => locationsTable.id).notNull(),
  cellphone: varchar("cellphone", { length: 255 }).notNull(),
  telephone: varchar("telephone", { length: 255 }).notNull(),
  ...timestamps
},
  (table) => ({
    cellphoneConstraint: check("contacts_cellphone_check_001", sql.raw(`${table.cellphone.name} REGEXP '${numbersOnlyRegex}'`)),
    telephoneConstraint: check("contacts_telephone_check_001", sql.raw(`${table.telephone.name} REGEXP '${numbersOnlyRegex}'`)),
  })
);

export type SelectUserStatus = typeof userContactsTable.$inferSelect;
export type InsertUserStatus = typeof userContactsTable.$inferInsert;