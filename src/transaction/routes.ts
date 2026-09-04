import { SetupRoutes } from "../types";
import express from "express";
import {
  createTransactionHandler,
  listTransactionsHandler,
  TransactionStatusCancelHandler,
  TransactionStatusDeliverHandler,
  TransactionStatusProcessHandler,
} from "./handlers";
import { authMiddleware } from "../auth/middleware";

export const setUpTransactionRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.get(
    "/",
    authMiddleware(["user", "admin"]),
    listTransactionsHandler({ prisma }),
  );

  router.post(
    "/",
    authMiddleware(["user"]),
    createTransactionHandler({ prisma }),
  );

  router.patch(
    "/:id/cancel",
    authMiddleware(["admin"]),
    TransactionStatusCancelHandler({ prisma }),
  );

  router.patch(
    "/:id/process",
    authMiddleware(["admin"]),
    TransactionStatusProcessHandler({ prisma }),
  );

  router.patch(
    "/:id/deliver",
    authMiddleware(["admin"]),
    TransactionStatusDeliverHandler({ prisma }),
  );

  app.use("/transaction", router);
};
