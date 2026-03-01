import { Request, Response, NextFunction } from "express";
import agentChatModel, { IMessage } from "../schema/chatAgent.model";
import httpError from "http-errors";
import errorHandling, { AppError } from "../utils/errorHandling.util";
import responseHandlingUtil from "../utils/responseHandling.util";
import CheerioService from "../services/cheerio.service";
import ChromaService from "../services/chroma.service";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { embeddings_model_names } from "../constants/gemini.constant";
import AgentService from "../services/agent.service";

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

export const loadWebsiteController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cheerioService = new CheerioService({
      url: "http://aethelflow.com",
    });

    const docs = await cheerioService.scrapeWebsite2();
    const splitDocs = await cheerioService.generateChunks(docs);

    const filterDocs = splitDocs.slice(0, 4);

    const WEB_COLLECTION_NAME = "web_scrapping";

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: embeddings_model_names["gemini-embedding-001"], // 768 dimensions
      apiVersion: "v1",
    } as any);

    const chromaService = new ChromaService({
      collectionName: WEB_COLLECTION_NAME,
      embeddings,
    });

    await chromaService.insertBatchSafe(filterDocs);
    responseHandlingUtil.successResponseStandard(res, {
      data: filterDocs,
    });
  } catch (error) {
    errorHandling.handlingControllersError(error as AppError, next);
  }
};

export const agentChatController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sessionId } = req.params;
    const { inputMessage } = req.body;

    const chatDetails = await agentChatModel.findById(sessionId).lean();

    if (!chatDetails) {
      return next(httpError.NotFound("Session Details not found"));
    }

    const userTimestamp = new Date();

    const agentService = new AgentService({
      sessionId: chatDetails._id.toString(),
    });

    const aiResponse = await agentService.processRequest(
      inputMessage,
      chatDetails,
    );
    const tokenUsage = aiResponse.messages?.[1]?.response_metadata
      ?.tokenUsage as any;

    const newMessageData: IMessage[] = [
      {
        content: inputMessage || "",
        role: "human",
        timestamp: userTimestamp,
      },
      {
        content: aiResponse.output || "",
        role: "ai",
        timestamp: new Date(),
        tokenUsage: {
          input_tokens: tokenUsage?.promptTokens || 0,
          output_tokens: tokenUsage?.completionTokens || 0,
          total_tokens: tokenUsage?.totalTokens || 0,
        },
      },
    ];

    const updatedDetails = await agentChatModel.findByIdAndUpdate(
      sessionId,
      { $push: { messages: newMessageData } },
      { new: true },
    );

    responseHandlingUtil.successResponseStandard(res, {
      data: updatedDetails,
      otherData: { aiResponse, aiMessage: aiResponse.output },
    });
  } catch (error) {
    errorHandling.handlingControllersError(error as AppError, next);
  }
};
