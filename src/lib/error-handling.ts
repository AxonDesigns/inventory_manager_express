import { DatabaseError, ValidationError } from "@/lib/errors";
import { Request, Response } from "express";

export const errorHandler = (req: Request, res: Response, error: unknown) => {
  if (error instanceof ValidationError) {
    res.status(400).json({ errors: error.errors });
    return;
  }
  if (error instanceof DatabaseError) {
    res.status(error.code).json({ errors: [error.message] });
    return;
  }
  res.status(500).json({ errors: ["An error occurred"] });
}