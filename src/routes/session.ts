import { getSession } from "@/handlers/session";
import { Router } from "express";

const router = Router();

router.get(
  "/",
  getSession
);

export default router;