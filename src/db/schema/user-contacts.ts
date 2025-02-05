import { check, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { numbersOnlyregex as numbersOnlyRegex, timestamps, uuid } from "../utils";
import { usersTable } from "@/db/schema/users";
import { locationsTable } from "@/db/schema/locations";
import { sql } from "drizzle-orm";
import { thirdPartiesTable } from "./third-parties";

export const contactsTable = mysqlTable("contacts", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id),
  thirdPartyId: uuid("third_party_id").references(() => thirdPartiesTable.id),
  locationId: uuid("location_id").references(() => locationsTable.id).notNull(),
  cellphone: varchar("cellphone", { length: 255 }).notNull(),
  telephone: varchar("telephone", { length: 255 }).notNull(),
  ...timestamps
},
  (table) => ({
    cellphoneConstraint: check("contacts_cellphone_check_001", sql.raw(`${table.cellphone.name} REGEXP '${numbersOnlyRegex}'`)),
    telephoneConstraint: check("contacts_telephone_check_001", sql.raw(`${table.telephone.name} REGEXP '${numbersOnlyRegex}'`)),
    withOwnerConstraint: check("contacts_with_owner_check_001", sql`NOT (${table.userId} = NULL && ${table.thirdPartyId} = NULL)`),
  })
);

export type SelectContact = typeof contactsTable.$inferSelect;
export type InsertContact = typeof contactsTable.$inferInsert;