import { UserHandler } from "@/handlers/users";
import { expandSchema, zodErrorToErrorList } from "@/lib/utils";
import { compare } from "bcrypt";
import "dotenv/config";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
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

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse({ body: req.body, query: req.query });
  if (!result.success) {
    res.status(400).json({ errors: zodErrorToErrorList(result.error) });
    return;
  }
  const { body: { email, password }, query: { expand } } = result.data;

  try {
    const foundUser = await UserHandler.getOne({
      email,
      expand: expand !== undefined,
      asPrivate: true,
    });

    if (!foundUser) {
      res.status(400).json({ errors: ["User not found"] });
      return;
    }

    if (!(await compare(password, foundUser.password))) {
      res.status(400).json({ errors: ["Invalid password"] });
      return;
    }

    const { password: hashedPassword, verificationToken, ...rest } = foundUser;

    const accessToken = sign(rest, process.env.ACCESS_TOKEN_SECRET as string, {
      expiresIn: "1h",
    });

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.json(rest);
  } catch (error) {
    res.status(500).json({ errors: ["An error occurred"] });
  }
}