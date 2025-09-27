import { authMiddleware } from "../auth/middleware";
import { SetupRoutes } from "../types";
import express from "express";
import { blockUserHandler, listUsersHandler, unblockUserHandler } from "./handlers";

export const setupUserRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.get("/", authMiddleware(["admin", "staff"]), listUsersHandler({ prisma }));
    router.patch(
      "/:id/block",
      authMiddleware(["admin"]),
      blockUserHandler({ prisma })
    );
    router.patch(
      "/:id/unblock",
      authMiddleware(["admin"]),
      unblockUserHandler({ prisma })
    );

  app.use("/user", router);
};