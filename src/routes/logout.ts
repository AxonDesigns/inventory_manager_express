import { logout } from "@/handlers/logout";
import { Router } from "express";

const router = Router();

router.post(
  "/",
  logout
);

export default router;