import { NextFunction, Request, Response } from "express";

const responseMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const originalJson = res.json.bind(res);
  const statusCode = res.statusCode;
  res.json = ((body?: any) => {
    return originalJson({
      statusCode,
      data: statusCode >= 400 ? null : body,
      errors: body?.errors ?? [],
    });
  }) as typeof res.json;
  next();
}

export default responseMiddleware;