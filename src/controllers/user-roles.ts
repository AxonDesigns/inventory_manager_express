import { userRolesTable } from "@/db/schema/user-roles";
import { ilike } from "@/db/utils";
import { createUserRole, deleteUserRole, getUserRole, getUserRoles, updateUserRole } from "@/handlers/user-roles";
import { SQL } from "drizzle-orm";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

export const getUserRolesController = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }
  const { limit, offset, filter } = matchedData(req) as { limit?: number, offset?: number, filter?: string };

  const filters: SQL[] = []
  if (filter) {
    filters.push(ilike(userRolesTable.name, filter))
  }
  const foundRoles = await getUserRoles(filters, limit, offset);

  res.json(foundRoles);
};

export const createUserRoleController = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }

  const { name, description } = matchedData(req) as { name: string, description: string };

  const existentRole = await createUserRole({
    name,
    description
  });

  if (!existentRole) {
    res.status(400).json({ errors: ["Role already exists"] });
    return;
  }

  res.status(201).json({ message: "Role created successfully" });
};

export const getUserRoleController = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }
  const { id } = matchedData(req) as { id: number };

  const foundRole = await getUserRole({ id });

  if (!foundRole) {
    res.status(404).json({ errors: ["Role not found"] });
    return;
  }

  res.json(foundRole);
};

export const updateUserRoleController = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }

  const { id, name, description } = matchedData(req) as { id: number, name?: string, description?: string };
  if (!name && !description) {
    res.status(400).json({ errors: ["At least one field must be updated"] });
    return;
  }

  const role = await updateUserRole(id, { name, description });
  res.json(role);
};

export const deleteUserRoleController = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }

  const { id } = matchedData(req) as { id: number };
  const role = await deleteUserRole(id);

  if (!role) {
    res.status(404).json({ errors: ["Role not found"] });
    return;
  }

  res.json(role);
};