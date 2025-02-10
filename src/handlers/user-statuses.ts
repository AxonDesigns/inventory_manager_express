import { db } from "@/db/database";
import { userStatusesTable } from "@/db/schema/user-statuses";
import { InsertUserStatus, SelectUserStatus } from "@/types";
import { and, eq, SQL } from "drizzle-orm";

const defaultLimit = 20;
const defaultOffset = 0;

interface GetUserStatusProps {
  id?: SelectUserStatus["id"]
  name?: "pending" | "active" | "inactive" | "suspended"
}

export const getUserStatuses = async (
  filters: SQL[],
  limit: number = defaultLimit,
  offset: number = defaultOffset
): Promise<SelectUserStatus[]> => {
  try {
    const records = await db.select().from(userStatusesTable).where(and(...filters)).limit(limit).offset(offset);
    return records;
  } catch (error) {
    return [];
  }
}

export const getUserStatus = async ({ id, name }: GetUserStatusProps): Promise<SelectUserStatus | null> => {
  if (!id && !name) return null;
  try {
    let record: SelectUserStatus | null = null;
    if (id) {
      const [found] = await getUserStatuses([eq(userStatusesTable.id, id)])
      record = found;
    }
    else if (name) {
      const [found] = await getUserStatuses([eq(userStatusesTable.name, name)]);
      record = found;
    }
    return record;
  } catch (error) {
    return null;
  }
}

export const createUserStatus = async (values: InsertUserStatus) => {
  try {
    let returning = await db.transaction(async tx => {
      const [{ id }] = await tx.insert(userStatusesTable).values(values).$returningId();
      const [saved] = await tx.select().from(userStatusesTable).where(eq(userStatusesTable.id, id));
      return saved;
    });
    return returning;
  } catch (error) {
    return null;
  }
}


export const updateUserStatus = async (id: SelectUserStatus['id'], values: Partial<SelectUserStatus>) => {
  let returning = await db.transaction(async tx => {
    await tx.update(userStatusesTable).set(values)
    const [saved] = await tx.select().from(userStatusesTable).where(eq(userStatusesTable.id, id));
    return saved;
  });
  return returning;
}

export const deleteUserStatus = async (id: SelectUserStatus['id']) => {
  try {
    let returning = await db.transaction(async tx => {
      const [existant] = await db.select().from(userStatusesTable).where(eq(userStatusesTable.id, id));
      if (!existant) {
        return null;
      }
      await tx.delete(userStatusesTable).where(eq(userStatusesTable.id, id));
      return existant;
    });
    return returning;
  } catch (error) {
    console.log(typeof error, error);
    return null;
  }
}