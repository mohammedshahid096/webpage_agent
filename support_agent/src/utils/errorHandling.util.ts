import httpErrors from "http-errors";
import { Response, NextFunction } from "express";
import { isCelebrateError } from "celebrate";
import config from "../config/index.config";

export interface AppError extends Error {
  status?: number;
}

interface ErrorResponseInterface {
  success: boolean;
  statusCode: number;
  message: string;
  errorType?: string;
  stack?: string;
  details?: Record<string, string[]>;
}

class ErrorHandlerClass {
  // for app
  handlingAppError(err: AppError, res: Response): void {
    let response: ErrorResponseInterface = {
      success: false,
      statusCode: 500,
      message: "",
    };
    if (isCelebrateError(err)) {
      // Extract Joi validation errors
      const validationError: Record<string, string[]> = {};

      for (const [key, value] of err.details.entries()) {
        validationError[key] = value.details.map((detail) => detail.message);
      }

      // Get the first error message (across all validation segments)
      const firstErrorMessage = Object.values(validationError)
        .flat() // Flatten to merge all arrays
        .shift(); // Get the first error message

      response = {
        success: false,
        statusCode: 400,
        message: firstErrorMessage || "Validation error", // Show only the first error
        details: validationError, // Still include all errors for debugging
      };
    } else {
      response = {
        success: false,
        statusCode: err?.status || 500,
        message: err?.message || "internal server error",
        ...(config.DEVELOPMENT_MODE === "development" && {
          errorType: err?.name || "not present",
          stack: err?.stack || "not present",
        }),
      };
    }

    res.status(response.statusCode).json(response);
  }

  //   for controllers
  handlingControllersError(error: AppError, next: NextFunction) {
    let httpError;
    if (error instanceof httpErrors.HttpError) {
      httpError = error;
    } else if (error.name === "ValidationError") {
      httpError = httpErrors.BadRequest(error.message);
    } else {
      httpError = httpErrors.InternalServerError(error.message);
    }

    next(httpError);
  }
}

const errorHandling = new ErrorHandlerClass();

export default errorHandling;
