import express from "express";
import { SetupRoutes } from "../types";
import { authMiddleware } from "../auth/middleware";
import {
  activateProductHandler,
  createProductHandler,
  deactivateProductHandler,
  getProductHandler,
  listProductsHandler,
  updateProductHandler,
} from "./handlers";

export const setupProductRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.get(
    "/:id",
    authMiddleware(["admin", "staff"]),
    getProductHandler({ prisma })
  );

  router.get(
    "/",
    authMiddleware(["admin", "staff"]),
    listProductsHandler({ prisma })
  );

  router.post("/", authMiddleware(["admin"]), createProductHandler({ prisma }));

  router.put(
    "/:id",
    authMiddleware(["admin"]),
    updateProductHandler({ prisma })
  );

  router.patch(
    "/:id/activate",
    authMiddleware(["admin"]),
    activateProductHandler({ prisma })
  );

  router.patch(
    "/:id/deactivate",
    authMiddleware(["admin"]),
    deactivateProductHandler({ prisma })
  );

  app.use("/product", router);
};
