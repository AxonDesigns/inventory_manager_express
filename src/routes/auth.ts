import { AuthController } from "@/controllers/auth";
import { Router } from "express";

const router = Router();

router.post(
  "/login",
  AuthController.login
);

router.get(
  "/me",
  AuthController.currentUser
);

router.post(
  "/logout",
  AuthController.logout
);

export default router;