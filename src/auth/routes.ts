import express from "express";
import { loginHandler, registerHandler } from "./handlers";
import { SetupRoutes } from "../types";

export const setupAuthRoutes: SetupRoutes = (app, prisma) => {
  const router = express.Router();

  router.post("/login", loginHandler(prisma));
  router.post("/register", registerHandler(prisma));

  app.use("/auth", router);
};
