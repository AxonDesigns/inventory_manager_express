import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";



export const getUsers = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }
  const { limit, offset, expand } = matchedData(req) as { limit?: number, offset?: number, expand?: boolean };

  res.send("Hello from users!");
};

export const createUser = async (req: Request, res: Response) => {
  res.send("Hello from users!");
};

export const getUser = async (req: Request, res: Response) => {
  res.send(`Hello from users! ${req.params.id}`);
};

export const updateUser = async (req: Request, res: Response) => {
  res.send(`Hello from users! ${req.params.id}`);
};

export const deleteUser = async (req: Request, res: Response) => {
  res.send(`Hello from users! ${req.params.id}`);
};