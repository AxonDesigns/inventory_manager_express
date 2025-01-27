import { mysqlTable, text, varchar } from "drizzle-orm/mysql-core";
import { timestamps, uuid } from "../utils";

export const locationsTable = mysqlTable("locations", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    address: varchar("address", { length: 255 }).notNull(),
    zip: varchar("zip", { length: 255 }).notNull(),
    countryId: uuid("country_id").references(() => countriesTable.id).notNull(),
    cityId: uuid("city_id").references(() => citiesTable.id).notNull(),
    stateId: uuid("state_id").references(() => statesTable.id).notNull(),
    ...timestamps,
});

export const countriesTable = mysqlTable("countries", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    ...timestamps,
});

export const citiesTable = mysqlTable("cities", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    ...timestamps,
});

export const statesTable = mysqlTable("states", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    ...timestamps,
});

export type SelectLocation = typeof locationsTable.$inferSelect;
export type InsertLocation = typeof locationsTable.$inferInsert;

export type SelectCountry = typeof countriesTable.$inferSelect;
export type InsertCountry = typeof countriesTable.$inferInsert;

export type SelectCity = typeof citiesTable.$inferSelect;
export type InsertCity = typeof citiesTable.$inferInsert;

export type SelectState = typeof statesTable.$inferSelect;
export type InsertState = typeof statesTable.$inferInsert;