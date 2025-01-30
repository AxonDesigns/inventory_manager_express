import { db } from "@/db/database";
import { SelectUserRole, userRolesTable } from "@/db/schema/user-roles";
import { userStatusesTable } from "@/db/schema/user-status";
import { usersTable } from "@/db/schema/users";
import { genSalt, hash } from "bcrypt";
import { eq, getTableColumns } from "drizzle-orm";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

export const selectUsersExpanded = () => {
  const { roleId, statusId, ...userColumns } = getTableColumns(usersTable);
  const userSelectExpandedFields = {
    ...userColumns,
    role: getTableColumns(userRolesTable),
    status: getTableColumns(userStatusesTable),
  }

  return db.select(userSelectExpandedFields).from(usersTable)
    .innerJoin(userRolesTable, eq(usersTable.roleId, userRolesTable.id))
    .innerJoin(userStatusesTable, eq(usersTable.statusId, userStatusesTable.id));
}

const selectUsers = () => {
  return db.select().from(usersTable);
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      res.status(400).json({ errors: results.array().map((err) => err.msg) });
      return;
    }
    const { limit, offset, expand } = matchedData(req) as { limit?: number, offset?: number, expand?: boolean };
    const shouldExpand = expand !== undefined || expand;
    const foundUsers = await (shouldExpand ? selectUsersExpanded() : selectUsers())
      .limit(limit ?? 20).offset(offset ?? 0);

    const users = foundUsers.map(({ password, ...payload }) => payload);

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: ["An error occurred"] });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      res.status(400).json({ errors: results.array().map((err) => err.msg) });
      return;
    }
    const { name, role, status, email, password, expand } = matchedData(req) as {
      name: string,
      role?: string,
      status?: string,
      email: string,
      password: string,
      expand?: boolean
    };

    const existentUser = await db.select().from(usersTable)
      .where(eq(usersTable.email, email));
    if (existentUser.length > 0) {
      res.status(400).json({ errors: ["Email already exists"] });
      return;
    }

    const [existentRole] = await db.select().from(userRolesTable).where(eq(userRolesTable.id, role ?? "user"))
    if (!existentRole) {
      res.status(400).json({ errors: ["Role not found"] });
      return;
    }

    if (!existentRole) {
      res.status(400).json({ errors: ["Role not found"] });
      return;
    }

    const [foundStatus] = await db.select().from(userStatusesTable).where(eq(userStatusesTable.name, status ?? "pending"));

    if (!foundStatus) {
      res.status(400).json({ errors: ["Pending role not found"] });
      return;
    }

    const [{ id: createdId }] = await db.insert(usersTable).values({
      name,
      email,
      roleId: existentRole.id,
      statusId: foundStatus.id,
      password: await hash(password, await genSalt()),
    }).$returningId();

    const createdUsers = await (expand ? selectUsersExpanded() : selectUsers())
      .where(eq(usersTable.id, createdId));

    const { password: _, ...payload } = createdUsers[0];

    res.status(201).json(payload);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: ["An error occurred"] });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      res.status(400).json({ errors: results.array().map((err) => err.msg) });
      return;
    }
    const { id, expand } = matchedData(req) as { id: string, expand?: boolean };

    const foundUsers = await (expand ? selectUsersExpanded() : selectUsers()).where(eq(usersTable.id, id));

    const { password: _, ...payload } = foundUsers[0];

    res.json(payload);
  } catch (error) {
    res.status(500).json({ errors: ["An error occurred"] });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      res.status(400).json({ errors: results.array().map((err) => err.msg) });
      return;
    }

    const { id, name, role, status, email, password, expand } = matchedData(req) as {
      id: string,
      name?: string,
      role?: string,
      status?: string,
      email?: string,
      password?: string,
      expand?: boolean
    };

    if (!name && !role && !email && !password) {
      res.status(400).json({ errors: ["At least one field must be updated"] });
      return;
    }

    const [foundUser] = await selectUsersExpanded().where(eq(usersTable.id, id));

    if (!foundUser) {
      res.status(404).json({ errors: ["User not found"] });
      return;
    }

    if (
      (name && foundUser.name !== name) ||
      (role && foundUser.role.id !== role) ||
      (status && foundUser.status.id !== status) ||
      (email && foundUser.email !== email) ||
      (password && foundUser.password !== password)
    ) {

    }

    let existentRoles: SelectUserRole[] = [];

    if (role) {
      existentRoles = await db.select().from(userRolesTable).where(eq(userRolesTable.id, role))

      if (existentRoles.length === 0) {
        existentRoles = await db.select().from(userRolesTable).where(eq(userRolesTable.name, role))
      }
    }

    if (role && existentRoles.length === 0) {
      res.status(404).json({ errors: ["Role not found"] });
      return;
    }

    await db.update(usersTable).set({
      name: foundUser.name === name ? undefined : name,
      email: foundUser.email === email ? undefined : email,
      roleId: existentRoles.length > 0 ? existentRoles[0].id : undefined,
      password: password ? await hash(password, await genSalt()) : undefined,
    }).where(eq(usersTable.id, id));

    const updatedUsers = await (expand ? selectUsersExpanded() : selectUsers()).where(eq(usersTable.id, id));

    const { password: _, ...payload } = updatedUsers[0];

    res.json(payload);
  } catch (error) {
    res.status(500).json({ errors: ["An error occurred"] });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      res.status(400).json({ errors: results.array().map((err) => err.msg) });
      return;
    }

    const { id, expand } = matchedData(req) as { id: string, expand?: boolean };

    const foundUsers = await (expand ? selectUsersExpanded() : selectUsers()).where(eq(usersTable.id, id))

    if (foundUsers.length === 0) {
      res.status(404).json({ errors: ["User not found"] });
      return;
    }

    await db.delete(usersTable).where(eq(usersTable.id, id));

    const { password: _, ...payload } = foundUsers[0];

    res.json(payload);
  } catch (error) {
    res.status(500).json({ errors: ["An error occurred"] });
  }
};