import { createUserRole, deleteUserRole, getUserRoleById, getUserRoles, updateUserRole } from "@/handlers/user-roles";
import { Router } from "express";
import { body, param, query } from "express-validator";

const router = Router();

const handleLimitQuery = () => query("limit").optional().isInt().withMessage("limit must be a number");
const handleOffsetQuery = () => query("offset").optional().isInt().withMessage("offset must be a number");

const handlePostNameBody = () => body("name").notEmpty().withMessage("name is required");
const handlePostDescriptionBody = () => body("description").isString().withMessage("description must be a string");

const handlePutNameBody = () => body("name").optional().isString().withMessage("name must be a string");
const handlePutDescriptionBody = () => body("description").optional().isString().withMessage("description must be a string");

const handleIdParam = () => param("id").notEmpty().withMessage("id is required");

router.get("/",
    handleLimitQuery(),
    handleOffsetQuery(),
    getUserRoles
);

router.post("/",
    handlePostNameBody().trim().toLowerCase(),
    handlePostDescriptionBody().trim().customSanitizer((value: string) => {
        return value[0].toUpperCase() + value.slice(1);
    }),
    createUserRole
);

router.get("/:id",
    handleIdParam(),
    getUserRoleById
);

router.put("/:id",
    handleIdParam(),
    handlePutNameBody().trim(),
    handlePutDescriptionBody().trim(),
    updateUserRole
);

router.delete("/:id",
    handleIdParam(),
    deleteUserRole
);

export default router;