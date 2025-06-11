import { PrismaClient } from "../generated/prisma";
import { setupAuthRoutes } from "./auth/routes";
import express from "express";
import cors from "cors";

const PORT = 5000;
const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();

setupAuthRoutes(app, prisma);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
