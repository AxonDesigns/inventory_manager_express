import { db } from "@/db/database";
import { rolesSchema } from "@/db/schema/roles";
import { usersSchema } from "@/db/schema/users";
import { genSalt, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

export const userSelectExpandedFields = {
  id: usersSchema.id,
  name: usersSchema.name,
  email: usersSchema.email,
  password: usersSchema.password,
  role: {
    id: rolesSchema.id,
    name: rolesSchema.name,
    description: rolesSchema.description,
    createdAt: rolesSchema.createdAt,
    updatedAt: rolesSchema.updatedAt
  },
  createdAt: usersSchema.createdAt,
  updatedAt: usersSchema.updatedAt
}

export const userSelectFields = {
  id: usersSchema.id,
  name: usersSchema.name,
  email: usersSchema.email,
  password: usersSchema.password,
  roleId: usersSchema.roleId,
  createdAt: usersSchema.createdAt,
  updatedAt: usersSchema.updatedAt
}

const selectUsers = (expand: boolean) => {
  if (expand) {
    return db.select(userSelectExpandedFields).from(usersSchema)
      .innerJoin(rolesSchema, eq(usersSchema.roleId, rolesSchema.id));
  }

  return db.select(userSelectFields).from(usersSchema);
}

export const getUsers = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }
  const { limit, offset, expand } = matchedData(req) as { limit?: number, offset?: number, expand?: boolean };

  const foundUsers = await selectUsers(expand !== undefined)
    .limit(limit ?? 20).offset(offset ?? 0);

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

  const existentUser = await db.select().from(usersSchema)
    .where(eq(usersSchema.email, email));
  if (existentUser.length > 0) {
    res.status(400).json({ errors: ["Email already exists"] });
    return;
  }

  const existentRole = role ? (
    await db.select().from(rolesSchema).where(eq(rolesSchema.name, role))
  ) : (
    await db.select().from(rolesSchema).where(eq(rolesSchema.name, "user"))
  );

  const createdIds = await db.insert(usersSchema).values({
    name,
    email,
    roleId: existentRole[0].id,
    password: await hash(password, await genSalt()),
  }).$returningId();

  const createdUsers = await selectUsers(expand !== undefined)
    .where(eq(usersSchema.id, createdIds[0].id));

  res.status(201).json(createdUsers[0]);
};

export const getUserById = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }
  const { id, expand } = matchedData(req) as { id: string, expand?: boolean };

  const foundUsers = await selectUsers(expand !== undefined).where(eq(usersSchema.id, id));

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

  const foundUsers = await selectUsers(true).where(eq(usersSchema.id, id))

  if (foundUsers.length === 0) {
    res.status(404).json({ errors: ["User not found"] });
    return;
  }

  const existentRoles = role ? (
    await db.select().from(rolesSchema).where(eq(rolesSchema.name, role))
  ) : undefined;

  if (existentRoles && existentRoles.length === 0) {
    res.status(400).json({ errors: ["Role not found"] });
    return;
  }

  await db.update(usersSchema).set({
    name: name,
    email: email,
    roleId: existentRoles ? existentRoles[0].id : undefined,
    password: password ? await hash(password, await genSalt()) : undefined,
  });

  const updatedUsers = await selectUsers(expand !== undefined).where(eq(usersSchema.id, id));

  res.json(updatedUsers[0]);
};

export const deleteUser = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }

  const { id, expand } = matchedData(req) as { id: string, expand?: boolean };

  const foundUsers = await selectUsers(expand !== undefined).where(eq(usersSchema.id, id))

  if (foundUsers.length === 0) {
    res.status(404).json({ errors: ["User not found"] });
    return;
  }

  await db.delete(usersSchema).where(eq(usersSchema.id, id));

  res.json(foundUsers[0]);
};