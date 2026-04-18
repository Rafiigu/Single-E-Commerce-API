import { StatusCodes } from "http-status-codes";
import { createErrorWithMessage, createFieldError } from "../error";
import { HandlerWithDeps } from "../types";
import { withValidation } from "../validation";
import {
  createTopUpBodySchema,
  idTopUpParamsSchema,
  listTopUpsQuerySchema,
  transferProofBodySchema,
} from "./validations";
import { getFilePath, uploadFiles } from "../uploader";
import e, { Handler } from "express";
import { MulterError } from "multer";
import { z } from "zod";

export const listTopUpsHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { querySchema: listTopUpsQuerySchema },
    async (req, res, next) => {
      try {
        const { status, mode, page, size, dateFrom, dateTo } =
          req.parsedQuery as unknown as z.infer<typeof listTopUpsQuerySchema>;

        console.log(typeof dateFrom, typeof dateTo, dateFrom, dateTo);
        const where = {
          status: status !== "all" ? status : undefined,
          userId: req.account.role === "user" ? req.account.id : undefined,
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        };

        const listTopUps = await prisma.topUp.findMany({
          ...(mode === "pagination"
            ? {
                take: size,
                skip: (page - 1) * size,
              }
            : {}),
          where,
          omit: { paymentAccountId: true },
          orderBy: { createdAt: "desc" },
          include: {
            paymentAccount: {
              select: {
                id: true,
                accountHolderName: true,
                accountNumber: true,
                paymentTerm: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            user: {
              select: {
                name: true,
              },
            },
            admin: {
              select: {
                name: true,
              },
            },
          },
        });

        const total = await prisma.topUp.count({ where });

        res.json({
          success: true,
          data: listTopUps,
          total,
        });
      } catch (error) {
        next(error);
      }
    },
  );

export const getTopUpHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idTopUpParamsSchema },
    async (req, res, next) => {
      const id = req.params.id;
      try {
        const topUp = await prisma.topUp.findUnique({
          where: { id },
          omit: { paymentAccountId: true },
          include: {
            paymentAccount: {
              select: {
                id: true,
                accountHolderName: true,
                accountNumber: true,
                paymentTerm: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (!topUp) {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Top Up tidak ditemukan.",
          );
        }

        if (req.account.role === "user" && topUp.userId !== req.account.id) {
          throw createErrorWithMessage(
            StatusCodes.FORBIDDEN,
            "Anda tidak memiliki akses ke top up ini.",
          );
        }

        res.json({
          success: true,
          data: topUp,
        });
      } catch (error) {
        next(error);
      }
    },
  );

export const createTopUpHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: createTopUpBodySchema },
    async (req, res, next) => {
      const userId = req.account.id;
      const data = req.body;

      try {
        const existingTopUp = await prisma.topUp.findFirst({
          where: { userId, status: "requested" },
        });
        if (existingTopUp) {
          throw createErrorWithMessage(
            StatusCodes.BAD_REQUEST,
            "User sudah memiliki 1 request top up.",
          );
        }

        const existingPaymentAccount = await prisma.paymentAccount.findUnique({
          where: { id: data.paymentAccountId },
        });
        console.log(existingPaymentAccount);
        if (
          !existingPaymentAccount ||
          existingPaymentAccount.status !== "active"
        ) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            paymentAccountId: "Akun pembayaran tersebut tidak ditemukan.",
          });
        }

        const topUp = await prisma.topUp.create({
          data: {
            nominal: data.nominal,
            paymentAccountId: data.paymentAccountId,
            status: "requested",
            userId,
          },
        });

        res.json({
          success: true,
          data: topUp,
        });
      } catch (error) {
        next(error);
      }
    },
  );

export const approveTopUpHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idTopUpParamsSchema },
    async (req, res, next) => {
      const { id } = req.params;
      try {
        const existingTopUp = await prisma.topUp.findUnique({
          where: { id },
        });

        if (!existingTopUp) {
          throw createErrorWithMessage(
            StatusCodes.BAD_REQUEST,
            "Top Up dengan ID tersebut tidak ditemukan.",
          );
        }

        if (existingTopUp.status !== "transferred") {
          throw createErrorWithMessage(
            StatusCodes.BAD_REQUEST,
            "Hanya Top Up dengan status 'transferred' yang dapat disetujui.",
          );
        }

        await prisma.topUp.update({
          where: { id },
          data: {
            status: "approved",
            adminId: req.account.id,
          },
        });

        await prisma.user.update({
          where: { id: existingTopUp.userId },
          data: {
            balance: { increment: existingTopUp.nominal },
          },
        });

        res.json({
          success: true,
          data: {
            message:
              "Top Up sudah di-approved dan saldo user sudah ditambahkan.",
          },
        });
      } catch (error) {
        next(error);
      }
    },
  );

export const rejectTopUpHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { paramsSchema: idTopUpParamsSchema },
    async (req, res, next) => {
      const { id } = req.params;
      try {
        const existingTopUp = await prisma.topUp.findUnique({
          where: { id },
        });

        if (!existingTopUp) {
          throw createErrorWithMessage(
            StatusCodes.BAD_REQUEST,
            "Top Up dengan ID tersebut tidak ditemukan.",
          );
        }

        if (existingTopUp.status !== "transferred") {
          throw createErrorWithMessage(
            StatusCodes.BAD_REQUEST,
            "Hanya Top Up dengan status 'transferred' yang dapat ditolak.",
          );
        }

        await prisma.topUp.update({
          where: { id },
          data: {
            status: "rejected",
            adminId: req.account.id,
          },
        });

        res.json({
          success: true,
          data: {
            message: "Top Up sudah ditolak.",
          },
        });
      } catch (error) {
        next(error);
      }
    },
  );

export const transferTopUpProofHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: transferProofBodySchema },
    async (req, res, next) => {
      const data = req.body;
      try {
        if (!getFilePath(data.transferProofFileName)) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            transferProofFileName:
              "File bukti transfer tidak ditemukan di server.",
          });
        }

        const existingTopUp = await prisma.topUp.updateMany({
          where: {
            userId: req.account.id,
            status: "requested",
          },
          data: {
            status: "transferred",
            proofOfTransferFileName: data.transferProofFileName,
          },
        });

        if (existingTopUp.count === 0) {
          throw createErrorWithMessage(
            StatusCodes.BAD_REQUEST,
            "Tidak ada top up dengan status 'requested' untuk user ini.",
          );
        }

        const topUp = await prisma.topUp.findFirst({
          where: {
            userId: req.account.id,
            status: "transferred",
          },
        });

        res.json({
          success: true,
          data: topUp,
        });
      } catch (error) {
        next(error);
      }
    },
  );

export const uploadTransferProofImageHandler =
  (): Handler => async (req, res, next) => {
    try {
      uploadFiles(req, res, async function (error) {
        console.log("Uploaded files:", req.files);
        if (error instanceof MulterError) {
          next(
            createFieldError(StatusCodes.BAD_REQUEST, {
              file: "Gambar transfer maksimal 5MB.",
            }),
          );
          return;
        }

        if (error && error instanceof Error) {
          next(error);
          return;
        }

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

export const cancelTopUpHandler: HandlerWithDeps =
  ({ prisma }) =>
  async (req, res, next) => {
    const { id } = req.account;

    try {
      const existingTopUp = await prisma.topUp.findFirst({
        where: { userId: id },
      });

      if (!existingTopUp) {
        throw createErrorWithMessage(
          StatusCodes.BAD_REQUEST,
          "Top Up dengan ID tersebut tidak ditemukan.",
        );
      }

      if (existingTopUp.status !== "requested") {
        throw createErrorWithMessage(
          StatusCodes.BAD_REQUEST,
          "Top Up tidak dapat di-cancel",
        );
      }

      await prisma.topUp.updateMany({
        where: { userId: id },
        data: {
          status: "cancelled",
        },
      });

      const updatedTopUp = await prisma.topUp.findMany({
        where: { userId: id },
      });

      res.json({
        success: true,
        data: updatedTopUp,
      });
    } catch (error) {
      next(error);
    }
  };
