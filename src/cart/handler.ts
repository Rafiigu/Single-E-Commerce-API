import { StatusCodes } from "http-status-codes";
import { createFieldError } from "../error";
import { HandlerWithDeps } from "../types";
import { withValidation } from "../validation";
import {
  createCartBodySchema,
  idCartParamsSchema,
  listCartQuerySchema,
} from "./validations";
import { z } from "zod";

export const createCartItemHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: createCartBodySchema },
    async (req, res, next) => {
      const userId = req.account.id;
      const { productId, quantity, removeQuantity } = req.body;
      let newQuantity = quantity;
      try {
        const existingProduct = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!existingProduct) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            productId: "Produk tidak ditemukan!",
          });
        }

        const existingCartItem = await prisma.cartItem.findFirst({
          where: {
            userId: userId,
            productId: productId,
          },
        });

        let cartItem;

        if (existingCartItem) {
          if (removeQuantity && existingCartItem.quantity < removeQuantity) {
            throw createFieldError(StatusCodes.BAD_REQUEST, {
              removeQuantity:
                "Kuantitas penghapusan melebihi kuantitas item keranjang!",
            });
          }
          cartItem = await prisma.cartItem.update({
            where: { id: existingCartItem.id },
            data: {
              quantity:
                existingCartItem.quantity + (quantity || -removeQuantity!),
            },
          });
        } else {
          cartItem = await prisma.cartItem.create({
            data: {
              userId: userId,
              productId: productId,
              quantity: newQuantity,
            },
          });
        }

        res.json({
          success: true,
          data: cartItem,
        });
      } catch (error) {
        next(error);
      }
    },
  );

export const deleteCartItemsHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      paramsSchema: idCartParamsSchema,
    },
    async (req, res, next) => {
      const cartItemId = req.params.id;
      try {
        const cartItem = await prisma.cartItem.findUnique({
          where: { id: cartItemId },
        });

        if (!cartItem) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            id: "Item keranjang tidak ditemukan!",
          });
        }

        if (cartItem.userId !== req.account.id) {
          throw createFieldError(StatusCodes.FORBIDDEN, {
            id: "Anda tidak memiliki akses ke item keranjang ini!",
          });
        }

        await prisma.cartItem.delete({
          where: { id: cartItemId },
        });
        res.json({
          success: true,
          data: null,
        });
      } catch (error) {
        next(error);
      }
    },
  );

export const listCartItemsHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { querySchema: listCartQuerySchema },
    async (req, res, next) => {
      try {
        const userId = req.account.id;
        const { mode, page, size } = req.query as unknown as z.infer<
          typeof listCartQuerySchema
        >;

        const cartItems = await prisma.cartItem.findMany({
          ...(mode === "pagination"
            ? {
                take: size,
                skip: (page - 1) * size,
              }
            : {}),
          where: { userId },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                productImages: true,
              },
            },
          },
        });

        const total = await prisma.cartItem.count({ where: { userId } });

        res.json({
          success: true,
          data: cartItems,
          total,
        });
      } catch (error) {
        next(error);
      }
    },
  );
