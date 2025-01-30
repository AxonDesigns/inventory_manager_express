import { isTokenValid } from "@/lib/utils";
import { NextFunction, Request, Response } from "express";

type PublicEndpoint = {
  path: string;
  methods: string[];
};

// Configuration - define your public endpoints here
const PUBLIC_ENDPOINTS: PublicEndpoint[] = [
  { path: '/auth/login', methods: ['POST'] },
  { path: '/public', methods: ['GET'] }
];

// Pre-process endpoints once at startup
const normalizedEndpoints = PUBLIC_ENDPOINTS.map(endpoint => ({
  path: normalizePath(endpoint.path),
  methods: endpoint.methods.map(m => m.toUpperCase())
}));

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '')
    .split('?')[0]
    .toLowerCase()
    || '/';
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const currentPath = normalizePath(req.baseUrl + req.path);
  const currentMethod = req.method.toUpperCase();

  const isPublic = normalizedEndpoints.some(({ path, methods }) =>
    path === currentPath &&
    (methods.includes('*') || methods.includes(currentMethod))
  );

  if (!isTokenValid(req) && !isPublic) {
    res.status(401).json({ errors: ["Unauthorized"] });
    return;
  }
  next();
}

export default authMiddleware;