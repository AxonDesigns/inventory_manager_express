import { bigint, timestamp } from "drizzle-orm/mysql-core";
import { ilike as _ilike, sql } from 'drizzle-orm';

export const defaultLimit = 20;
export const defaultOffset = 0;

export const emailRegex = "^(?=[a-zA-Z0-9@._%+-]{1,254}$)([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9-]+\\.[a-zA-Z]{2,})$" as const;
export const numbersOnlyregex = "^[0-9]+$";

export const complexEmailRegex = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/

//export const uuid = (name: string) => char(name, { length: 36 }).$default(() => randomUUID());
export const bigIntId = (name: string = "id") => bigint(name, { mode: "number", unsigned: true });

export const primaryKey = {
  id: bigIntId().primaryKey().autoincrement(),
}

export const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
} as const;

export function ilike(
  column: Parameters<typeof _ilike>[0],
  value: Parameters<typeof _ilike>[1],
) {
  // like(column, `%${value}%`)
  return sql.raw(`LOWER(${column.name}) LIKE LOWER('%${value}%')`)

}