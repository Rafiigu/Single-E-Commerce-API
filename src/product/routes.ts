import express from "express";
import { SetupRoutes } from "../types";
import { authMiddleware } from "../auth/middleware";
import {
  activateProductHandler,
  createProductHandler,
  createProductStockMutationHandler,
  deactivateProductHandler,
  deleteProductImagesHandler,
  getProductHandler,
  getProductImageHandler,
  listProductImagesHandler,
  listProductsHandler,
  updateProductHandler,
  uploadProductImagesHandler,
} from "./handlers";

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
    uploadProductImagesHandler()
  );

  router.get("/file/:filename", getProductImageHandler());

  router.get("/file/images/:id", listProductImagesHandler({ prisma }));

  router.post(
    "/:id/stock-mutation",
    authMiddleware(["admin"]),
    createProductStockMutationHandler({ prisma })
  );

  router.post("/file/delete", deleteProductImagesHandler({ prisma }));

  app.use("/product", router);
};
