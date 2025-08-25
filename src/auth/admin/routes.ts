import express from "express";
import {
  getLoggedInAdminHandler,
  loginHandler,
  updateProfileHandler,
} from "./handlers";
import { SetupRoutes } from "../../types";
import { authMiddleware } from "../middleware";

export const setupAuthRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.post("/login", loginHandler({ prisma }));
  router.put(
    "/profile",
    authMiddleware(["admin"]),
    updateProfileHandler({ prisma })
  );
  router.get(
    "/me",
    authMiddleware(["admin"]),
    getLoggedInAdminHandler({ prisma })
  );

  app.use("/auth/admin", router);
};
