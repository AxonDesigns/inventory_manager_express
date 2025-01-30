import { isTokenValid } from "@/lib/utils";
import { NextFunction, Request, Response } from "express";

const publicEndpoints = [
  "/auth/login"
];

const api = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!isTokenValid(req) && !publicEndpoints.includes(req.url)) {
    res.status(401).json({ errors: ["Unauthorized"] });
    return;
  }
  next();
}

export default api;