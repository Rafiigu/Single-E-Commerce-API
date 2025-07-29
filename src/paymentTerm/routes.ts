import express from "express";
import { SetupRoutes } from "../types";
import { authMiddleware } from "../auth/middleware";
import {
  activatePaymentTermHandler,
  createPaymentTermHandler,
  deactivatePaymentTermHandler,
  getPaymentTermHandler,
  listPaymentTermsHandler,
  updatePaymentTermHandler,
} from "./handlers";

export const setupPaymentTermRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.get("/:id", authMiddleware([]), getPaymentTermHandler({ prisma }));

  router.get("/", authMiddleware([]), listPaymentTermsHandler({ prisma }));

  router.post("/", authMiddleware([]), createPaymentTermHandler({ prisma }));

  router.put("/:id", authMiddleware([]), updatePaymentTermHandler({ prisma }));

  router.patch(
    "/:id/activate",
    authMiddleware([]),
    activatePaymentTermHandler({ prisma })
  );

  router.patch(
    "/:id/deactivate",
    authMiddleware([]),
    deactivatePaymentTermHandler({ prisma })
  );

  app.use("/payment-term", router);
};
