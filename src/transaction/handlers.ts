import { z } from "zod";
import { HandlerWithDeps } from "../types";
import { withValidation } from "../validation";
import {
  cancelTransactionBodySchema,
  createTransactionBodySchema,
  deliverTransactionBodySchema,
  idTransactionParamsSchema,
  listTransactionsQuerySchema,
} from "./validations";
import { createErrorWithMessage, createFieldError } from "../error";
import { StatusCodes } from "http-status-codes";

export const listTransactionsHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { querySchema: listTransactionsQuerySchema },
    async (req, res, next) => {
      try {
        const { status, mode, page, size, startDate, endDate } =
          req.parsedQuery as unknown as z.infer<
            typeof listTransactionsQuerySchema
          >;

        const where = {
          status: status !== "all" ? status : undefined,
          userId: req.account.role === "user" ? req.account.id : undefined,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        };

        const transactions = await prisma.transaction.findMany({
          ...(mode === "pagination"
            ? {
                take: size,
                skip: (page - 1) * size,
              }
            : {}),
          where,
          orderBy: { createdAt: "desc" },
        });

        const total = await prisma.transaction.count({ where });

        res.json({
          success: true,
          data: transactions,
          total,
        });
      } catch (error) {
        next(error);
      }
    },
  );

export const createTransactionHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: createTransactionBodySchema },
    async (req, res, next) => {
      const userId = req.account.id;
      const { total } = req.body;
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!existingUser) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            userId: "User tidak ditemukan!",
          });
        }

        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            userId: userId,
            status: "pending",
          },
        });
        if (existingTransaction) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            transaction: "Transaksi pending sudah ada!",
          });
        }

        const transaction = await prisma.transaction.create({
          data: {
            userId: userId,
            total: total,
            status: "pending",
          },
        });

        res.json({
          success: true,
          data: transaction,
        });
      } catch (error) {
        next(error);
      }
    },
  );

export const TransactionStatusProcessHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      paramsSchema: idTransactionParamsSchema,
    },
    async (req, res, next) => {
      try {
        const existingTransaction = await prisma.transaction.findFirst({
          where: { id: req.params.id, status: "pending" },
        });

        if (!existingTransaction) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Transaksi yang sedang pending tidak ditemukan.",
          );
        }

        const updatedTransactionStatus = await prisma.transaction.update({
          where: { id: req.params.id },
          data: {
            status: "in process",
          },
        });
        res.json({
          success: true,
          data: updatedTransactionStatus,
        });
      } catch (error) {
        next(error);
      }
    },
  );

export const TransactionStatusCancelHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      paramsSchema: idTransactionParamsSchema,
      bodySchema: cancelTransactionBodySchema,
    },
    async (req, res, next) => {
      try {
        const existingTransaction = await prisma.transaction.findFirst({
          where: { id: req.params.id, status: "pending" },
        });

        if (!existingTransaction) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Transaksi yang sedang pending tidak ditemukan.",
          );
        }

        const updatedTransactionStatus = await prisma.transaction.update({
          where: { id: req.params.id },
          data: {
            status: "cancelled",
            cancellationReason: req.body.reason,
          },
        });
        res.json({
          success: true,
          data: updatedTransactionStatus,
        });
      } catch (error) {
        next(error);
      }
    },
  );

export const TransactionStatusDeliverHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    {
      paramsSchema: idTransactionParamsSchema,
      bodySchema: deliverTransactionBodySchema,
    },
    async (req, res, next) => {
      try {
        const existingTransaction = await prisma.transaction.findFirst({
          where: { id: req.params.id, status: "in process" },
        });

        if (!existingTransaction) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Transaksi yang sedang diproses tidak ditemukan.",
          );
        }

        const updatedTransactionStatus = await prisma.transaction.update({
          where: { id: req.params.id },
          data: {
            status: "delivered",
            logisticVendorId: req.body.logisticVendorId,
          },
        });
        res.json({
          success: true,
          data: updatedTransactionStatus,
        });
      } catch (error) {
        next(error);
      }
    },
  );
