import express from "express";
import { SetupRoutes } from "../types";
import { authMiddleware } from "../auth/middleware";
import {
  activateProductHandler,
  createProductHandler,
  createProductStockMutationHandler,
  deactivateProductHandler,
  getProductHandler,
  getProductImageHandler,
  listProductsHandler,
  updateProductHandler,
  uploadProductImageHandler,
} from "./handlers";
import { uploadFile } from "../uploader";

export const setupProductRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.get("/:id", getProductHandler({ prisma }));

  router.get("/", listProductsHandler({ prisma }));

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

  router.post(
    "/upload",
    authMiddleware(["admin"]),
    uploadProductImageHandler()
  );

  router.get(
    "/file/:filename",
    authMiddleware(["admin", "user"]),
    getProductImageHandler()
  );

  router.post(
    "/:id/stock-mutation",
    authMiddleware(["admin"]),
    createProductStockMutationHandler({ prisma })
  );

  app.use("/product", router);
};
