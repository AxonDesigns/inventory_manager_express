import { AuthHandler } from "@/handlers/auth";
import { errorHandler } from "@/lib/error-handling";
import { DatabaseError } from "@/lib/errors";
import { expandSchema, getCurrentUser, zodErrorToErrorList } from "@/lib/utils";
import { Request, Response } from "express";
import { z } from "zod";

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
  query: z.object({
    expand: expandSchema,
  }),
});

export class AuthController {
  static login = async (req: Request, res: Response) => {
    const result = loginSchema.safeParse({ body: req.body, query: req.query });
    if (!result.success) {
      res.status(400).json({ errors: zodErrorToErrorList(result.error) });
      return;
    }
    const { body: { email, password }, query: { expand } } = result.data;

    try {
      const { accessToken, user } = await AuthHandler.login(email, password, expand);

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      res.json(user);
    } catch (error) {
      errorHandler(req, res, error);
    }
  }

  static logout = async (_: Request, res: Response) => {
    res.clearCookie("access_token");
    res.json({ message: "Logged out successfully" });
  }

  static currentUser = async (req: Request, res: Response) => {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      res.status(401).json({ errors: ["Unauthorized"] });
      return;
    }

    try {
      const user = getCurrentUser(accessToken);
      if (!user) {
        throw new DatabaseError("User not found", 404);
      }
      res.json(user);
    } catch (error) {
      res.clearCookie("access_token");
      res.status(500).json({ errors: ["Token is invalid"] });
    }
  }
}