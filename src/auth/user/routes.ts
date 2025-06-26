import express from "express";
import { getLoggedInUser, loginHandler, registerHandler } from "./handlers";
import { SetupRoutes } from "../../types";
import { authMiddleware } from "../middleware";

export const setupAuthRoutes: SetupRoutes = (app, { prisma, mailer }) => {
  const router = express.Router();

  router.post("/login", loginHandler({ prisma }));
  router.post("/register", registerHandler({ prisma, mailer }));
  router.get("/me", authMiddleware(["user"]), getLoggedInUser({ prisma }));

  app.use("/auth/user", router);
};
