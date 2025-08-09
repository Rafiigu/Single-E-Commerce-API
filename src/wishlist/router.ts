import { Router } from "express";
import express from "express";
import { SetupRoutes } from "./../types";
import { authMiddleware } from "../auth/middleware";
import {
  createWishlistHandler,
  deleteWishlistHandler,
  getWishlistHandler,
  listWishlistsHandler,
} from "./handlers";
export const setUpWishlistRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.post(
    "/wishlist",
    authMiddleware(["user"]),
    createWishlistHandler({ prisma })
  );

  router.post(
    "/unwishlist",
    authMiddleware(["user"]),
    deleteWishlistHandler({ prisma })
  );

  router.get(
    "/wishlist",
    authMiddleware(["user"]),
    listWishlistsHandler({ prisma })
  );

  router.get(
    "/wishlist/:productId/check",
    authMiddleware(["user"]),
    getWishlistHandler({ prisma })
  );

  app.use(router);
};
