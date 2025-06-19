import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

type ErrorToJSON = {
  success: boolean;
  error:
    | {
        message: string;
      }
    | {
        fields: Record<string, string>;
      }
    | null;
};

class CustomError extends Error {
  status: StatusCodes;

  constructor(status: StatusCodes) {
    super("");
    this.status = status;
  }

  toJSON(): ErrorToJSON {
    return {
      success: false,
      error: null,
    };
  }
}

class ErrorWithMessage extends CustomError {
  message: string;
  native?: Error;

  constructor(status: StatusCodes, message: string, nativeError?: Error) {
    super(status);
    this.message = message;
    this.native = nativeError; // optional
  }

  toJSON(): ErrorToJSON {
    return {
      success: false,
      error: {
        message: this.message,
      },
    };
  }
}

class FieldError extends CustomError {
  fields: Record<string, string>;

  constructor(status: StatusCodes, fields: Record<string, string>) {
    super(status);
    this.fields = fields;
  }

  toJSON() {
    return {
      success: false,
      error: {
        fields: this.fields,
      },
    };
  }
}

export const createErrorWithMessage = (
  status: StatusCodes,
  message: string,
  nativeError?: Error
) => {
  return new ErrorWithMessage(status, message, nativeError);
};

export const createFieldError = (
  status: StatusCodes,
  fields: Record<string, string>
) => {
  return new FieldError(status, fields);
};

export const createInternalError = (nativeError: Error) => {
  return createErrorWithMessage(
    StatusCodes.INTERNAL_SERVER_ERROR,
    "Something wrong happen.",
    nativeError
  );
};

export const errorHandlerMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(error);

  if (error instanceof CustomError) {
    return res.status(error.status).json(error.toJSON());
  }

  const defaultError = createInternalError(error);
  return res.status(defaultError.status).json(defaultError.toJSON());
};

/*

Error with Message

{
  success: false,
  error: {
    message: "ERROR MESSAGE"
  }
}

Field Error

{
  success: false,
  error: {
    fields: {
      key: value,
      key: value,
      key: value
    }
  }
}

*/
