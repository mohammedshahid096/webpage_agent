import { Request, Response, NextFunction } from "express";
import agentChatModel from "../schema/chatAgent.model";
import httpError from "http-errors";
import errorHandling, { AppError } from "../utils/errorHandling.util";
import responseHandlingUtil from "../utils/responseHandling.util";

export const getSessionDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sessionId } = req.params;
    const sessionData = await agentChatModel.findById(sessionId);

    if (!sessionData) {
      return next(httpError(404, "Session not found"));
    }

    responseHandlingUtil.successResponseStandard(res, {
      statusCode: 200,
      message: "session details fetched successfully",
      data: sessionData,
    });
  } catch (error) {
    errorHandling.handlingControllersError(error as AppError, next);
  }
};

export const createNewChatSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newSession = new agentChatModel({
      messages: [],
      history: [],
    });
    await newSession.save();
    responseHandlingUtil.successResponseStandard(res, {
      statusCode: 200,
      message: "session details fetched successfully",
      data: newSession,
    });
  } catch (error) {
    errorHandling.handlingControllersError(error as AppError, next);
  }
};
