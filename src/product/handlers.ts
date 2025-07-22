import { StatusCodes } from "http-status-codes";
import { createErrorWithMessage, createFieldError } from "../error";
import { withValidation } from "../validation";
import {
  idProductParamsSchema,
  imageProductParamsSchema,
  listProductsQuerySchema,
  mutateProductBodySchema,
} from "./validations";
import { HandlerWithDeps } from "../types";
import { z } from "zod";
import { getFilePath, uploadFile } from "../uploader";
import { MulterError } from "multer";
import { Handler } from "express";
import fs from "fs";

export const getProductHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idProductParamsSchema },
    async (req, res, next) => {
      const id = req.params.id;
      try {
        const product = await prisma.product.findFirst({
          where: { id: id },
          omit: {
            categoryId: true,
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (!product) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Produk tidak ditemukan."
          );
        }

        res.json({
          success: true,
          data: product,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const listProductsHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { querySchema: listProductsQuerySchema },
    async (req, res, next) => {
      try {
        // Infert the parsedQuery type based on the querySchema.
        const query = req.parsedQuery as z.infer<
          typeof listProductsQuerySchema
        >;
        console.log(query.categoryId);
        const listProducts = await prisma.product.findMany({
          where: { categoryId: query.categoryId },
          omit: {
            categoryId: true,
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        res.json({
          success: true,
          data: listProducts,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const createProductHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: mutateProductBodySchema },
    async (req, res, next) => {
      const data = req.body;
      try {
        const category = await prisma.category.findFirst({
          where: { id: data.categoryId },
        });

        if (!category) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            category: "Kategori tidak ada.",
          });
        }

        const product = await prisma.product.create({
          data: {
            name: data.name,
            status: "active",
            price: data.price,
            description: data.description,
            categoryId: data.categoryId,
            stock: 0,
          },
        });

        res.json({
          success: true,
          data: product,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const updateProductHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      bodySchema: mutateProductBodySchema,
      paramsSchema: idProductParamsSchema,
    },
    async (req, res, next) => {
      const data = req.body;
      try {
        const product = await prisma.product.findFirst({
          where: { id: req.params.id },
        });

        if (!product) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Produk tidak ada."
          );
        }

        const category = await prisma.category.findFirst({
          where: { id: data.categoryId },
        });

        if (!category) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            category: "Kategori tidak ada.",
          });
        }

        const updatedProduct = await prisma.product.update({
          where: { id: req.params.id },
          data: {
            name: data.name,
            price: data.price,
            description: data.description,
            categoryId: data.categoryId,
            stock: 0,
          },
        });

        res.json({
          success: true,
          data: updatedProduct,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const activateProductHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idProductParamsSchema },
    async (req, res, next) => {
      try {
        const product = await prisma.product.findFirst({
          where: { id: req.params.id },
        });

        if (!product) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Produk tidak ditemukan."
          );
        }

        const updateProduct = await prisma.product.update({
          where: { id: req.params.id },
          data: {
            status: "active",
          },
        });

        res.json({
          success: true,
          data: updateProduct,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const deactivateProductHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idProductParamsSchema },
    async (req, res, next) => {
      try {
        const product = await prisma.product.findFirst({
          where: { id: req.params.id },
        });

        if (!product) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Produk tidak ditemukan."
          );
        }

        const updateProduct = await prisma.product.update({
          where: { id: req.params.id },
          data: {
            status: "inactive",
          },
        });

        res.json({
          success: true,
          data: updateProduct,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const uploadProductImageHandler = (): Handler => {
  return (req, res, next) => {
    uploadFile(req, res, function (error) {
      if (error instanceof MulterError) {
        next(
          createFieldError(StatusCodes.BAD_REQUEST, {
            file: "Gambar produk maksimal 5MB.",
          })
        );
        return;
      }

      if (error && error instanceof Error) {
        next(error);
        return;
      }

      res.json({
        data: {
          file: req.file,
        },
      });
    });
  };
};

export const getProductImageHandler = (): Handler =>
  withValidation(
    {
      paramsSchema: imageProductParamsSchema,
    },
    (req, res, next) => {
      try {
        const filename = req.params.filename;
        const filePath = getFilePath(filename);

        if (!filePath) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Gambar produk tidak ditemukan."
          );
        }

        res.sendFile(filePath);
      } catch (error) {
        next(error);
      }
    }
  );

export const createProductStockMutationHandler: HandlerWithDeps = ({
  prisma,
}) =>
  withValidation(
    {
      paramsSchema: idProductParamsSchema,
      // bodySchema:
    },
    (req, res, next) => {}
  );
