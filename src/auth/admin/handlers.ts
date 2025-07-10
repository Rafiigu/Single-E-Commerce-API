import { withValidation } from "../../validation";
import { HandlerWithDeps } from "../../types";
import { createErrorWithMessage, createFieldError } from "../../error";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { Payload } from "../types";
import Jwt from "jsonwebtoken";
import { ENV } from "../../env";
import { loginBodySchema } from "./validation";

export const loginHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation({ bodySchema: loginBodySchema }, async (req, res, next) => {
    const data = req.body;
    try {
      const admin = await prisma.admin.findFirst({
        where: { email: data.email },
      });

      if (!admin) {
        throw createFieldError(StatusCodes.NOT_FOUND, {
          email: "Kredensial salah.",
          password: "Kredensial salah.",
        });
      }

      if (!bcrypt.compareSync(data.password, admin.password)) {
        throw createFieldError(StatusCodes.BAD_REQUEST, {
          email: "Kredensial salah.",
          password: "Kredensial salah.",
        });
      }

      const payload = {
        id: admin.id,
        role: "admin",
        email: admin.email,
      } as Payload;

      const authToken = Jwt.sign(payload, ENV.JWT_SECRET, {
        expiresIn: 60 * 60 * 24,
      });

      const { password, ...restAdmin } = admin;

      res.json({
        success: true,
        data: { authToken: authToken, admin: restAdmin },
      });
    } catch (error) {
      next(error);
    }
  });
