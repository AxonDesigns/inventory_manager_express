import { db } from "@/db/database";
import { userStatusesTable } from "@/db/schema/user-statuses";
import { DatabaseError, ValidationError } from "@/lib/errors";
import { InsertUserStatus, SelectUserStatus } from "@/types";
import { and, eq, SQL } from "drizzle-orm";

const defaultLimit = 20;
const defaultOffset = 0;

interface GetUserStatusProps {
  id?: SelectUserStatus["id"]
  name?: "pending" | "active" | "inactive" | "suspended"
}

export class UserStatusesHandler {
  static getAll = async (
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

  static getOne = async ({ id, name }: GetUserStatusProps) => {
    if (!id && !name) throw new ValidationError(["Either id or name must be provided"]);
    try {
      let [record] = await this.getAll([id ? (
        eq(userStatusesTable.id, id)
      ) : (
        eq(userStatusesTable.name, name!)
      )]);
      if (!record) {
        throw new DatabaseError("User status not found", 404);
      }
      return record;
    } catch (error) {
      throw error;
    }
  }

  static create = async (values: InsertUserStatus) => {
    try {
      let returning = await db.transaction(async tx => {
        const [{ id }] = await tx.insert(userStatusesTable).values(values).$returningId();
        const [saved] = await tx.select().from(userStatusesTable).where(eq(userStatusesTable.id, id));
        return saved;
      });
      return returning;
    } catch (error: any) {
      if (error.errno === 1062) {
        throw new DatabaseError("Role already exists", 400);
      }
      throw error;
    }
  }


  static update = async (id: SelectUserStatus['id'], values: Partial<SelectUserStatus>) => {
    let returning = await db.transaction(async tx => {
      await tx.update(userStatusesTable).set(values)
      const [saved] = await tx.select().from(userStatusesTable).where(eq(userStatusesTable.id, id));
      return saved;
    });
    return returning;
  }

  static delete = async (id: SelectUserStatus['id']) => {
    let returning = await db.transaction(async tx => {
      const [existent] = await db.select().from(userStatusesTable).where(eq(userStatusesTable.id, id));
      if (!existent) {
        throw new DatabaseError("User status not found", 404);
      }
      await tx.delete(userStatusesTable).where(eq(userStatusesTable.id, id));
      return existent;
    });
    return returning;
  }
}