import { PaymentAccount } from "./../../generated/prisma/index.d"; //Nanti tanya tntng ini
import { StatusCodes } from "http-status-codes";
import { createErrorWithMessage, createFieldError } from "../error";
import { HandlerWithDeps } from "../types";
import { withValidation } from "../validation";
import {
  idPaymentAccountParamsSchema,
  listPaymentAccountsQuerySchema,
  mutatePaymentAccountBodySchema,
} from "./validations";
import { z } from "zod";

export const getPaymentAccountHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idPaymentAccountParamsSchema },
    async (req, res, next) => {
      const id = req.params.id;
      try {
        const paymentAccount = await prisma.paymentAccount.findFirst({
          where: { id: id },
          omit: {
            paymentTermId: true,
          },
          include: {
            paymentTerm: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (!paymentAccount) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Akun pembayaran tidak ditemukan."
          );
        }

        res.json({
          success: true,
          data: paymentAccount,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const listPaymentAccountsHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      querySchema: listPaymentAccountsQuerySchema,
    },
    async (req, res, next) => {
      try {
        const { page, size, mode, status, search, paymentTermId } =
          req.parsedQuery as unknown as z.infer<
            typeof listPaymentAccountsQuerySchema
          >;

        const where = {
          OR: search
            ? [
                {
                  accountHolderName: {
                    contains: search,
                  },
                },
                {
                  accountNumber: {
                    contains: search,
                  },
                },
              ]
            : undefined,
          paymentTermId: paymentTermId !== "all" ? paymentTermId : undefined,
          status: status !== "all" ? status : undefined,
        };

        const listPaymentAccounts = await prisma.paymentAccount.findMany({
          ...(mode === "pagination"
            ? {
                take: size,
                skip: (page - 1) * size,
              }
            : {}),
          where,
          omit: {
            paymentTermId: true,
          },
          include: {
            paymentTerm: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        const total = await prisma.paymentAccount.count({ where });

        res.json({
          success: true,
          data: {
            paymentAccounts: listPaymentAccounts,
            total,
          },
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const createPaymentAccountHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: mutatePaymentAccountBodySchema },
    async (req, res, next) => {
      const data = req.body;
      try {
        const paymentTerm = await prisma.paymentTerm.findFirst({
          where: { id: data.paymentTermId },
        });

        if (!paymentTerm) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Cara pembayaran tidak ditemukan."
          );
        }

        const existingPaymentAccount = await prisma.paymentAccount.findFirst({
          where: {
            accountNumber: data.accountNumber,
          },
        });

        if (existingPaymentAccount) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            accountNumber: "Nomor rekening tidak dapat dipakai.",
          });
        }
        const paymentAccount = await prisma.paymentAccount.create({
          data: {
            accountHolderName: data.accountHolderName,
            accountNumber: data.accountNumber,
            paymentTermId: data.paymentTermId,
            status: "active",
          },
        });

        res.json({
          success: true,
          data: paymentAccount,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const updatePaymentAccountHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      bodySchema: mutatePaymentAccountBodySchema,
      paramsSchema: idPaymentAccountParamsSchema,
    },
    async (req, res, next) => {
      const data = req.body;
      try {
        const existingPaymentAccount = await prisma.paymentAccount.findFirst({
          where: { id: req.params.id },
        });

        if (!existingPaymentAccount) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Akun pembayaran tidak ditemukan"
          );
        }

        const paymentTerm = await prisma.paymentTerm.findFirst({
          where: { id: data.paymentTermId },
        });

        if (!paymentTerm) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Cara pembayaran tidak ditemukan."
          );
        }

        const paymentAccount = await prisma.paymentAccount.findFirst({
          where: { accountNumber: data.accountNumber },
        });

        if (paymentAccount && paymentAccount.id !== req.params.id) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            accountNumber: "Nomor rekening tidak dapat dipakai",
          });
        }

        const updatedPaymentAccount = await prisma.paymentAccount.update({
          where: { id: req.params.id },
          data: {
            accountHolderName: data.accountHolderName,
            accountNumber: data.accountNumber,
            paymentTermId: data.paymentTermId,
          },
        });

        res.json({
          success: true,
          data: updatedPaymentAccount,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const activatePaymentAccountHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idPaymentAccountParamsSchema },
    async (req, res, next) => {
      const id = req.params.id;
      try {
        const existingPaymentAccount = await prisma.paymentAccount.findFirst({
          where: { id: id },
        });

        if (!existingPaymentAccount) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Akun pembayaran tidak ditemukan"
          );
        }

        const updatedPaymentAccount = await prisma.paymentAccount.update({
          where: { id: id },
          data: {
            status: "active",
          },
        });

        res.json({
          success: true,
          data: updatedPaymentAccount,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const deactivatePaymentAccountHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idPaymentAccountParamsSchema },
    async (req, res, next) => {
      const id = req.params.id;
      try {
        const existingPaymentAccount = await prisma.paymentAccount.findFirst({
          where: { id: id },
        });

        if (!existingPaymentAccount) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Akun pembayaran tidak ditemukan"
          );
        }

        const updatedPaymentAccount = await prisma.paymentAccount.update({
          where: { id: id },
          data: {
            status: "inactive",
          },
        });

        res.json({
          success: true,
          data: updatedPaymentAccount,
        });
      } catch (error) {
        next(error);
      }
    }
  );
