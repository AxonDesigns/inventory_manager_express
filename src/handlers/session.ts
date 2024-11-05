import { Request, Response } from "express";
import { verify } from "jsonwebtoken";

export const getSession = async (req: Request, res: Response) => {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    res.status(401).json({ errors: ["Unauthorized"] });
    return;
  }

  const payload = verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
  res.json(payload);
}