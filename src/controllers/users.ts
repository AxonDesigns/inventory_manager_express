import { UserRolesHandler } from "@/handlers/user-roles";
import { UserStatusesHandler } from "@/handlers/user-statuses";
import { UserHandler } from "@/handlers/users";
import { DatabaseError } from "@/lib/errors";
import { expandSchema, getCurrentUser, zodErrorToErrorList } from "@/lib/utils";
import { genSalt, hash } from "bcrypt";
import { Request, Response } from "express";
import { z } from "zod";

const getAllSchema = z.object({
  query: z.object({
    limit: z.number().min(1).int().default(20),
    offset: z.number().min(0).int().default(0),
    filter: z.string().optional(),
    expand: expandSchema,
  })
});

const getOneSchema = z.object({
  params: z.object({
    id: z.coerce.number().positive(),
  }),
  query: z.object({
    expand: expandSchema,
  }),
});

const createSchema = z.object({
  query: z.object({
    expand: expandSchema,
  }),
  body: z.object({
    name: z.string(),
    roleId: z.number().positive(),
    statusId: z.number().positive(),
    email: z.string().email(),
    password: z.string(),
  }),
});

const updateSchema = z.object({
  params: z.object({
    id: z.number().positive(),
  }),
  query: z.object({
    expand: expandSchema,
  }),
  body: z.object({
    name: z.string().optional(),
    roleId: z.number().positive().optional(),
    statusId: z.number().positive().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
  })
}).refine((data) => {
  if (!data.body.name && !data.body.roleId && !data.body.statusId && !data.body.email && !data.body.password) {
    return false;
  }
  return true;
}, { message: "At least one field must be updated" });

const deleteSchema = z.object({
  params: z.object({
    id: z.number().positive(),
  }),
  query: z.object({
    expand: expandSchema,
  }),
});

export class UsersController {
  static getAll = async (req: Request, res: Response) => {
    const result = getAllSchema.safeParse({ query: req.query });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }
    const { query: { limit, offset, filter, expand } } = result.data;

    try {
      const users = await UserHandler.getAll({ limit, offset, expand });

      res.json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json({ errors: ["An error occurred"] });
    }
  };

  static create = async (req: Request, res: Response) => {
    const result = createSchema.safeParse({ body: req.body, query: req.query });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }
    const { body: { name, roleId, statusId, email, password }, query: { expand } } = result.data;
    try {
      const role = await UserRolesHandler.getOne({ id: roleId, name: "user" });
      if (!role) {
        res.status(400).json({ errors: ["Role not found"] });
        return;
      }

      const currentUser = getCurrentUser(req)!;

      if (currentUser.role.name !== "admin" && currentUser.role.name === "admin") {
        res.status(404).json({ errors: ["You are not authorized to create this user"] });
        return;
      }

      const status = await UserStatusesHandler.getOne({ id: statusId, name: "pending" });
      if (!status) {
        res.status(400).json({ errors: ["Status not found"] });
        return;
      }
      const createdUser = await UserHandler.create({
        name,
        email,
        roleId: role.id,
        statusId: status.id,
        password: await hash(password, await genSalt()),
      }, { expand });

      res.status(201).json(createdUser);
    } catch (error) {
      if (error instanceof DatabaseError) {
        res.status(error.code).json({ errors: [error.message] });
        return;
      }
      res.status(500).json({ errors: ["An error occurred"] });
    }
  };

  static getOne = async (req: Request, res: Response) => {
    const result = getOneSchema.safeParse({ params: req.params, query: req.query });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }
    const { params: { id }, query: { expand } } = result.data;
    try {
      const user = await UserHandler.getOne({ id, expand });
      res.json(user);
    } catch (error) {
      res.status(500).json({ errors: ["An error occurred"] });
    }
  };

  static update = async (req: Request, res: Response) => {
    const result = updateSchema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }
    const { body: { name, roleId, statusId, email, password }, params: { id }, query: { expand } } = result.data;
    try {
      const updatedUser = await UserHandler.update(id, {
        name,
        email,
        roleId,
        statusId,
        password: password ? await hash(password, await genSalt()) : undefined,
      }, { expand });

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ errors: ["An error occurred"] });
    }
  };

  static delete = async (req: Request, res: Response) => {
    const result = deleteSchema.safeParse({ params: req.params, query: req.query });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }
    const { params: { id }, query: { expand } } = result.data;
    try {
      const deletedUser = await UserHandler.delete(id, { expand });

      res.json(deletedUser);
    } catch (error) {
      res.status(500).json({ errors: ["An error occurred"] });
    }
  };
}