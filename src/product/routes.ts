import express from "express";
import { SetupRoutes } from "../types";
import { authMiddleware } from "../auth/middleware";
import {
  activateProductHandler,
  createProductHandler,
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

  // .post("/:id/stock-mutation")

  app.use("/product", router);
};
