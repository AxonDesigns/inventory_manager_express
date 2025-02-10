import { getUserRole } from "@/handlers/user-roles";
import { getUserStatus } from "@/handlers/user-statuses";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "@/handlers/users";
import { InsertUserRole, InsertUserStatus, SelectUserRole } from "@/types";
import { genSalt, hash } from "bcrypt";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

export const getUsersController = async (req: Request, res: Response) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      res.status(400).json({ errors: results.array().map((err) => err.msg) });
      return;
    }
    const { limit, offset, expand } = matchedData(req) as { limit?: number, offset?: number, expand?: boolean };
    const users = await getUsers({ limit, offset, expand: expand !== undefined || expand == true });

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: ["An error occurred"] });
  }
};

export const createUserController = async (req: Request, res: Response) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      res.status(400).json({ errors: results.array().map((err) => err.msg) });
      return;
    }
    const { name, roleId, statusId, email, password, expand } = matchedData(req) as {
      name: string,
      roleId?: InsertUserRole["id"],
      statusId?: InsertUserStatus["id"],
      email: string,
      password: string,
      expand?: boolean
    };

    const createdUser = await createUser({
      name,
      email,
      roleId: roleId ?? (await getUserRole({ name: "user" }))!.id,
      statusId: statusId ?? (await getUserStatus({ name: "pending" }))!.id,
      password: await hash(password, await genSalt()),
    }, { expand: expand !== undefined || expand == true });

    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ errors: ["An error occurred"] });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      res.status(400).json({ errors: results.array().map((err) => err.msg) });
      return;
    }
    const { id, expand } = matchedData(req) as { id: SelectUserRole["id"], expand?: boolean };

    const user = await getUserById(id, { expand: expand !== undefined || expand == true });

    res.json(user);
  } catch (error) {
    res.status(500).json({ errors: ["An error occurred"] });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      res.status(400).json({ errors: results.array().map((err) => err.msg) });
      return;
    }

    const { id, name, roleId, statusId, email, password, expand } = matchedData(req) as {
      id: SelectUserRole["id"],
      name?: string,
      roleId?: SelectUserRole["id"],
      statusId?: SelectUserRole["id"],
      email?: string,
      password?: string,
      expand?: boolean
    };

    const updatedUser = await updateUser(id, {
      name,
      email,
      roleId,
      statusId,
      password: password ? await hash(password, await genSalt()) : undefined,
    }, { expand: expand !== undefined || expand == true });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ errors: ["An error occurred"] });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      res.status(400).json({ errors: results.array().map((err) => err.msg) });
      return;
    }

    const { id, expand } = matchedData(req) as { id: SelectUserRole["id"], expand?: boolean };
    const deletedUser = await deleteUser(id, { expand: expand !== undefined || expand == true });

    res.json(deletedUser);
  } catch (error) {
    res.status(500).json({ errors: ["An error occurred"] });
  }
};