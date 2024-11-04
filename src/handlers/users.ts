import { db } from "@/db/database";
import { rolesTable } from "@/db/schema/roles";
import { usersTable } from "@/db/schema/users";
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
    id: rolesTable.id,
    name: rolesTable.name,
    description: rolesTable.description,
    createdAt: rolesTable.createdAt,
    updatedAt: rolesTable.updatedAt
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
    return db.select(userSelectExpandedFields).from(usersTable).innerJoin(rolesTable, eq(usersTable.roleId, rolesTable.id));
  }

  return db.select(userSelectFields).from(usersTable);
}

export const getUsers = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }
  const { limit, offset, expand } = matchedData(req) as { limit?: number, offset?: number, expand?: boolean };

  const foundUsers = await selectUsers(expand !== undefined).limit(limit ?? 20).offset(offset ?? 0);

  console.log(req.cookies.access_token);

  res.json(foundUsers);
};

export const createUser = async (req: Request, res: Response) => {
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

  const existentUser = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existentUser.length > 0) {
    res.status(400).json({ errors: ["Email already exists"] });
    return;
  }

  const existentRole = role ? (
    await db.select().from(rolesTable).where(eq(rolesTable.name, role))
  ) : (
    await db.select().from(rolesTable).where(eq(rolesTable.name, "user"))
  );

  const createdIds = await db.insert(usersTable).values({
    name,
    email,
    roleId: existentRole[0].id,
    password: await hash(password, await genSalt()),
  }).$returningId();

  const createdUsers = await selectUsers(expand !== undefined).where(eq(usersTable.id, createdIds[0].id));

  res.status(201).json(createdUsers[0]);
};

export const getUserById = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }
  const { id, expand } = matchedData(req) as { id: string, expand?: boolean };

  const foundUsers = await selectUsers(expand !== undefined).where(eq(usersTable.id, id));

  res.json(foundUsers[0]);
};

export const updateUser = async (req: Request, res: Response) => {
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

  const existentRoles = role ? (
    await db.select().from(rolesTable).where(eq(rolesTable.name, role))
  ) : undefined;

  if (existentRoles && existentRoles.length === 0) {
    res.status(400).json({ errors: ["Role not found"] });
    return;
  }

  await db.update(usersTable).set({
    name: name,
    email: email,
    roleId: existentRoles ? existentRoles[0].id : undefined,
    password: password ? await hash(password, await genSalt()) : undefined,
  });

  const updatedUsers = await selectUsers(expand !== undefined).where(eq(usersTable.id, id));

  res.json(updatedUsers[0]);
};

export const deleteUser = async (req: Request, res: Response) => {
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

  res.json(foundUsers[0]);
};