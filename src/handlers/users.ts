import { db } from "@/db/database";
import { userRolesTable } from "@/db/schema/user-roles";
import { userStatusesTable } from "@/db/schema/user-statuses";
import { usersTable } from "@/db/schema/users";
import { defaultLimit, defaultOffset } from "@/db/utils";
import { DatabaseError, ValidationError } from "@/lib/errors";
import { InsertUser, SelectExpandedUser, SelectPublicExpandedUser, SelectPublicUser, SelectUser } from "@/types";
import { genSalt, hash } from "bcrypt";
import { and, eq, getTableColumns, SQL } from "drizzle-orm";

type ExpandablePublicableUser<T extends boolean, U extends boolean> = T extends true ? U extends true ? SelectExpandedUser : SelectPublicExpandedUser : U extends true ? SelectUser : SelectPublicUser

interface GetUsersProps<T extends boolean, U extends boolean> {
  filters?: SQL[],
  expand?: T,
  limit?: number,
  offset?: number,
  asPrivate?: U,
}

export class UserHandler {
  static async getAll<T extends boolean, U extends boolean>({
    filters = [],
    expand,
    limit = defaultLimit,
    offset = defaultOffset,
    asPrivate
  }: GetUsersProps<T, U>): Promise<ExpandablePublicableUser<T, U>[]> {
    try {
      let rawUsers = []
      if (expand) {
        const { roleId, statusId, ...fields } = getTableColumns(usersTable)
        rawUsers = await db.select({
          ...fields,
          role: getTableColumns(userRolesTable),
          status: getTableColumns(userStatusesTable),
        }).from(usersTable)
          .where(and(...filters))
          .innerJoin(userRolesTable, eq(usersTable.id, userRolesTable.id))
          .innerJoin(userStatusesTable, eq(usersTable.id, userStatusesTable.id))
          .limit(limit).offset(offset);
      } else {
        rawUsers = await db.select().from(usersTable)
          .where(and(...filters))
          .limit(limit).offset(offset);
      }

      const users = asPrivate ? rawUsers : rawUsers.map(({ password, verificationToken, ...payload }) => payload);

      return users as ExpandablePublicableUser<T, U>[];
    } catch (error) {
      throw error;
    }
  }

  static async create<T extends boolean, U extends boolean>(
    values: InsertUser,
    { expand, asPrivate }: { expand?: T, asPrivate?: U }) {
    try {
      const existentUser = await db.select().from(usersTable)
        .where(eq(usersTable.email, values.email));
      if (existentUser.length > 0) {
        throw new DatabaseError("A user with this email already exists", 400);
      }

      const [{ id: createdId }] = await db.insert(usersTable).values({
        ...values,
        password: await hash(values.password, await genSalt()),
      }).$returningId();

      if (!createdId) {
        throw new DatabaseError("User could not be created", 500);
      }

      const createdUser = await this.getOne<T, U>({
        id: createdId,
        expand,
        asPrivate
      });

      return createdUser;
    } catch (error) {
      throw error;
    }
  }

  static async getOne<T extends boolean, U extends boolean>(
    { id, email, expand, asPrivate }: { id?: SelectUser['id'], email?: string, expand?: T, asPrivate?: U }
  ) {
    if (!id && !email) {
      throw new ValidationError(["Either id or email must be provided"]);
    }
    const [user] = await this.getAll<T, U>({
      filters: [id ? (
        eq(usersTable.id, id)
      ) : (
        eq(usersTable.email, email!)
      )],
      expand,
      asPrivate
    });
    if (!user) return null;
    return user;
  }

  static async update<T extends boolean, U extends boolean>(id: SelectUser['id'],
    values: Partial<SelectUser>,
    { expand, asPrivate }: { expand?: T, asPrivate?: U }
  ) {
    try {

      const fields = Object.values(values).filter(e => e !== undefined);

      if (fields.length === 0) {
        return null;
      }

      await db.update(usersTable).set({
        ...values,
        password: values.password ? await hash(values.password, await genSalt()) : undefined,
      }).where(eq(usersTable.id, id));

      const updatedUser = await this.getOne<T, U>({
        id,
        expand,
        asPrivate
      });

      return updatedUser;
    } catch (error) {
      return null;
    }
  }

  static async delete<T extends boolean, U extends boolean>(
    id: SelectUser['id'],
    { expand, asPrivate }: { expand?: T, asPrivate?: U }) {
    try {
      const user = await this.getOne<T, U>({ id, expand, asPrivate });
      await db.delete(usersTable).where(eq(usersTable.id, id));
      return user;
    } catch (error) {
      return null;
    }
  }
}