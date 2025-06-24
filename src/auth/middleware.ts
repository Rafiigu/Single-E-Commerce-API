import { Handler } from "express";
import { createErrorWithMessage } from "../error";
import { StatusCodes } from "http-status-codes";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { Payload, Role } from "./types";
import { ENV } from "./env";

export const authMiddleware = (roles: Role[]): Handler => {
  return (req, res, next) => {
    try {
      const authorization = req.headers["authorization"];
      // Bearer AUTH_TOKEN

      if (!authorization) {
        throw createErrorWithMessage(StatusCodes.UNAUTHORIZED, "Unauthorized");
      }

      const bearerToken = authorization.split(" ");

      if (bearerToken.length !== 2) {
        throw createErrorWithMessage(StatusCodes.UNAUTHORIZED, "Unauthorized");
      }

      if (bearerToken[0] !== "Bearer") {
        throw createErrorWithMessage(StatusCodes.UNAUTHORIZED, "Unauthorized");
      }

      const authToken = bearerToken[1];
      const payload = jwt.verify(authToken, ENV.JWT_SECRET || "") as Payload; // if verify fails, it will throws error with JSONWebTokenError
      /*
        payload = {
          id: 
          role: 
          email: 
        }
      */
      if (!roles.includes(payload.role)) {
        throw createErrorWithMessage(StatusCodes.UNAUTHORIZED, "Unauthorized");
      }

      req.user = payload;
      next();
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        next(
          createErrorWithMessage(
            StatusCodes.UNAUTHORIZED,
            "Unauthorized",
            error
          )
        );
      }

      next(error);
    }
  };
};
