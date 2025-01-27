import { createUser, deleteUser, getUserById, getUsers, updateUser } from "@/handlers/users";
import { Router } from "express";
import { body, param, query } from "express-validator";

const router = Router();

const handleExpandQuery = () => query("expand").optional();
const handleLimitQuery = () => query("limit").optional().isInt().withMessage("limit must be a number");
const handleOffsetQuery = () => query("offset").optional().isInt().withMessage("offset must be a number");
const handlePostNameBody = () => body("name").notEmpty().withMessage("name is required");
const handlePostRoleBody = () => body("role").optional().isString().withMessage("role must be a string");
const handlePostEmailBody = () => body("email").notEmpty().withMessage("email is required")
  .isEmail().withMessage("email is invalid");
const handlePostPasswordBody = () => body("password").notEmpty().withMessage("password is required")
  .isLength({ min: 8 }).withMessage("password must be at least 8 characters long");

const handlePutNameBody = () => body("name").optional().isString().withMessage("name must be a string");
const handlePutRoleBody = () => body("role").optional().isString().withMessage("role must be a string");
const handlePutEmailBody = () => body("email").optional().isEmail().withMessage("email is invalid");
const handlePutPasswordBody = () => body("password").optional().isString().withMessage("password must be a string");

const handleIdParam = () => param("id").notEmpty().withMessage("id is required");

router.get("/",
  handleExpandQuery(),
  handleLimitQuery(),
  handleOffsetQuery(),
  getUsers
);

router.post("/",
  handleExpandQuery(),
  handlePostNameBody().trim(),
  handlePostRoleBody().trim(),
  handlePostEmailBody().trim(),
  handlePostPasswordBody().trim(),
  createUser
);

router.get("/:id",
  handleIdParam(),
  handleExpandQuery(),
  getUserById
);

router.put("/:id",
  handleIdParam(),
  handleExpandQuery(),
  handlePutNameBody().trim(),
  handlePutRoleBody().trim(),
  handlePutEmailBody().trim(),
  handlePutPasswordBody().trim(),
  updateUser
);

router.delete("/:id",
  handleIdParam(),
  handleExpandQuery(),
  deleteUser
);

export default router;