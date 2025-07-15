import express from "express";
import { SetupRoutes } from "../types";
import { authMiddleware } from "../auth/middleware";
import { getProductHandler } from "./handlers";

export const setupProductRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.get(
    "/:id",
    authMiddleware(["admin", "staff"]),
    getProductHandler({ prisma })
  );

  app.use("/product", router);
};
