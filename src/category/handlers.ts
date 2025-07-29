import { withValidation } from "./../validation";
import { HandlerWithDeps } from "../types";
import {
  idCategoryParamsSchema,
  listCategoriesQuerySchema,
  mutateCategoryBodySchema,
} from "./validations";
import { createErrorWithMessage, createFieldError } from "../error";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const getCategoryHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idCategoryParamsSchema },
    async (req, res, next) => {
      const id = req.params.id;
      try {
        const category = await prisma.category.findFirst({
          where: { id: id },
        });

        if (!category) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Kategori tidak ditemukan."
          );
        }

        res.json({
          success: true,
          data: category,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const listCategoriesHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      querySchema: listCategoriesQuerySchema,
    },
    async (req, res, next) => {
      try {
        const { page, size, mode, status, search } =
          req.parsedQuery as unknown as z.infer<
            typeof listCategoriesQuerySchema
          >;

        const where = {
          // jika field: undefined, artinya filter atas field tersebut tidak dilakukan.
          name: search
            ? {
                contains: search,
              }
            : undefined,
          status: status !== "all" ? status : undefined,
        };

        const categories = await prisma.category.findMany({
          ...(mode === "pagination"
            ? {
                take: size,
                skip: (page - 1) * size,
              }
            : {}),
          where,
        });

        const total = await prisma.category.count({ where });

        res.json({
          success: true,
          data: {
            categories,
            total,
          },
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const createCategoryHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: mutateCategoryBodySchema },
    async (req, res, next) => {
      const data = req.body;
      try {
        const existingCategory = await prisma.category.findFirst({
          where: {
            name: data.name,
          },
        });

        if (existingCategory) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            nama: "Nama kategori tidak dapat dipakai.",
          });
        }
        const category = await prisma.category.create({
          data: {
            name: data.name,
            status: "active",
          },
        });

        res.json({
          success: true,
          data: category,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const updateCategoryHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      bodySchema: mutateCategoryBodySchema,
      paramsSchema: idCategoryParamsSchema,
    },
    async (req, res, next) => {
      const id = req.params.id;
      const data = req.body;
      try {
        const existingCategory = await prisma.category.findFirst({
          where: { id: id },
        });

        if (!existingCategory) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Kategori tidak ditemukan."
          );
        }

        const category = await prisma.category.findFirst({
          where: { name: data.name },
        });

        if (category && category.id !== id) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            nama: "Nama kategori tidak dapat dipakai.",
          });
        }

        const updatedCategory = await prisma.category.update({
          where: { id: id },
          data: {
            name: data.name,
          },
        });

        res.json({
          success: true,
          data: updatedCategory,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const activateCategoryHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idCategoryParamsSchema },
    async (req, res, next) => {
      const id = req.params.id;
      try {
        const category = await prisma.category.findFirst({
          where: { id: id },
        });

        if (!category) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Kategori tidak ditemukan."
          );
        }

        const updatedCategory = await prisma.category.update({
          where: { id: id },
          data: {
            status: "active",
          },
        });

        res.json({
          success: true,
          data: updatedCategory,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const deactivateCategoryHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idCategoryParamsSchema },
    async (req, res, next) => {
      const id = req.params.id;
      try {
        const category = await prisma.category.findFirst({
          where: { id: id },
        });

        if (!category) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Kategori tidak ditemukan."
          );
        }

        const updatedCategory = await prisma.category.update({
          where: { id: id },
          data: {
            status: "inactive",
          },
        });

        res.json({
          success: true,
          data: updatedCategory,
        });
      } catch (error) {
        next(error);
      }
    }
  );
