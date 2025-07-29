import { StatusCodes } from "http-status-codes";
import { createErrorWithMessage, createFieldError } from "../error";
import { HandlerWithDeps } from "../types";
import { withValidation } from "../validation";
import {
  idPaymentTermParamsSchema,
  mutatePaymentTermBodySchema,
} from "./validations";

export const getPaymentTermHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idPaymentTermParamsSchema },
    async (req, res, next) => {
      const id = req.params.id;
      try {
        const paymentTerm = await prisma.paymentTerm.findFirst({
          where: { id: id },
        });

        if (!paymentTerm) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Cara pembayaran tidak ditemukan."
          );
        }

        res.json({
          success: true,
          data: paymentTerm,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const listPaymentTermsHandler: HandlerWithDeps =
  ({ prisma }) =>
  async (req, res, next) => {
    try {
      const paymentTerms = await prisma.paymentTerm.findMany();

      res.json({
        success: true,
        data: paymentTerms,
      });
    } catch (error) {
      next(error);
    }
  };

export const createPaymentTermHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: mutatePaymentTermBodySchema },
    async (req, res, next) => {
      const data = req.body;
      try {
        const existingPaymentTerm = await prisma.paymentTerm.findFirst({
          where: { id: data.name },
        });

        if (existingPaymentTerm) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            name: "Nama cara pembayaran tidak dapat dipakai.",
          });
        }

        const paymentTerm = await prisma.paymentTerm.create({
          data: {
            name: data.name,
            status: "active",
          },
        });

        res.json({
          success: true,
          data: paymentTerm,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const updatePaymentTermHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      bodySchema: mutatePaymentTermBodySchema,
      paramsSchema: idPaymentTermParamsSchema,
    },
    async (req, res, next) => {
      const id = req.params.id;
      const data = req.body;
      try {
        const existingPaymentTerm = await prisma.paymentTerm.findFirst({
          where: { id: id },
        });

        if (!existingPaymentTerm) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Cara pembayaran tidak ditemukan."
          );
        }

        const paymentTerm = await prisma.paymentTerm.findFirst({
          where: { name: data.name },
        });

        if (paymentTerm && paymentTerm.id !== id) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            name: "Nama cara pembayaran tidak dapat dipakai.",
          });
        }

        const updatedPaymentTerm = await prisma.paymentTerm.update({
          where: { id: id },
          data: {
            name: data.name,
          },
        });

        res.json({
          success: true,
          data: updatedPaymentTerm,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const activatePaymentTermHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idPaymentTermParamsSchema },
    async (req, res, next) => {
      try {
        const paymentTerm = await prisma.paymentTerm.findFirst({
          where: { id: req.params.id },
        });

        if (!paymentTerm) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Cara pembayaran tidak ditemukan."
          );
        }

        const updatedPaymentTerm = await prisma.paymentTerm.update({
          where: { id: req.params.id },
          data: {
            status: "active",
          },
        });

        res.json({
          success: true,
          data: updatedPaymentTerm,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const deactivatePaymentTermHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idPaymentTermParamsSchema },
    async (req, res, next) => {
      try {
        const paymentTerm = await prisma.paymentTerm.findFirst({
          where: { id: req.params.id },
        });

        if (!paymentTerm) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Cara pembayaran tidak ditemukan."
          );
        }

        const updatedPaymentTerm = await prisma.paymentTerm.update({
          where: { id: req.params.id },
          data: {
            status: "inactive",
          },
        });

        res.json({
          success: true,
          data: updatedPaymentTerm,
        });
      } catch (error) {
        next(error);
      }
    }
  );
