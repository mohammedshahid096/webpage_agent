import mongoose, { Document, Schema, Model } from "mongoose";
import modelConstants from "../constants/model.constant";

export interface IMessage {
  content?: string;
  role?: "user" | "ai";
  timestamp?: Date;
  metadata?: mongoose.Schema.Types.Mixed;
}

export interface IAgentChat extends Document {
  date: Date;
  messages: IMessage[];
  history?: mongoose.Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    content: { type: String },
    role: { type: String, enum: ["user", "ai"] },
    timestamp: { type: Date, default: Date.now },
    metadata: Schema.Types.Mixed,
  },
  { _id: true },
);

const ModelSchema = new Schema<IAgentChat>(
  {
    date: { type: Date, required: true, default: Date.now },
    messages: [MessageSchema],
    history: Schema.Types.Mixed,
  },
  { timestamps: true },
);

const agentChatModel: Model<IAgentChat> = mongoose.model<IAgentChat>(
  modelConstants.agentChat,
  ModelSchema,
);

export default agentChatModel;
