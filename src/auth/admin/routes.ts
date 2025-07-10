import express from "express";
import { loginHandler } from "./handlers";
import { SetupRoutes } from "../../types";

export const setupAuthRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.post("/login", loginHandler({ prisma }));

  app.use("/auth/admin", router);
};
