import { Role } from "./../auth/types";
import { StatusCodes } from "http-status-codes";
import { createErrorWithMessage, createFieldError } from "../error";
import { HandlerWithDeps } from "../types";
import { withValidation } from "../validation";
import {
  mutateAdminBodySchema,
  idAdminParamsSchema,
  listAdminsQuerySchema,
} from "./validations";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const getAdminHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      paramsSchema: idAdminParamsSchema,
    },
    async (req, res, next) => {
      try {
        const admin = await prisma.admin.findFirst({
          where: { id: req.params.id },
          omit: {
            password: true,
          },
        });

        if (!admin) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Akun tidak ditemukan."
          );
        }

        res.json({
          success: true,
          data: admin,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const listAdminsHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      querySchema: listAdminsQuerySchema,
    },
    async (req, res, next) => {
      try {
        const { mode, page, size, status, search } =
          req.parsedQuery as unknown as z.infer<typeof listAdminsQuerySchema>;

        const where = {
          OR: search
            ? [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  email: {
                    contains: search,
                  },
                },
              ]
            : undefined,
          status: status !== "all" ? status : undefined,
        };

        const admins = await prisma.admin.findMany({
          ...(mode === "pagination"
            ? {
                take: size,
                skip: (page - 1) * size,
              }
            : {}),
          omit: {
            password: true,
          },
          where,
        });

        const total = await prisma.admin.count({ where });

        res.json({
          success: true,
          data: admins,
          total,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const createAdminHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: mutateAdminBodySchema },
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
      paramsSchema: idAdminParamsSchema,
      bodySchema: mutateAdminBodySchema,
    },
    async (req, res, next) => {
      const id = req.params.id;
      const data = req.body;
      try {
        const account = await prisma.admin.findFirst({
          where: { id: id },
        });

        if (!account) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Akun tidak ditemukan."
          );
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
            role: data.role,
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

export const activateAdminHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      paramsSchema: idAdminParamsSchema,
    },
    async (req, res, next) => {
      const id = req.params.id;
      try {
        const admin = await prisma.admin.findFirst({
          where: { id: id },
        });

        if (!admin) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Akun tidak ditemukan."
          );
        }

        const updatedAdmin = await prisma.admin.update({
          where: { id: id },
          omit: { password: true },
          data: {
            status: "active",
          },
        });

        res.json({
          success: true,
          data: updatedAdmin,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const deactivateAdminHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      paramsSchema: idAdminParamsSchema,
    },
    async (req, res, next) => {
      const id = req.params.id;
      try {
        const admin = await prisma.admin.findFirst({
          where: { id: id },
        });

        if (!admin) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Akun tidak ditemukan."
          );
        }

        const updatedAdmin = await prisma.admin.update({
          where: { id: id },
          omit: { password: true },
          data: {
            status: "inactive",
          },
        });

        res.json({
          success: true,
          data: updatedAdmin,
        });
      } catch (error) {
        next(error);
      }
    }
  );
