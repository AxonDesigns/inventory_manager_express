import { db } from "@/db/database";
import { SelectUserRole, userRolesTable } from "@/db/schema/roles";
import { SelectExpandedUser, SelectUser, usersTable } from "@/db/schema/users";
import { genSalt, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

export const userSelectExpandedFields = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  password: usersTable.password,
  role: {
    id: userRolesTable.id,
    name: userRolesTable.name,
    description: userRolesTable.description,
    createdAt: userRolesTable.createdAt,
    updatedAt: userRolesTable.updatedAt
  },
  createdAt: usersTable.createdAt,
  updatedAt: usersTable.updatedAt
}

export const userSelectFields = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  password: usersTable.password,
  roleId: usersTable.roleId,
  createdAt: usersTable.createdAt,
  updatedAt: usersTable.updatedAt
}

const selectUsers = (expand: boolean) => {
  if (expand) {
    return db.select(userSelectExpandedFields).from(usersTable)
      .innerJoin(userRolesTable, eq(usersTable.roleId, userRolesTable.id));
  }

  return db.select(userSelectFields).from(usersTable);
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      res.status(400).json({ errors: results.array().map((err) => err.msg) });
      return;
    }
    const { limit, offset, expand } = matchedData(req) as { limit?: number, offset?: number, expand?: boolean };

    const foundUsers = await selectUsers(expand !== undefined)
      .limit(limit ?? 20).offset(offset ?? 0);

    const users = foundUsers.map(({ password, ...payload }) => payload);

    res.json(users);
  } catch (error) {
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
    const { name, role, email, password, expand } = matchedData(req) as {
      name: string,
      role?: string,
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

    let existentRoles = [];

    if (role) {
      existentRoles = await db.select().from(userRolesTable).where(eq(userRolesTable.id, role))

      if (existentRoles.length === 0) {
        existentRoles = await db.select().from(userRolesTable).where(eq(userRolesTable.name, role))
      }
    } else {
      existentRoles = await db.select().from(userRolesTable).where(eq(userRolesTable.name, "user"))
    }

    if (existentRoles.length === 0) {
      res.status(400).json({ errors: ["Role not found"] });
      return;
    }

    const createdIds = await db.insert(usersTable).values({
      name,
      email,
      roleId: existentRoles[0].id,
      password: await hash(password, await genSalt()),
    }).$returningId();

    const createdUsers = await selectUsers(expand !== undefined)
      .where(eq(usersTable.id, createdIds[0].id));

    const { password: _, ...payload } = createdUsers[0];

    res.status(201).json(payload);
  } catch (error) {
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

    const foundUsers = await selectUsers(expand !== undefined).where(eq(usersTable.id, id));

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

    const { id, name, role, email, password, expand } = matchedData(req) as {
      id: string,
      name?: string,
      role?: string,
      email?: string,
      password?: string,
      expand?: boolean
    };

    if (!name && !role && !email && !password) {
      res.status(400).json({ errors: ["At least one field must be updated"] });
      return;
    }

    const foundUsers = await selectUsers(true).where(eq(usersTable.id, id))

    if (foundUsers.length === 0) {
      res.status(404).json({ errors: ["User not found"] });
      return;
    }

    const foundUser = foundUsers[0] as SelectExpandedUser;

    if (
      (name && foundUser.name !== name) ||
      (role && foundUser.role.id !== role) ||
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
      name: foundUsers[0].name === name ? undefined : name,
      email: foundUsers[0].email === email ? undefined : email,
      roleId: existentRoles.length > 0 ? existentRoles[0].id : undefined,
      password: password ? await hash(password, await genSalt()) : undefined,
    }).where(eq(usersTable.id, id));

    const updatedUsers = await selectUsers(expand !== undefined).where(eq(usersTable.id, id));

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

    const foundUsers = await selectUsers(expand !== undefined).where(eq(usersTable.id, id))

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