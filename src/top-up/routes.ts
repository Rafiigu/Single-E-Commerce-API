import { authMiddleware } from "../auth/middleware";
import { SetupRoutes } from "../types";
import express from "express";
import {
  createTopUpHandler,
  uploadTransferProofImageHandler,
  transferTopUpProofHandler,
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
  router.get(
    "/:id",
    authMiddleware(["user", "admin"]),
    getTopUpHandler({ prisma }),
  );
  router.post("/", authMiddleware(["user"]), createTopUpHandler({ prisma }));
  router.patch(
    "/:id/approve",
    authMiddleware(["admin"]),
    approveTopUpHandler({ prisma }),
  );
  router.patch(
    "/:id/reject",
    authMiddleware(["admin"]),
    rejectTopUpHandler({ prisma }),
  );
  router.post(
    "/:id/upload-transfer-proof/image",
    authMiddleware(["user"]),
    uploadTransferProofImageHandler(),
  );
  router.post(
    "/:id/upload-transfer-proof",
    authMiddleware(["user"]),
    transferTopUpProofHandler({ prisma }),
  );
  router.patch(
    "/:id/cancel",
    authMiddleware(["user"]),
    cancelTopUpHandler({ prisma }),
  );

  app.use("/top-up", router);
};
