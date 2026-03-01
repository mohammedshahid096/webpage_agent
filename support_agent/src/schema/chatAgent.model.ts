import mongoose, { Document, Schema, Model } from "mongoose";
import modelConstants from "../constants/model.constant";

export interface IMessage {
  content?: string;
  role?: "human" | "ai";
  timestamp?: Date;
  metadata?: mongoose.Schema.Types.Mixed;
  tokenUsage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export interface IAgentChat extends Document {
  date: Date;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    content: { type: String },
    role: { type: String, enum: ["human", "ai"] },
    timestamp: { type: Date, default: Date.now },
    metadata: Schema.Types.Mixed,
    tokenUsage: {
      input_tokens: { type: Number },
      output_tokens: { type: Number },
      total_tokens: { type: Number },
    },
  },
  { _id: true },
);

const ModelSchema = new Schema<IAgentChat>(
  {
    date: { type: Date, required: true, default: Date.now },
    messages: [MessageSchema],
  },
  { timestamps: true },
);

const agentChatModel: Model<IAgentChat> = mongoose.model<IAgentChat>(
  modelConstants.agentChat,
  ModelSchema,
);

export default agentChatModel;
