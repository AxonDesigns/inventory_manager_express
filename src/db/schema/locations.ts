import { mysqlTable, text, varchar } from "drizzle-orm/mysql-core";
import { timestamps, uuid } from "../utils";

export const locationsSchema = mysqlTable("locations", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    address: varchar("address", { length: 255 }).notNull(),
    zip: varchar("zip", { length: 255 }).notNull(),
    countryId: uuid("country_id").references(() => countriesSchema.id).notNull(),
    cityId: uuid("city_id").references(() => citySchema.id).notNull(),
    stateId: uuid("state_id").references(() => stateSchema.id).notNull(),
    ...timestamps,
});

export const countriesSchema = mysqlTable("countries", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    ...timestamps,
});

export const citySchema = mysqlTable("city", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    ...timestamps,
});

export const stateSchema = mysqlTable("state", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    ...timestamps,
});