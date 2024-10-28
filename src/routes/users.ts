import { createUser, deleteUser, getUser, getUsers, updateUser } from "@/handlers/users";
import { Router } from "express";
import { query } from "express-validator";

const router = Router();

const handleExpandQuery = () => query("expand").optional().isBoolean();
const handleLimitQuery = () => query("limit").optional().isInt();
const handleOffsetQuery = () => query("offset").optional().isInt();

router.get("/",
  handleExpandQuery(),
  handleLimitQuery(),
  handleOffsetQuery(),
  getUsers
);

router.post("/",
  handleExpandQuery(),
  createUser
);

router.get("/:id",
  handleExpandQuery(),
  getUser
);

router.put("/:id",
  handleExpandQuery(),
  updateUser
);

router.delete("/:id",
  handleExpandQuery(),
  deleteUser
);

export default router;