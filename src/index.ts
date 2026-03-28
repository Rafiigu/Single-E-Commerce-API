import { PrismaClient } from "../generated/prisma";
import { setupAuthRoutes as setupUserAuthRoutes } from "./auth/user/routes";
import { setupAuthRoutes as setupAdminAuthRoutes } from "./auth/admin/routes";
import express from "express";
import cors from "cors";
import { errorHandlerMiddleware } from "./error";
import { createMailClient } from "./mailer";
import { ENV } from "./env";
import { setupAdminRoutes } from "./admin/routes";
import { setupCategoryRoutes } from "./category/routes";
import { setupProductRoutes } from "./product/routes";
import { setupPaymentTermRoutes } from "./paymentTerm/routes";
import { setUpPaymentAccountRoutes } from "./paymentAccount/routes";
import { setUpWishlistRoutes } from "./wishlist/routes";
import { setupUserRoutes } from "./user/routes";
import { setUpCartRoutes } from "./cart/routes";
import { setUpTopUpRoutes } from "./topUp/routes";

const PORT = ENV.PORT;
const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();
const mailer = createMailClient();

const router = express.Router();

setupUserAuthRoutes(router, { prisma, mailer });
setupAdminAuthRoutes(router, { prisma });
setupAdminRoutes(router, { prisma });
setupCategoryRoutes(router, { prisma });
setupProductRoutes(router, { prisma });
setupPaymentTermRoutes(router, { prisma });
setUpPaymentAccountRoutes(router, { prisma });
setUpWishlistRoutes(router, { prisma });
setupUserRoutes(router, { prisma });
setUpCartRoutes(router, { prisma });
setUpTopUpRoutes(router, { prisma });

app.use("/api", router);

app.use(errorHandlerMiddleware as any);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
