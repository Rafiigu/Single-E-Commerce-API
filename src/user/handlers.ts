// get list of users
// pagination, search by name or email, filter by status (please referenced to listUsersQuerySchema)

import { z } from "zod";
import { HandlerWithDeps } from "../types";
import { withValidation } from "../validation";
import { idUserParamsSchema, listUsersQuerySchema } from "./validations";
import { StatusCodes } from "http-status-codes";
import { createErrorWithMessage } from "../error";

// block user: set user status to blocked

// unblock user: set user status to verified

export const listUsersHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { querySchema: listUsersQuerySchema },
    async (req, res, next) => {
      try {
        const { mode, page, size, status, search } =
          req.parsedQuery as unknown as z.infer<typeof listUsersQuerySchema>;
        console.log(req.parsedQuery);

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

        const users = await prisma.user.findMany({
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

        const total = await prisma.user.count({ where });

        res.json({
          success: true,
          data: users,
          total,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  export const blockUserHandler: HandlerWithDeps = ({ prisma }) =>
    withValidation(
      {
        paramsSchema: idUserParamsSchema,
      },
      async (req, res, next) => {
        const id = req.params.id;
        try {
          const user = await prisma.user.findFirst({
            where: { id: id },
          });
  
          if (!user) {
            throw createErrorWithMessage(
              StatusCodes.NOT_FOUND,
              "Akun tidak ditemukan."
            );
          }
  
          const updatedUser = await prisma.user.update({
            where: { id: id },
            omit: { password: true },
            data: {
              status: "blocked",
            },
          });
  
          res.json({
            success: true,
            data: updatedUser,
          });
        } catch (error) {
          next(error);
        }
      }
    );

      export const unblockUserHandler: HandlerWithDeps = ({ prisma }) =>
    withValidation(
      {
        paramsSchema: idUserParamsSchema,
      },
      async (req, res, next) => {
        const id = req.params.id;
        try {
          const user = await prisma.user.findFirst({
            where: { id: id },
          });
  
          if (!user) {
            throw createErrorWithMessage(
              StatusCodes.NOT_FOUND,
              "Akun tidak ditemukan."
            );
          }
  
          const updatedUser = await prisma.user.update({
            where: { id: id },
            omit: { password: true },
            data: {
              status: "verified",
            },
          });
  
          res.json({
            success: true,
            data: updatedUser,
          });
        } catch (error) {
          next(error);
        }
      }
    );