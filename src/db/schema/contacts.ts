import { locationsTable, SelectLocation } from "@/db/schema/locations";
import { sql } from "drizzle-orm";
import { check, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { bigIntId, numbersOnlyregex as numbersOnlyRegex, primaryKey, timestamps } from "../utils";

export const contactsTable = mysqlTable("contacts", {
  ...primaryKey,
  locationId: bigIntId("location_id").references(() => locationsTable.id),
  cellphone: varchar("cellphone", { length: 255 }),
  telephone: varchar("telephone", { length: 255 }),
  ...timestamps
},
  (table) => ({
    cellphoneConstraint: check("contacts_cellphone_check_001", sql.raw(`${table.cellphone.name} REGEXP '${numbersOnlyRegex}'`)),
    telephoneConstraint: check("contacts_telephone_check_001", sql.raw(`${table.telephone.name} REGEXP '${numbersOnlyRegex}'`)),
    atLeastOneConstraint: check(
      "contacts_at_least_one_constraint_check_001",
      sql`NOT (${table.locationId} IS NULL AND ${table.cellphone} IS NULL AND ${table.telephone} IS NULL)`
    ),
  })
);

export type SelectContact = typeof contactsTable.$inferSelect;
export type InsertContact = typeof contactsTable.$inferInsert;

export type SelectExpandedContact = Omit<SelectContact, "locationId"> & {
  location: SelectLocation | null
}