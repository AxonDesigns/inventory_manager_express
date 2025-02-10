import { mysqlTable, text, varchar } from "drizzle-orm/mysql-core";
import { bigIntId, primaryKey, timestamps } from "../utils";

export const locationsTable = mysqlTable("locations", {
  ...primaryKey,
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  districtId: bigIntId("district_id").references(() => districtsTable.id).notNull(),
  zip: varchar("zip", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  ...timestamps,
});

export const countriesTable = mysqlTable("countries", {
  ...primaryKey,
  name: varchar("name", { length: 255 }).notNull().unique(),
  ...timestamps,
});

export const citiesTable = mysqlTable("cities", {
  ...primaryKey,
  name: varchar("name", { length: 255 }).notNull().unique(),
  countryId: bigIntId("country_id").references(() => countriesTable.id).notNull(),
  ...timestamps,
});

export const statesTable = mysqlTable("states", {
  ...primaryKey,
  name: varchar("name", { length: 255 }).notNull().unique(),
  cityId: bigIntId("city_id").references(() => citiesTable.id).notNull(),
  ...timestamps,
});

export const districtsTable = mysqlTable("districts", {
  ...primaryKey,
  name: varchar("name", { length: 255 }).notNull().unique(),
  stateId: bigIntId("state_id").references(() => statesTable.id).notNull(),
  ...timestamps
});

export type SelectLocation = typeof locationsTable.$inferSelect;
export type InsertLocation = typeof locationsTable.$inferInsert;

export type SelectCountry = typeof countriesTable.$inferSelect;
export type InsertCountry = typeof countriesTable.$inferInsert;

export type SelectCity = typeof citiesTable.$inferSelect;
export type InsertCity = typeof citiesTable.$inferInsert;

export type SelectState = typeof statesTable.$inferSelect;
export type InsertState = typeof statesTable.$inferInsert;

export type SelectDistrict = typeof districtsTable.$inferSelect;
export type InsertDistrict = typeof districtsTable.$inferInsert;