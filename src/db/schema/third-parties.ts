import { SelectUserRole, userRolesTable } from "@/db/schema/roles";
import { sql } from "drizzle-orm";
import { check, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { emailRegex, timestamps, uuid } from "../utils";

export const thirdPartiesTable = mysqlTable("third_parties", {
    id: uuid("id").primaryKey(),
    legalName: varchar("legal_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    statusId: uuid("status").references(() => thirdPartyStatusesTable.id).notNull(),
    ...timestamps,
},
    (table) => ({
        emailConstraint: check("third_parties_email_check_001", sql.raw(`${table.email.name} REGEXP '${emailRegex}'`)),
    })
);

export type SelectThirdParty = typeof thirdPartiesTable.$inferSelect;
export type InsertThirdParty = typeof thirdPartiesTable.$inferInsert;

export const thirdPartyStatusesTable = mysqlTable("third_party_statuses", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 255 }).notNull(),
    ...timestamps,
});

export type SelectThirdPartyStatus = typeof thirdPartyStatusesTable.$inferSelect;
export type InsertThirdPartyStatus = typeof thirdPartyStatusesTable.$inferInsert;