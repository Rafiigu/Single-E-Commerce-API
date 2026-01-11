import { StatusCodes } from "http-status-codes";
import { createErrorWithMessage, createFieldError } from "../error";
import { withValidation } from "../validation";
import fs from "fs";
import {
  createProductStockMutationBodySchema,
  idProductParamsSchema,
  imageProductParamsSchema,
  imagesProductDeleteBodySchema,
  listProductsQuerySchema,
  mutateProductBodySchema,
} from "./validations";
import { HandlerWithDeps } from "../types";
import { z } from "zod";
import { getFilePath, uploadFile } from "../uploader";
import { MulterError } from "multer";
import { Handler } from "express";

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
            productImages: {
              select: {
                imageFileName: true,
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
            productImages: {
              select: {
                imageFileName: true,
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

        const errorFields: Record<string, string> = {};

        if (!category) {
          errorFields.categoryId = "Kategori tidak ada";
        }

        for (let i = 0; i < data.fileNames.length; i++) {
          if (!getFilePath(data.fileNames[i].imageFileName)) {
            errorFields[`fileNames[${i}].imageFileName`] =
              "Nama file tidak ada.";
          }
        }

        if (Object.keys(errorFields).length > 0) {
          throw createFieldError(StatusCodes.BAD_REQUEST, errorFields);
        }

        const product = await prisma.product.create({
          data: {
            name: data.name,
            status: "active",
            price: data.price,
            description: data.description,
            categoryId: data.categoryId,
            stock: 0,
            productImages: {
              create: data.fileNames.map((file: { imageFileName: string }) => ({
                imageFileName: file.imageFileName,
              })),
            },
          },
          include: {
            productImages: true,
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

        const errorFields: Record<string, string> = {};

        if (!category) {
          errorFields.categoryId = "Kategori tidak ada";
        }

        for (let i = 0; i < data.fileNames.length; i++) {
          if (!getFilePath(data.fileNames[i].imageFileName)) {
            errorFields[`fileNames[${i}].imageFileName`] =
              "Nama file tidak ada.";
          }
        }

        if (Object.keys(errorFields).length > 0) {
          throw createFieldError(StatusCodes.BAD_REQUEST, errorFields);
        }

        const updatedProduct = await prisma.product.update({
          where: { id: req.params.id },
          data: {
            name: data.name,
            price: data.price,
            description: data.description,
            categoryId: data.categoryId,
            stock: 0,
            productImages: {
              create: data.fileNames.map((file: { imageFileName: string }) => ({
                imageFileName: file.imageFileName,
              })),
            },
          },
          include: {
            productImages: true,
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

export const uploadProductImageHandler =
  (): Handler => async (req, res, next) => {
    try {
      uploadFile(req, res, async function (error) {
        console.log("Uploaded files:", req.files);
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

        const files = req.files as Express.Multer.File[];

        const imagesData = files.map((file) => ({
          imageFileName: file.filename,
          original: file.originalname,
        }));

        res.json({
          success: true,
          data: {
            files: req.files,
          },
        });
      });
    } catch (error) {
      next(error);
    }
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

export const deleteProductImageHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      bodySchema: imagesProductDeleteBodySchema,
    },
    async (req, res, next) => {
      try {
        const filenames = req.body.filenames;
        // Sama aja seperti looping biasa
        for (const filename of filenames) {
          const filePath = getFilePath(filename);

          if (filePath && fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
          }
        }

        const deleted = await prisma.productImages.deleteMany({
          where: {
            imageFileName: { in: filenames },
          },
        });

        if (deleted.count === 0) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Tidak ada record gambar produk ditemukan di database."
          );
        }

        res.json({
          success: true,
          data: {
            message:
              "Semua gambar produk berhasil dihapus dari sistem dan database.",
            deletedCount: deleted.count,
            filenames,
          },
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const listProductImagesHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idProductParamsSchema },
    async (req, res, next) => {
      try {
        const productId = req.params.id;

        const productImages = await prisma.productImages.findMany({
          where: { productId },
        });

        if (productImages.length === 0) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Tidak ada gambar untuk produk ini."
          );
        }

        res.json({
          data: productImages.map((img) => img.imageFileName),
        });
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
