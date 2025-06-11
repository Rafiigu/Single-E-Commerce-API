import { withValidation } from "../validation";
import { HandlerWithDeps } from "../types";

export const loginHandler: HandlerWithDeps = (prisma) =>
  withValidation({}, (req, res, next) => {
    try {
    } catch (error) {
      next(error);
    }
  });

export const registerHandler: HandlerWithDeps = (prisma) =>
  withValidation({}, (req, res, next) => {
    try {
    } catch (error) {
      next(error);
    }
  });
