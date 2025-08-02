import express from "express";
import { SetupRoutes } from "../types";
import { authMiddleware } from "../auth/middleware";
import {
  activatePaymentAccountHandler,
  createPaymentAccountHandler,
  deactivatePaymentAccountHandler,
  getPaymentAccountHandler,
  listPaymentAccountsHandler,
  updatePaymentAccountHandler,
} from "./handlers";

export const setUpPaymentAccountRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.get("/:id", authMiddleware([]), getPaymentAccountHandler({ prisma }));

  router.get("/", authMiddleware([]), listPaymentAccountsHandler({ prisma }));

  router.post("/", authMiddleware([]), createPaymentAccountHandler({ prisma }));

  router.put(
    "/:id",
    authMiddleware([]),
    updatePaymentAccountHandler({ prisma })
  );

  router.patch(
    "/:id/activate",
    authMiddleware([]),
    activatePaymentAccountHandler({ prisma })
  );

  router.patch(
    "/:id/deactivate",
    authMiddleware([]),
    deactivatePaymentAccountHandler({ prisma })
  );

  app.use("/payment-account", router);
};
