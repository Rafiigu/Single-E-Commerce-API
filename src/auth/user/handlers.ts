import { MailClient } from "./../../mailer";
import { withValidation } from "../../validation";
import { HandlerWithDeps } from "../../types";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
  updatePasswordBodySchema,
  verifyBodySchema,
} from "./validation";
import jwt from "jsonwebtoken";
import { createErrorWithMessage, createFieldError } from "../../error";
import bcrypt from "bcryptjs";
import { Payload } from "../types";
import { StatusCodes } from "http-status-codes";
import { nanoid } from "nanoid";
import { ENV } from "../../env";
import { STATUS_CODES } from "http";

export const loginHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation({ bodySchema: loginBodySchema }, async (req, res, next) => {
    try {
      const data = req.body;

      const user = await prisma.user.findFirst({
        where: { email: data.email },
      });

      if (!user) {
        throw createFieldError(StatusCodes.NOT_FOUND, {
          email: "Kredensial salah.",
          password: "Kredensial salah.",
        });
      }

      if (!bcrypt.compareSync(data.password, user.password)) {
        throw createFieldError(StatusCodes.BAD_REQUEST, {
          email: "Kredensial salah.",
          password: "Kredensial salah.",
        });
      }

      if (user.status === "not-verified") {
        throw createFieldError(StatusCodes.BAD_REQUEST, {
          email: "Email belum terverifikasi.",
        });
      }

      if (user.status === "blocked") {
        throw createFieldError(StatusCodes.BAD_REQUEST, {
          email: "Akun terblokir.",
        });
      }

      const payload = {
        id: user.id,
        role: "user",
        email: user.email,
      } as Payload;

      const authToken = jwt.sign(payload, ENV.JWT_SECRET, {
        expiresIn: 60 * 60 * 24,
      });

      const { password, ...restUser } = user;

      res.json({
        success: true,
        data: { authToken: authToken, user: restUser },
      });
    } catch (error) {
      next(error);
    }
  });

export const registerHandler: HandlerWithDeps = ({ prisma, mailer }) =>
  withValidation({ bodySchema: registerBodySchema }, async (req, res, next) => {
    try {
      const data = req.body;

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(data.password, salt);

      const existingEmail = await prisma.user.findFirst({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw createFieldError(StatusCodes.BAD_REQUEST, {
          email: "Email sudah ada!",
        });
      }

      const newUser = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: data.name,
            password: hashedPassword,
            email: data.email,
            profile: "",
            status: "not-verified",
            balance: 0,
          },
        });

        const token = nanoid();

        const existingToken = await tx.userVerificationToken.findFirst({
          where: { userId: newUser.id, purpose: "sign-up" },
        });

        const now = new Date();
        const expiredAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        if (!existingToken) {
          await tx.userVerificationToken.create({
            data: {
              token: token,
              purpose: "sign-up",
              userId: newUser.id,
              createdAt: now,
              updatedAt: now,
              expiredAt,
            },
          });
        } else {
          await tx.userVerificationToken.update({
            where: {
              id: existingToken.id,
            },
            data: {
              token: token,
              updatedAt: now,
              expiredAt,
            },
          });
        }

        await mailer?.send(data.email, {
          subject: "Account Verification",
          html: `<h2>Registration Token Value ${token}</h2>`,
        });

        return newUser;
      });

      const { password, ...restNewUser } = newUser;

      res.status(200).json({
        data: restNewUser,
        success: true,
      });
    } catch (error) {
      next(error);
    }
  });

export const verifyHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation({ bodySchema: verifyBodySchema }, async (req, res, next) => {
    try {
      const data = req.body;

      const user = await prisma.user.findFirst({
        where: { email: data.email },
      });

      if (!user) {
        throw createFieldError(StatusCodes.NOT_FOUND, {
          email: "Email tidak ditemukan",
        });
      }

      if (user.status === "blocked") {
        throw createFieldError(StatusCodes.BAD_REQUEST, {
          status: "Akun terblokir",
        });
      }

      if (user.status === "verified") {
        throw createFieldError(StatusCodes.BAD_REQUEST, {
          status: "Akun telah terverifikasi",
        });
      }

      const userToken = await prisma.userVerificationToken.findFirst({
        where: { userId: user.id, purpose: "sign-up" },
      });

      if (!userToken) {
        throw createFieldError(StatusCodes.NOT_FOUND, {
          token: "Data token tidak ditemukan",
        });
      }

      if (userToken.token !== data.token) {
        throw createFieldError(StatusCodes.NOT_FOUND, {
          token: "Token tidak ditemukan",
        });
      }

      if (userToken.expiredAt && Date.now() > userToken.expiredAt.getTime()) {
        throw createFieldError(StatusCodes.BAD_REQUEST, {
          token: "Token kadaluarsa",
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { status: "verified" },
      });

      const { password, ...restUpdatedUser } = updatedUser;

      res.json({
        success: true,
        data: restUpdatedUser,
      });
    } catch (error) {
      next(error);
    }
  });

export const getLoggedInUser: HandlerWithDeps =
  ({ prisma }) =>
  async (req, res, next) => {
    try {
      // req.user
      const user = await prisma.user.findFirst({
        where: { id: req.user.id },
      });

      if (!user) {
        throw createErrorWithMessage(
          StatusCodes.NOT_FOUND,
          "User tidak ditemukan!"
        );
      }

      if (user.status !== "verified") {
        throw createErrorWithMessage(
          StatusCodes.NOT_FOUND,
          "User belum terverifikasi atau terblokir!"
        );
      }

      const { password, ...restUser } = user;

      res.json({
        data: restUser,
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };

export const forgotPasswordHandler: HandlerWithDeps = ({ prisma, mailer }) =>
  withValidation(
    { bodySchema: forgotPasswordBodySchema },
    async (req, res, next) => {
      const { email } = req.body;
      try {
        let token;

        await prisma.$transaction(async (tx) => {
          const user = await tx.user.findFirst({
            where: { email: email },
          });

          if (!user) {
            throw createFieldError(StatusCodes.NOT_FOUND, {
              email: "Email tidak ditemukan",
            });
          }

          if (user.status !== "verified") {
            throw createErrorWithMessage(
              StatusCodes.BAD_REQUEST,
              "Akun harus terverifikasi"
            );
          }

          token = nanoid();

          const existingToken = await tx.userVerificationToken.findFirst({
            where: { userId: user.id, purpose: "reset-password" },
          });

          const now = new Date();
          const expiredAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

          if (!existingToken) {
            await tx.userVerificationToken.create({
              data: {
                token,
                purpose: "reset-password",
                userId: user.id,
                createdAt: now,
                updatedAt: now,
                expiredAt,
              },
            });
          } else {
            await tx.userVerificationToken.update({
              where: {
                id: existingToken.id,
              },
              data: {
                token,
                updatedAt: now,
                expiredAt,
              },
            });
          }

          await mailer?.send(email, {
            subject: "Forgot Password",
            html: `<h2>Forgot Password Token Value: ${token}</h2>`,
          });
        });

        res.json({
          success: true,
          data: {
            token,
          },
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const resetPasswordHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: resetPasswordBodySchema },
    async (req, res, next) => {
      const data = req.body;
      try {
        const user = await prisma.user.findFirst({
          where: { email: data.email },
        });

        if (!user) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            email: "Email tidak ditemukan",
          });
        }

        if (user.status !== "verified") {
          throw createErrorWithMessage(
            StatusCodes.NOT_FOUND,
            "Akun harus terverifikasi"
          );
        }

        const userToken = await prisma.userVerificationToken.findFirst({
          where: { userId: user.id, purpose: "reset-password" },
        });

        if (!userToken) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            token: "Data token tidak ditemukan",
          });
        }

        if (userToken.token !== data.token) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            token: "Token tidak ditemukan",
          });
        }

        if (userToken.expiredAt && Date.now() > userToken.expiredAt.getTime()) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            token: "Token kadaluarsa",
          });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(data.newPassword, salt);

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });

        const { password, ...restUpdatedUser } = updatedUser;

        res.json({
          success: true,
          data: restUpdatedUser,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export const updatePasswordHandler: HandlerWithDeps = ({ prisma }) =>
  withValidation(
    { bodySchema: updatePasswordBodySchema },
    async (req, res, next) => {
      const data = req.body;
      try {
        const user = await prisma.user.findFirst({
          where: { email: data.email },
        });

        if (!user) {
          throw createFieldError(StatusCodes.NOT_FOUND, {
            email: "Kredensial salah.",
            password: "Kredensial salah.",
          });
        }

        if (!bcrypt.compareSync(data.currentPassword, user.password)) {
          throw createFieldError(StatusCodes.BAD_REQUEST, {
            email: "Kredensial salah.",
            password: "Kredensial salah.",
          });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(data.newPassword, salt);

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });

        const { password, ...restUpdatedUser } = updatedUser;

        res.json({
          success: true,
          data: restUpdatedUser,
        });
      } catch (error) {
        next(error);
      }
    }
  );
