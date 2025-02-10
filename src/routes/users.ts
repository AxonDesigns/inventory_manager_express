import { createUserController, deleteUserController, getUserByIdController, getUsersController, updateUserController } from "@/controllers/users";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "@/handlers/users";
import { Router } from "express";
import { body, param, query } from "express-validator";

const router = Router();

const handleExpandQuery = () => query("expand").optional();
const handleLimitQuery = () => query("limit").optional().isInt().withMessage("limit must be a number");
const handleOffsetQuery = () => query("offset").optional().isInt().withMessage("offset must be a number");
const handlePostNameBody = () => body("name").notEmpty().withMessage("name is required");
const handlePostRoleIdBody = () => body("roleId").optional().isNumeric().withMessage("role must be an id");
const handlePostStatusIdBody = () => body("statusId").optional().isNumeric().withMessage("status must be an id");
const handlePostEmailBody = () => body("email").notEmpty().withMessage("email is required")
  .isEmail().withMessage("email is invalid");
const handlePostPasswordBody = () => body("password").notEmpty().withMessage("password is required")
  .isLength({ min: 8 }).withMessage("password must be at least 8 characters long");

const handlePutNameBody = () => body("name").optional().isString().withMessage("name must be a string");
const handlePutRoleIdBody = () => body("roleId").optional().isNumeric().withMessage("role must be an id");
const handlePutStatusIdBody = () => body("statusId").optional().isNumeric().withMessage("status must be an id");
const handlePutEmailBody = () => body("email").optional().isEmail().withMessage("email is invalid");
const handlePutPasswordBody = () => body("password").optional().isString().withMessage("password must be a string");

const handleIdParam = () => param("id").notEmpty().withMessage("id is required");

router.get("/",
  handleExpandQuery(),
  handleLimitQuery(),
  handleOffsetQuery(),
  getUsersController
);

router.post("/",
  handleExpandQuery(),
  handlePostNameBody().trim(),
  handlePostRoleIdBody().trim(),
  handlePostStatusIdBody().trim(),
  handlePostEmailBody().trim(),
  handlePostPasswordBody().trim(),
  createUserController
);

router.get("/:id",
  handleIdParam(),
  handleExpandQuery(),
  getUserByIdController
);

router.put("/:id",
  handleIdParam(),
  handleExpandQuery(),
  handlePutNameBody().trim(),
  handlePutRoleIdBody().trim(),
  handlePutStatusIdBody().trim(),
  handlePutEmailBody().trim(),
  handlePutPasswordBody().trim(),
  updateUserController
);

router.delete("/:id",
  handleIdParam(),
  handleExpandQuery(),
  deleteUserController
);

export default router;