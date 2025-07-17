import { ZodError, ZodSchema } from "zod";
import { createFieldError, createInternalError } from "./error.js";
import { StatusCodes } from "http-status-codes";
import { Handler } from "express";

type SchemaOptions = {
  bodySchema?: ZodSchema;
  querySchema?: ZodSchema;
  paramsSchema?: ZodSchema;
};

export const withValidation = (
  schemaOptions: SchemaOptions,
  handler: Handler
): Handler => {
  return (req, res, next) => {
    try {
      if (schemaOptions.bodySchema) {
        req.body = schemaOptions.bodySchema.parse(req.body);
      }
      if (schemaOptions.paramsSchema) {
        req.params = schemaOptions.paramsSchema.parse(req.params);
      }
      if (schemaOptions.querySchema) {
        console.log(req.query.categoryId);
        req.query = schemaOptions.querySchema.parse(req.query);
      }

      handler(req, res, next);
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        const fieldError: Record<string, string> = {};
        error.errors.forEach((e) => {
          fieldError[e.path.join(".")] = e.message;
        });

        next(createFieldError(StatusCodes.BAD_REQUEST, fieldError));
      }

      next(createInternalError(error as Error));
    }
  };
};
