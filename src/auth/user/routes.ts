import express from "express";
import {
  getLoggedInUserHandler,
  loginHandler,
  registerHandler,
  verifyHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  updatePasswordHandler,
} from "./handlers";
import { SetupRoutes } from "../../types";
import { authMiddleware } from "../middleware";

export const setupAuthRoutes: SetupRoutes = (app, { prisma, mailer }) => {
  const router = express.Router();

  router.post("/login", loginHandler({ prisma }));
  router.post("/register", registerHandler({ prisma, mailer }));
  router.post("/verify-account", verifyHandler({ prisma }));
  router.get(
    "/me",
    authMiddleware(["user"]),
    getLoggedInUserHandler({ prisma })
  );
  router.post("/forgot-password", forgotPasswordHandler({ prisma, mailer }));
  router.post("/reset-password", resetPasswordHandler({ prisma }));
  router.post(
    "/update-password",
    authMiddleware(["user"]),
    updatePasswordHandler({ prisma })
  );

  app.use("/auth/user", router);
};
