import { Router } from "express";
import { SetupRoutes } from "../types";
import express from "express";
import { authMiddleware } from "../auth/middleware";
import { createAdminHandler, updateAdminHandler } from "./handlers";

export const setupAdminRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.post("/", authMiddleware([]), createAdminHandler({ prisma }));
  router.put("/:id", authMiddleware([]), updateAdminHandler({ prisma }));

  app.use("/admin", router);
};
