import { db } from "@/db/database";
import { rolesTable } from "@/db/schema/roles";
import { usersTable } from "@/db/schema/users";
import { genSalt, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import { verify } from "jsonwebtoken";

export const getSession = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }

  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    res.status(401).json({ errors: ["Unauthorized"] });
    return;
  }

  const payload = verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);

  console.log(payload);

  res.json(payload);
}