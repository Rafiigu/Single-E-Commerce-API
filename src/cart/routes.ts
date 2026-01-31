import { SetupRoutes } from "../types";
import express from "express";
import {
  createCartItemHandler,
  deleteCartItemsHandler,
  listCartItemsHandler,
} from "./handler";
import { authMiddleware } from "../auth/middleware";

export const setUpCartRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.post("/", authMiddleware(["user"]), createCartItemHandler({ prisma }));
  router.delete(
    "/:id",
    authMiddleware(["user"]),
    deleteCartItemsHandler({ prisma }),
  );
  router.get("/", authMiddleware(["user"]), listCartItemsHandler({ prisma }));

  app.use("/cart", router);
};
