import { Router } from "express";
import { SetupRoutes } from "../types";
import express from "express";
import { authMiddleware } from "../auth/middleware";
import {
  activateAdminHandler,
  createAdminHandler,
  deactivateAdminHandler,
  getAdminHandler,
  listAdminsHandler,
  updateAdminHandler,
} from "./handlers";

export const setupAdminRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.post("/", authMiddleware([]), createAdminHandler({ prisma }));
  router.put("/:id", authMiddleware([]), updateAdminHandler({ prisma }));
  router.get("/", authMiddleware(["admin"]), listAdminsHandler({ prisma }));
  router.get("/:id", authMiddleware(["admin"]), getAdminHandler({ prisma }));
  router.patch(
    "/:id/activate",
    authMiddleware(["admin"]),
    activateAdminHandler({ prisma })
  );
  router.patch(
    "/:id/deactivate",
    authMiddleware(["admin"]),
    deactivateAdminHandler({ prisma })
  );

  app.use("/admin", router);
};
