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
        req.query = schemaOptions.querySchema.parse(req.query);
      }

      handler(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(error);
        const fieldError: Record<string, string> = {};
        error.errors.forEach((e) => {
          fieldError[e.path.join(".")] = e.message;
        });

        throw createFieldError(StatusCodes.BAD_REQUEST, fieldError);
      }

      throw createInternalError(error as Error);
    }
  };
};
