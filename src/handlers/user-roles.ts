import { db } from "@/db/database";
import { userRolesTable } from "@/db/schema/user-roles";
import { defaultLimit, defaultOffset, ilike } from "@/db/utils";
import { InsertUserRole, SelectUserRole } from "@/types";
import { and, eq, or, SQL } from "drizzle-orm";

interface GetUserRoleProps {
  id?: SelectUserRole["id"]
  name?: "user" | "admin"
}

export const getUserRoles = async (filters: SQL[], limit: number = defaultLimit, offset: number = defaultOffset): Promise<SelectUserRole[]> => {
  try {
    return db.select().from(userRolesTable).where(and(...filters)).limit(limit).offset(offset);
  } catch (error) {
    throw new Error("Error getting list of roles");
  }
}

export const getUserRole = async ({ id, name }: GetUserRoleProps): Promise<SelectUserRole | null> => {
  if (!id && !name) return null;
  try {
    let record: SelectUserRole | null = null;
    if (id) {
      const [found] = await getUserRoles([eq(userRolesTable.id, id)]);
      record = found;
    }
    else if (name) {
      const [found] = await getUserRoles([eq(userRolesTable.name, name)]);
      record = found;
    }
    return record;
  } catch (error) {
    throw error;
  }
}

export const createUserRole = async (values: InsertUserRole) => {
  try {
    let returning = await db.transaction(async tx => {
      const [{ id }] = await tx.insert(userRolesTable).values(values).$returningId();
      const [saved] = await tx.select().from(userRolesTable).where(eq(userRolesTable.id, id));
      return saved;
    });
    return returning;
  } catch (error) {
    return null;
  }
}

export const updateUserRole = async (id: SelectUserRole['id'], values: Partial<InsertUserRole>) => {
  let returning = await db.transaction(async tx => {
    await tx.update(userRolesTable).set(values);
    const [saved] = await tx.select().from(userRolesTable).where(eq(userRolesTable.id, id));
    return saved;
  });
  return returning;
}

export const deleteUserRole = async (id: SelectUserRole['id']) => {
  try {
    let returning = await db.transaction(async tx => {
      const [existant] = await db.select().from(userRolesTable).where(eq(userRolesTable.id, id));
      if (!existant) {
        return null;
      }
      await tx.delete(userRolesTable).where(eq(userRolesTable.id, id));
      return existant;
    });
    return returning;
  } catch (error) {
    return null;
  }
}