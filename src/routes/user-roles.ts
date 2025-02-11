import { UserRolesController } from "@/controllers/user-roles";
import { Router } from "express";

const router = Router();

router.get("/",
  UserRolesController.getAll
);

router.post("/",
  UserRolesController.create
);

router.get("/:id",
  UserRolesController.getOne
);

router.put("/:id",
  UserRolesController.update
);

router.delete("/:id",
  UserRolesController.delete
);

export default router;