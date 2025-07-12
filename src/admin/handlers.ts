import { Role } from "./../auth/types";
import { StatusCodes } from "http-status-codes";
import { createFieldError } from "../error";
import { HandlerWithDeps } from "../types";
import { withValidation } from "../validation";
import {
  createAdminBodySchema,
  updateAdminBodySchema,
  updateAdminParamsSchema,
} from "./validations";
import bcrypt from "bcryptjs";

export const createAdminHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: createAdminBodySchema },
    async (req, res, next) => {
      const data = req.body;
      try {
        const existingEmail = await prisma.admin.findFirst({
          where: { email: data.email },
        });

        if (existingEmail) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            email: "Email sudah ada!",
          });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(data.email, salt);

        const newAccount = await prisma.admin.create({
          data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            status: "active",
            isPasswordChanged: false,
          },
        });

        const { password, ...restNewAccount } = newAccount;

        res.json({
          success: true,
          data: restNewAccount,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const updateAdminHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      paramsSchema: updateAdminParamsSchema,
      bodySchema: updateAdminBodySchema,
    },
    async (req, res, next) => {
      const id = req.params.id;
      const data = req.body;
      try {
        const account = await prisma.admin.findFirst({
          where: { id: id },
        });

        //Mungkin ga perlu bikin const account? Langsung aja cari berdasarkan email, lalu compare id dari akun email terkait dengan id yang di input field?

        if (!account) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            account: "Akun tidak ditemukan.",
          });
        }

        const existingEmail = await prisma.admin.findFirst({
          where: { email: data.email },
        });

        if (existingEmail && existingEmail.id !== id) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            email: "Email sudah ada.",
          });
        }

        const updatedAccount = await prisma.admin.update({
          where: { id: id },
          data: {
            name: data.name,
            email: data.email,
            password: account.password,
          },
        });

        const { password, ...restUpdatedAccount } = updatedAccount;

        res.json({
          success: true,
          data: restUpdatedAccount,
        });
      } catch (error) {
        next(error);
      }
    }
  );
