import { check, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { usersSchema } from "./users";
import { sql } from "drizzle-orm";
import { emailRegex, uuid } from "../utils";

export const organizationsSchema = mysqlTable("organizations", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    status: varchar("status", { length: 255 }).notNull(),
    typeId: uuid("type_id").references(() => organizationTypesSchema.id).notNull(),
    ownerId: uuid("owner_id").references(() => usersSchema.id).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    website: varchar("website", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
},
    (table) => ({
        phoneConstraint: check("org_phone_check_001", sql`${table.phone} REGEXP '^\\+?[0-9]+$'`),
        emailConstraint: check("org_email_check_001", sql`${table.email} REGEXP '^(?=[a-zA-Z0-9@._%+-]{1,254}$)([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9-]+\\.[a-zA-Z]{2,})$'`),
    })
);

export const organizationTypesSchema = mysqlTable("organization_types", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});