import mongoose from "mongoose";
import modelConstants from "../constants/model.constant";

const ModelSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    messages: [
      {
        content: {
          type: String,
        },
        role: {
          type: String,
          enum: ["user", "ai"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
    history: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

const agentChatModel = mongoose.model(modelConstants.agentChat, ModelSchema);

module.exports = agentChatModel;
