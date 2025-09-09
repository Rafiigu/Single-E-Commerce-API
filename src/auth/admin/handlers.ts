import { withValidation } from "../../validation";
import { HandlerWithDeps } from "../../types";
import { createErrorWithMessage, createFieldError } from "../../error";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { Payload } from "../types";
import Jwt from "jsonwebtoken";
import { ENV } from "../../env";
import {
  loginBodySchema,
  updatePasswordBodySchema,
  updateProfileBodySchema,
} from "./validation";
import { z } from "zod";

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
        role: admin.role,
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

export const updateProfileHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      bodySchema: updateProfileBodySchema,
    },
    async (req, res, next) => {
      console.log("kena akses");
      try {
        const account = req.account;
        const data = req.body as z.infer<typeof updateProfileBodySchema>;

        const updated = await prisma.admin.update({
          where: {
            id: account.id,
          },
          data: {
            name: data.name,
          },
        });

        const { password, ...rest } = updated;

        res.json({
          success: true,
          data: rest,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const getLoggedInAdminHandler: HandlerWithDeps =
  ({ prisma }) =>
  async (req, res, next) => {
    try {
      const admin = await prisma.admin.findFirst({
        where: { id: req.account.id },
      });

      if (!admin) {
        throw createErrorWithMessage(
          StatusCodes.NOT_FOUND,
          "Akun tidak ditemukan!"
        );
      }

      if (admin?.status !== "active") {
        createErrorWithMessage(
          StatusCodes.BAD_REQUEST,
          "Akun sudah tidak aktif!"
        );
      }

      const { password, ...restAdmin } = admin;

      res.json({
        success: true,
        data: restAdmin,
      });
    } catch (error) {
      next(error);
    }
  };

export const updatePasswordHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: updatePasswordBodySchema },
    async (req, res, next) => {
      const data = req.body;
      try {
        const admin = await prisma.admin.findFirst({
          where: { id: req.account.id },
        });

        if (!admin) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Akun tidak ditemukan."
          );
        }

        if (!bcrypt.compareSync(data.currentPassword, admin.password)) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            currentPassword: "Password lama salah.",
          });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(data.newPassword, salt);

        const updatedAdmin = await prisma.admin.update({
          where: { id: admin.id },
          data: { password: hashedPassword, isPasswordChanged: true },
        });

        const { password, ...restUpdatedAdmin } = updatedAdmin;

        res.json({
          success: true,
          data: restUpdatedAdmin,
        });
      } catch (error) {
        next(error);
      }
    }
  );
