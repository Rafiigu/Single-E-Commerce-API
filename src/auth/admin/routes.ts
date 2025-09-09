import express from "express";
import {
  getLoggedInAdminHandler,
  loginHandler,
  updatePasswordHandler,
  updateProfileHandler,
} from "./handlers";
import { SetupRoutes } from "../../types";
import { authMiddleware } from "../middleware";

export const setupAuthRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.post("/login", loginHandler({ prisma }));
  router.patch(
    "/profile",
    authMiddleware(["admin", "staff"]),
    updateProfileHandler({ prisma })
  );
  router.get(
    "/me",
    authMiddleware(["admin", "staff"]),
    getLoggedInAdminHandler({ prisma })
  );
  router.patch(
    "/update-password",
    authMiddleware(["admin", "staff"]),
    updatePasswordHandler({ prisma })
  );

  app.use("/auth/admin", router);
};
