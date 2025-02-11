import { login } from "@/handlers/login";
import { Router } from "express";

const router = Router();

router.post(
  "/",
  login
);

export default router;