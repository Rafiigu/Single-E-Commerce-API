import { withValidation } from "../../validation";
import { HandlerWithDeps } from "../../types";
import { loginBodySchema, registerBodySchema } from "./validation";
import jwt from "jsonwebtoken";
import { createErrorWithMessage, createFieldError } from "../../error";
import { ENV } from "../env";
import bcrypt from "bcryptjs";
import { Payload } from "../types";
import { StatusCodes } from "http-status-codes";

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

      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          password: hashedPassword,
          email: data.email,
          profile: "",
          status: "not-verified",
          balance: 0,
        },
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

      const { password, ...restUser } = user;

      res.json({
        data: restUser,
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };
