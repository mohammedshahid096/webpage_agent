import { Response } from "express";

interface SuccessResponseOptions<T = any> {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: T | null;
  otherData?: Record<string, any>;
}

class ResponseHandler {
  successResponseStandard<T = any>(
    res: Response,
    options: SuccessResponseOptions<T>,
  ): void {
    const {
      success = true,
      statusCode = 200,
      message = "",
      data = null,
      otherData = {},
    } = options;

    let responseObject: Record<string, any> = {
      success,
      statusCode,
      message,
      data,
    };

    const otherDataKeysLength = Object.keys(otherData).length || 0;

    if (otherDataKeysLength > 0) {
      responseObject = { ...responseObject, ...otherData };
    }

    res.status(statusCode).json(responseObject);
  }
}

// Export as instance (following your pattern)
export default new ResponseHandler();
