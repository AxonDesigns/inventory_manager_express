import { db } from "@/db/database";
import { Table } from "drizzle-orm";
import { MySqlTable } from "drizzle-orm/mysql-core";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

interface GetAllConfig<T extends MySqlTable> {
  table: T
  limit?: number | null
  offset?: number
}

export async function getAll<T extends MySqlTable>({
  table,
  limit = 20,
  offset = 0,
}: GetAllConfig<T>) {
  const foundRecords = db.select().from(table);
  return limit ? foundRecords.limit(limit).offset(offset) : foundRecords;
}

interface CreateConfig<T extends MySqlTable> {
  table: T
  props: T['$inferInsert']
}

export async function create<T extends MySqlTable>({
  table, props
}: CreateConfig<T>) {
  const ids = await db.insert(table).values(props).$returningId();

  return ids[0];
};