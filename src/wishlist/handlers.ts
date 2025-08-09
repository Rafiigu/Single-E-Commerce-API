import { StatusCodes } from "http-status-codes";
import { createErrorWithMessage } from "../error";
import { HandlerWithDeps } from "../types";
import { withValidation } from "../validation";
import { idProductParamsSchema, listWishlistsQuerySchema } from "./validations";
import { z } from "zod";

export const createWishlistHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: idProductParamsSchema },
    async (req, res, next) => {
      try {
        const existingProduct = await prisma.product.findFirst({
          where: { id: req.body.productId },
        });

        if (!existingProduct) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Produk tidak ditemukan."
          );
        }

        const existingWishlist = await prisma.wishlist.findFirst({
          where: { productId: req.body.productId, userId: req.account.id },
        });

        if (existingWishlist) {
          throw createErrorWithMessage(
            StatusCodes.BAD_REQUEST,
            "Produk sudah di-wishlist"
          );
        }

        const wishlist = await prisma.wishlist.create({
          data: {
            userId: req.account.id,
            productId: req.body.productId,
          },
        });

        res.json({
          success: true,
          data: wishlist,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const deleteWishlistHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: idProductParamsSchema },
    async (req, res, next) => {
      try {
        const existingProduct = await prisma.product.findFirst({
          where: { id: req.body.productId },
        });

        if (!existingProduct) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Produk tidak ditemukan."
          );
        }

        const existingWishlist = await prisma.wishlist.findFirst({
          where: { userId: req.account.id, productId: req.body.productId },
        });

        if (!existingWishlist) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "wishlist tidak ditemukan."
          );
        }

        await prisma.wishlist.delete({
          where: { id: existingWishlist.id },
        });
        res.json({
          success: true,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const listWishlistsHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { querySchema: listWishlistsQuerySchema },
    async (req, res, next) => {
      try {
        const { mode, page, size } = req.parsedQuery as unknown as z.infer<
          typeof listWishlistsQuerySchema
        >;

        const listWishlists = await prisma.wishlist.findMany({
          where: { userId: req.account.id },
          select: {
            productId: true,
          },
        });

        console.log(listWishlists);

        const productIds = listWishlists.map(function (product) {
          return product.productId;
        });

        console.log(productIds);

        const listWishlistedProducts = await prisma.product.findMany({
          where: {
            id: {
              in: productIds,
            },
          },
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
          data: listWishlistedProducts,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const getWishlistHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idProductParamsSchema },
    async (req, res, next) => {
      try {
        const existingProduct = await prisma.product.findFirst({
          where: { id: req.params.productId },
        });

        if (!existingProduct) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Produk tidak ditemukan."
          );
        }

        const userWishlist = await prisma.wishlist.findFirst({
          where: { productId: req.params.productId, userId: req.account.id },
        });
        let data = true;
        if (!userWishlist) {
          data = false;
        }

        res.json({
          success: true,
          data,
        });
      } catch (error) {
        next(error);
      }
    }
  );
