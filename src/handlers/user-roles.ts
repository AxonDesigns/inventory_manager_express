import { db } from "@/db/database";
import { userRolesTable } from "@/db/schema/user-roles";
import { defaultLimit, defaultOffset } from "@/db/utils";
import { InsertUserRole, SelectUserRole } from "@/types";
import { and, eq, or, SQL } from "drizzle-orm";
import { DatabaseError, ValidationError } from "@/lib/errors";

interface GetUserRoleProps {
  id?: SelectUserRole["id"]
  name?: "user" | "admin"
}

export class UserRolesHandler {

  static getAll = async (filters: SQL[], limit: number = defaultLimit, offset: number = defaultOffset): Promise<SelectUserRole[]> => {
    try {
      return db.select().from(userRolesTable).where(and(...filters)).limit(limit).offset(offset);
    } catch (error) {
      throw new Error("Could not get roles");
    }
  }

  static getOne = async ({ id, name }: GetUserRoleProps): Promise<SelectUserRole | null> => {
    if (!id && !name) throw new ValidationError(["Either id or name must be provided"]);

    try {
      let record: SelectUserRole | null = null;
      const records = await this.getAll([id ? (
        eq(userRolesTable.id, id)
      ) : (
        eq(userRolesTable.name, name!)
      )]);
      if (records.length === 0) return null;
      record = records[0];
      return record;
    } catch (error) {
      throw error;
    }
  }

  static create = async (values: InsertUserRole) => {
    try {
      return await db.transaction(async tx => {
        const [{ id }] = await tx.insert(userRolesTable).values(values).$returningId();
        const [saved] = await tx.select().from(userRolesTable).where(eq(userRolesTable.id, id));
        return saved;
      });
    } catch (error: any) {
      if (error.errno === 1062) {
        throw new DatabaseError("Role already exists", 400);
      }
      throw error;
    }
  }

  static update = async (id: SelectUserRole['id'], values: Partial<InsertUserRole>) => {
    let returning = await db.transaction(async tx => {
      await tx.update(userRolesTable).set(values);
      const [saved] = await tx.select().from(userRolesTable).where(eq(userRolesTable.id, id));
      return saved;
    });
    return returning;
  }

  static delete = async (id: SelectUserRole['id']) => {
    let returning = await db.transaction(async tx => {
      const [existent] = await db.select().from(userRolesTable).where(eq(userRolesTable.id, id));
      if (!existent) {
        throw new Error("Role not found");
      }
      await tx.delete(userRolesTable).where(eq(userRolesTable.id, id));
      return existent;
    });
    return returning;
  }
}