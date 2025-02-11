import { UsersController } from "@/controllers/users";
import { Router } from "express";

const router = Router();

router.get("/",
  UsersController.getAll
);

router.post("/",
  UsersController.create
);

router.get("/:id",
  UsersController.getOne
);

router.put("/:id",
  UsersController.update
);

router.delete("/:id",
  UsersController.delete
);

export default router;