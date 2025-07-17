import { StatusCodes } from "http-status-codes";
import { createErrorWithMessage, createFieldError } from "../error";
import { withValidation } from "../validation";
import {
  idProductParamsSchema,
  listProductsQuerySchema,
  mutateProductBodySchema,
} from "./validations";
import { HandlerWithDeps } from "../types";
import { z } from "zod";

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
        // const listProducts = await prisma.product.findMany({
        //   where: { categoryId:  req.parsedQuery.categoryId},
        // });
        // res.json({
        //  success: true,
        //  data: listProducts
        //})
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

        const existingProduct = await prisma.product.findFirst({
          where: { name: data.name },
        });

        if (existingProduct && existingProduct.id !== req.params.id) {
          throw createErrorWithMessage(
            StatusCodes.BAD_REQUEST,
            "Nama produk tidak dapat dipakai."
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
