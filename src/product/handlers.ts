import { StatusCodes } from "http-status-codes";
import { createErrorWithMessage } from "../error";
import { withValidation } from "../validation";
import { idProductParamsSchema } from "./validations";
import { HandlerWithDeps } from "../types";

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
