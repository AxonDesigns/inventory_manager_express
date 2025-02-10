import { createUserStatusController, deleteUserStatusController, getUserStatusController, getUserStatusesController, updateUserStatusController } from "@/controllers/user-statuses";
import { Router } from "express";
import { body, param, query } from "express-validator";

const router = Router();

const handleLimitQuery = () => query("limit").optional().isInt().withMessage("limit must be a number");
const handleOffsetQuery = () => query("offset").optional().isInt().withMessage("offset must be a number");
const handleFilterQuery = () => query("filter").optional().isString().withMessage("offset must be a string");

const handlePostNameBody = () => body("name").notEmpty().withMessage("name is required");
const handlePostDescriptionBody = () => body("description").isString().withMessage("description must be a string");

const handlePutNameBody = () => body("name").optional().isString().withMessage("name must be a string");
const handlePutDescriptionBody = () => body("description").optional().isString().withMessage("description must be a string");

const handleIdParam = () => param("id").notEmpty().withMessage("id is required").isNumeric().withMessage("id is a number");

router.get("/",
  handleLimitQuery(),
  handleOffsetQuery(),
  handleFilterQuery().trim(),
  getUserStatusesController
);

router.post("/",
  handlePostNameBody().trim().toLowerCase(),
  handlePostDescriptionBody().trim().customSanitizer((value: string) => {
    return value[0].toUpperCase() + value.slice(1);
  }),
  createUserStatusController
);

router.get("/:id",
  handleIdParam(),
  getUserStatusController
);

router.put("/:id",
  handleIdParam(),
  handlePutNameBody().trim(),
  handlePutDescriptionBody().trim(),
  updateUserStatusController
);

router.delete("/:id",
  handleIdParam(),
  deleteUserStatusController
);

export default router;