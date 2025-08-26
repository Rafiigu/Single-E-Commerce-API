import { StatusCodes } from "http-status-codes";
import { createErrorWithMessage, createFieldError } from "../error";
import { withValidation } from "../validation";
import {
  createProductStockMutationBodySchema,
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
        const { search, status, categoryId, mode, page, size } =
          req.parsedQuery as unknown as z.infer<typeof listProductsQuerySchema>;

        const where = {
          name: search
            ? {
                contains: search,
              }
            : undefined,
          status: status !== "all" ? status : undefined,
          categoryId: categoryId !== "all" ? categoryId : undefined,
        };

        const listProducts = await prisma.product.findMany({
          ...(mode === "pagination"
            ? {
                take: size,
                skip: (page - 1) * size,
              }
            : {}),
          where,
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

        const total = await prisma.product.count({ where });

        res.json({
          success: true,
          data: listProducts,
          total,
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

        if (!getFilePath(data.fileName)) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            fileName: "File tidak valid.",
          });
        }

        const product = await prisma.product.create({
          data: {
            name: data.name,
            status: "active",
            price: data.price,
            description: data.description,
            imageFileName: data.fileName,
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

        if (!getFilePath(data.fileName)) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            fileName: "File tidak valid.",
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
            imageFileName: data.fileName,
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
      bodySchema: createProductStockMutationBodySchema,
    },
    async (req, res, next) => {
      const productId = req.params.id;
      const data = req.body;

      try {
        const product = await prisma.product.findFirst({
          where: { id: productId },
        });

        if (!product) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Produk tidak ditemukan."
          );
        }

        if (data.type === "out" && product.stock < data.quantity) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            quantity:
              "Jumlah stok saat ini lebih kecil dibandingkan stok yang mau dikeluarkan.",
          });
        }

        const stockMutation = await prisma.stockMutation.create({
          data: {
            productId: productId,
            currentStock: product.stock,
            quantity: data.quantity,
            type: data.type,
            notes: data.notes,
          },
        });

        let stock = product.stock;
        if (data.type === "in") {
          stock += data.quantity;
        } else if (data.type === "out") {
          stock -= data.quantity;
        }

        await prisma.product.update({
          where: { id: productId },
          data: {
            stock: stock,
          },
        });

        res.json({
          success: true,
          data: stockMutation,
        });
      } catch (error) {
        next(error);
      }
    }
  );
