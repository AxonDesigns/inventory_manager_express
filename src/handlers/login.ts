import { getUserByEmail } from "@/handlers/users";
import { compare } from "bcrypt";
import "dotenv/config";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import { sign } from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }
  const { email, password, expand } = matchedData(req) as { email: string, password: string, expand?: boolean };

  const foundUser = await getUserByEmail(email, {
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
}