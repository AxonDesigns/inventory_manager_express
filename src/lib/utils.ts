import { Request } from "express"
import { verify } from "jsonwebtoken";

export const isTokenValid = (req: Request) => {
  let token: string | null = null;
  if (req.headers.authorization) {
    const splitted = req.headers.authorization.split(" ");
    token = splitted.length > 1 ? splitted[1] : splitted[0]
  }

  if (req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return false;
  }

  try {
    verify(token, process.env.ACCESS_TOKEN_SECRET as string);
  } catch (error) {
    return false;
  }

  return true;
}