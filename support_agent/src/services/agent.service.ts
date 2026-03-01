import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { StructuredTool } from "@langchain/core/tools";
import { gemini_model_names } from "../constants/gemini.constant";
import { IMessage } from "../schema/chatAgent.model";

interface AgentServiceConfig {
  maxOutputTokens?: number;
  temperature?: number;
  sessionId?: string | null;
  historyCount?: number;
}

interface ProcessRequestInput {
  messages?: IMessage[];
}

interface ProcessRequestResponse {
  output: string;
  messages: BaseMessage[];
}

class AgentService {
  private maxOutputTokens: number;
  private temperature: number;
  private sessionId: string | null;
  private historyCount: number;
  private systemPrompt: string;
  private googleModel: ChatGoogleGenerativeAI;
  private agentTools: StructuredTool[];

  constructor({
    maxOutputTokens = 500,
    temperature = 0.7,
    sessionId = null,
    historyCount = 6,
  }: AgentServiceConfig = {}) {
    this.maxOutputTokens = maxOutputTokens;
    this.temperature = temperature;
    this.sessionId = sessionId;
    this.historyCount = historyCount;
    this.systemPrompt = `You are a professional and friendly Website Support Agent. 
    Your role is to assist users with website-related issues such as account access, login problems, navigation help, payments, subscriptions, technical errors, and general inquiries. 
    Provide clear, step-by-step guidance when necessary. 
    Ask clarifying questions if required information is missing. 
    Keep responses concise, helpful, and solution-focused. 
    Use available tools when appropriate. 
    If an issue requires human support, politely guide the user to the correct support channel.`;

    this.googleModel = new ChatGoogleGenerativeAI({
      model: gemini_model_names["gemini-2.5-flash-lite"],
      maxOutputTokens: this.maxOutputTokens,
      temperature: this.temperature,
    });

    this.agentTools = [];
  }

  private buildMessageHistory(history: IMessage[] = []): BaseMessage[] {
    const recentHistory = history.slice(-this.historyCount);

    return recentHistory.map((message) => {
      if (message.role === "human") {
        return new HumanMessage(message.content ?? "");
      }
      return new AIMessage(message.content ?? "");
    });
  }

  async processRequest(
    input: string = "",
    sessionData: ProcessRequestInput = {},
    context: string = "",
  ): Promise<ProcessRequestResponse> {
    try {
      const systemPromptWithContext = context
        ? `${this.systemPrompt}
      ---
      Here is the relevant context from the website to help answer the user's query:
      ${context}
      ---
      Use this context to provide accurate, website-specific answers. If the context doesn't contain the answer, rely on your general knowledge.`
        : this.systemPrompt;

      const agent = createAgent({
        model: this.googleModel,
        tools: this.agentTools,
        systemPrompt: systemPromptWithContext,
      });

      const messageHistory = this.buildMessageHistory(sessionData?.messages);

      const response = await agent.invoke({
        messages: [...messageHistory, new HumanMessage(input)],
      });

      const lastMessage = response.messages[response.messages.length - 1];

      return {
        output: lastMessage?.content as string,
        messages: response.messages,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default AgentService;
