import express from "express";
import { getLoggedInAdmin, loginHandler } from "./handlers";
import { SetupRoutes } from "../../types";
import { authMiddleware } from "../middleware";

export const setupAuthRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.post("/login", loginHandler({ prisma }));
  router.get("/me", authMiddleware(["admin"]), getLoggedInAdmin({ prisma }));

  app.use("/auth/admin", router);
};
