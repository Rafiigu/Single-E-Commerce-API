import express from "express";
import { SetupRoutes } from "../types";
import { authMiddleware } from "../auth/middleware";
import {
  activateCategoryHandler,
  createCategoryHandler,
  deactivateCategoryHandler,
  getCategoryHandler,
  listCategoriesHandler,
  updateCategoryHandler,
} from "./handlers";
export const setupCategoryRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.get(
    "/:id",
    authMiddleware(["admin", "user"]),
    getCategoryHandler({ prisma })
  );
  router.get(
    "/",
    authMiddleware(["admin", "user"]),
    listCategoriesHandler({ prisma })
  );
  router.post(
    "/",
    authMiddleware(["admin"]),
    createCategoryHandler({ prisma })
  );
  router.put(
    "/:id",
    authMiddleware(["admin"]),
    updateCategoryHandler({ prisma })
  );
  router.patch(
    "/:id/activate",
    authMiddleware(["admin"]),
    activateCategoryHandler({ prisma })
  );
  router.patch(
    "/:id/deactivate",
    authMiddleware(["admin"]),
    deactivateCategoryHandler({ prisma })
  );

  app.use("/category", router);
};
