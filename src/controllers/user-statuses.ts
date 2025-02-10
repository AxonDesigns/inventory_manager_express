import { userStatusesTable } from "@/db/schema/user-statuses";
import { ilike } from "@/db/utils";
import { createUserStatus, deleteUserStatus, getUserStatus, getUserStatuses, updateUserStatus } from "@/handlers/user-statuses";
import { SQL } from "drizzle-orm";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

export const getUserStatusesController = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }
  const { limit, offset, filter } = matchedData(req) as { limit?: number, offset?: number, filter?: string };

  const filters: SQL[] = []
  if (filter) {
    filters.push(ilike(userStatusesTable.name, filter))
  }
  const foundRoles = await getUserStatuses(filters, limit, offset);

  res.json(foundRoles);
};

export const createUserStatusController = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }

  const { name, description } = matchedData(req) as { name: string, description: string };

  const existentStatus = await createUserStatus({
    name,
    description
  });

  if (!existentStatus) {
    res.status(400).json({ errors: ["Status already exists"] });
    return;
  }

  res.status(201).json({ message: "Status created successfully" });
};

export const getUserStatusController = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }
  const { id } = matchedData(req) as { id: number };

  const foundStatus = await getUserStatus({ id });

  if (!foundStatus) {
    res.status(404).json({ errors: ["Status not found"] });
    return;
  }

  res.json(foundStatus);
};

export const updateUserStatusController = async (req: Request, res: Response) => {
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

  try {
    const role = await updateUserStatus(id, { name, description });
    res.json(role);
  } catch (error) {
    console.log("TIPO: ", typeof error, "OBJECT: ", error);
    res.status(500).json({ errors: [error] });
  }
};

export const deleteUserStatusController = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }

  const { id } = matchedData(req) as { id: number };
  const role = await deleteUserStatus(id);

  if (!role) {
    res.status(404).json({ errors: ["Role not found"] });
    return;
  }

  res.json(role);
};