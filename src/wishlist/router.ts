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

  router.get(
    "/wishlist/:productId",
    authMiddleware(["user"], true),
    createWishlistHandler({ prisma }),
  );

  router.get(
    "/unwishlist/:productId",
    authMiddleware(["user"], true),
    deleteWishlistHandler({ prisma }),
  );

  router.get(
    "/wishlist",
    authMiddleware(["user"], true),
    listWishlistsHandler({ prisma }),
  );

  router.get(
    "/wishlist/:productId/check",
    authMiddleware(["user"], true),
    getWishlistHandler({ prisma }),
  );

  app.use(router);
};
