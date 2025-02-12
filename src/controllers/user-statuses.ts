import { userStatusesTable } from "@/db/schema/user-statuses";
import { ilike } from "@/db/utils";
import { UserStatusesHandler } from "@/handlers/user-statuses";
import { errorHandler } from "@/lib/error-handling";
import { DatabaseError } from "@/lib/errors";
import { zodErrorToErrorList } from "@/lib/utils";
import { SQL } from "drizzle-orm";
import { Request, Response } from "express";
import { z } from "zod";

const getAllSchema = z.object({
  query: z.object({
    limit: z.number().min(1).int().default(20),
    offset: z.number().min(0).int().default(0),
    filter: z.string().optional(),
  })
});

const getOneSchema = z.object({
  params: z.object({
    id: z.coerce.number().positive(),
  })
});

const createSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string(),
  })
});

const updateSchema = z.object({
  params: z.object({
    id: z.number().positive(),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  })
}).refine((data) => {
  if (!data.body.name && !data.body.description) {
    return false;
  }
  return true;
}, { message: "At least one field must be updated" });

const deleteSchema = z.object({
  params: z.object({
    id: z.number().positive(),
  })
});

export class UserStatesController {
  static getAll = async (req: Request, res: Response) => {
    const result = getAllSchema.safeParse({ query: req.query });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }
    const { query: { limit, offset, filter } } = result.data;

    const filters: SQL[] = []
    if (filter) {
      filters.push(ilike(userStatusesTable.name, filter))
    }
    try {
      const foundRoles = await UserStatusesHandler.getAll(filters, limit, offset);
      res.json(foundRoles);
    } catch (error) {
      errorHandler(req, res, error);
    }
  };

  static create = async (req: Request, res: Response) => {
    const result = createSchema.safeParse({ body: req.body });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }

    try {
      const existentStatus = await UserStatusesHandler.create(result.data.body);
      res.status(201).json(existentStatus);
    } catch (error) {
      errorHandler(req, res, error);
    }
  };

  static getOne = async (req: Request, res: Response) => {
    const result = getOneSchema.safeParse({ params: req.params });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }

    const { params: { id } } = result.data;

    try {
      const foundStatus = await UserStatusesHandler.getOne({ id });

      if (!foundStatus) {
        res.status(404).json({ errors: ["Status not found"] });
        return;
      }

      res.json(foundStatus);
    } catch (error) {
      errorHandler(req, res, error);
    }
  };

  static update = async (req: Request, res: Response) => {
    const result = updateSchema.safeParse({ body: req.body });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }
    const { params: { id }, body: { name, description } } = result.data;

    if (!name && !description) {
      res.status(400).json({ errors: ["At least one field must be updated"] });
      return;
    }

    try {
      const role = await UserStatusesHandler.update(id, { name, description });
      res.json(role);
    } catch (error) {
      errorHandler(req, res, error);
    }
  };

  static delete = async (req: Request, res: Response) => {
    const result = deleteSchema.safeParse({ params: req.params });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }
    const { params: { id } } = result.data;
    try {
      const role = await UserStatusesHandler.delete(id);
      if (!role) {
        res.status(404).json({ errors: ["Role not found"] });
        return;
      }
      res.json(role);
    } catch (error) {
      errorHandler(req, res, error);
    }
  };
}