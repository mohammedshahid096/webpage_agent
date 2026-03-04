"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { SessionDetails } from "../apis/chatbot.types";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

type ChatContextType = {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  sessionDetails: null | SessionDetails;
  setSessionDetails: Dispatch<SetStateAction<null | SessionDetails>>;
};

type ChatProviderProps = {
  children: ReactNode;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatProvider = (): ChatContextType => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  return context;
};

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionDetails, setSessionDetails] = useState<null | SessionDetails>(
    null,
  );

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        sessionDetails,
        setSessionDetails,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
