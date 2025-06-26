import { PrismaClient } from "../generated/prisma";
import { setupAuthRoutes as setupUserAuthRoutes } from "./auth/user/routes";
import { setupAuthRoutes as setupAdminAuthRoutes } from "./auth/admin/routes";
import express from "express";
import cors from "cors";
import { errorHandlerMiddleware } from "./error";
import { createMailClient } from "./mailer";

const PORT = 5000;
const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();
const mailer = createMailClient();

const router = express.Router();

setupUserAuthRoutes(router, { prisma, mailer });
setupAdminAuthRoutes(router, { prisma });

app.use("/api", router);

app.use(errorHandlerMiddleware as any);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
