export type SessionDetails = {
  _id: string;
  date: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  messages: Message[];
};

export type Message = {
  _id: string;
  content: string;
  role: "human" | "ai";
  timestamp: string;
  tokenUsage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
};
