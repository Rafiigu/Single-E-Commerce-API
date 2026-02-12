import { authMiddleware } from "../auth/middleware";
import { SetupRoutes } from "../types";
import express from "express";
import {
  createTopUpHandler,
  uploadTransferProofImageHandler,
  transferProofTopUpHandler,
  cancelTopUpHandler,
  listTopUpsHandler,
  getTopUpHandler,
  approveTopUpHandler,
  rejectTopUpHandler,
} from "./handler";

export const setUpTopUpRoutes: SetupRoutes = (app, { prisma }) => {
  const router = express.Router();

  router.get(
    "/",
    authMiddleware(["user", "admin"]),
    listTopUpsHandler({ prisma }),
  );

  router.get("/:id", authMiddleware(["user"]), getTopUpHandler({ prisma }));

  router.post("/", authMiddleware(["user"]), createTopUpHandler({ prisma }));

  router.patch(
    "/approve/:id",
    authMiddleware(["admin"]),
    approveTopUpHandler({ prisma }),
  );

  router.patch(
    "/reject/:id",
    authMiddleware(["admin"]),
    rejectTopUpHandler({ prisma }),
  );

  router.post(
    "/upload-transfer-proof",
    authMiddleware(["user"]),
    uploadTransferProofImageHandler(),
  );
  router.patch(
    "/transfer-proof",
    authMiddleware(["user"]),
    transferProofTopUpHandler({ prisma }),
  );
  router.patch("/", authMiddleware(["user"]), cancelTopUpHandler({ prisma }));

  app.use("/top-up", router);
};
