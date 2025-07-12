import { Router } from "express";
import { SetupRoutes } from "../types";
import express from "express";
import { authMiddleware } from "../auth/middleware";
import { createHandler, updateHandler } from "./handlers";

export const setupAdminRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.post("/", authMiddleware([]), createHandler({ prisma }));
  router.put("/:id", authMiddleware([]), updateHandler({ prisma }));

  app.use("/admin", router);
};
