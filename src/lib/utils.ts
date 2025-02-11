import { SelectPublicExpandedUser } from "@/types";
import { Request } from "express"
import { verify } from "jsonwebtoken";
import { z } from "zod";

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

export const getCurrentUser = (req: Request) => {
  let token: string | null = null;
  if (req.headers.authorization) {
    const splitted = req.headers.authorization.split(" ");
    token = splitted.length > 1 ? splitted[1] : splitted[0]
  }

  if (req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return null;
  }

  try {
    return verify(token, process.env.ACCESS_TOKEN_SECRET as string) as SelectPublicExpandedUser;
  } catch (error) {
    return null;
  }
}

export const zodErrorToErrorList = <T>(error: z.ZodError<T>) => {
  if (error.errors.length === 0) {
    return [];
  }
  return error.errors.map((error) => {
    if (error.code === "invalid_type") {
      if (error.received === "undefined") {
        return `${error.path.join(".")} is required`;
      }
      return `Invalid type at "${error.path.join(".")}" expected ${error.expected}, got ${error.received}`;
    } else {
      return `${error.path.join(".")}: ${error.message}`;
    }
  });
}

export const expandSchema = z.preprocess((value) => {
  return value !== undefined;
}, z.boolean().default(false));