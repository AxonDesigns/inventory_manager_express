import { Request, Response } from "express";
import { userRolesTable } from "@/db/schema/user-roles";
import { ilike } from "@/db/utils";
import { UserRolesHandler } from "@/handlers/user-roles";
import { eq, SQL } from "drizzle-orm";
import { z } from "zod";
import { DatabaseError } from "@/lib/errors";
import { zodErrorToErrorList } from "@/lib/utils";

/* 
expand: z.preprocess((value) => {
  return value !== undefined;
}, z.boolean().default(false)),
*/

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
  return data.body.name || data.body.description;
}, { message: "At least one field must be updated" });

const deleteSchema = z.object({
  params: z.object({
    id: z.number().positive(),
  })
});

export class UserRolesController {
  static getAll = async (req: Request, res: Response) => {
    const result = getAllSchema.safeParse({ query: req.query });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }
    const { query: { limit, offset, filter } } = result.data;

    const filters: SQL[] = filter ? [ilike(userRolesTable.name, filter)] : [];
    try {
      const foundRoles = await UserRolesHandler.getAll(filters, limit, offset);
      res.json(foundRoles);
    } catch (error) {
      res.status(500).json({ errors: ["An error occurred"] });
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
      const foundRole = await UserRolesHandler.getOne({ id });
      if (!foundRole) {
        res.status(404).json({ errors: ["Role not found"] });
        return;
      }
      res.json(foundRole);
    } catch (error) {
      res.status(500).json({ errors: ["An error occurred"] });
    }
  };

  static create = async (req: Request, res: Response) => {
    const result = createSchema.safeParse({ body: req.body });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }

    try {
      const existentRole = await UserRolesHandler.create(result.data.body);
      res.status(201).json(existentRole);
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        res.status(error.code).json({ errors: [error.message] });
        return;
      }
      res.status(500).json({ errors: ["An error occurred"] });
    }
  }

  static update = async (req: Request, res: Response) => {
    const result = updateSchema.safeParse({ body: req.body });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }

    const { params: { id }, body: { name, description } } = result.data;

    try {
      const role = await UserRolesHandler.update(id, { name, description });
      res.json(role);
    } catch (error: any) {
      res.status(500).json({ errors: ["An error occurred"] });
    }
  }

  static delete = async (req: Request, res: Response) => {
    const result = deleteSchema.safeParse({ params: req.params });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }
    const { params: { id } } = result.data;

    try {
      const role = await UserRolesHandler.delete(id);
      res.json(role);
    } catch (error: any) {
      res.status(500).json({ errors: ["An error occurred"] });
    }
  }
}