import { UserStatesController } from "@/controllers/user-statuses";
import { Router } from "express";

const router = Router();

router.get("/",
  UserStatesController.getAll
);

router.post("/",
  UserStatesController.create
);

router.get("/:id",
  UserStatesController.getOne
);

router.put("/:id",
  UserStatesController.update
);

router.delete("/:id",
  UserStatesController.delete
);

export default router;