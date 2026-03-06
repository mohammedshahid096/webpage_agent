"use client";

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { useChatProvider } from "@/app/providers/chatContext";
import {
  createNewSessionApi,
  sendChatMessageApi,
  sessionDetailsApi,
} from "@/app/apis/chatbot.api";
import { v4 as uuidV4 } from "uuid";
import { Message } from "@/app/types/chatbot.types";
import {
  getChatSession,
  setChatSession,
} from "@/helper/session-storage.helper";
import ScrollToBottom from "react-scroll-to-bottom";

interface InitialChatBotProps {
  postPassingMessageFunction: (properties: CSSProperties) => void;
}
const ChatBot: React.FC<InitialChatBotProps> = ({
  postPassingMessageFunction,
}) => {
  const { sessionDetails, setSessionDetails } = useChatProvider();
  const [info, setInfo] = useState({
    isOpen: false,
    sessionLoading: false,
    isLoading: false,
    inputMessage: "",
  });

  useEffect(() => {
    let sessionExist = getChatSession();
    if (sessionExist) {
      getSessionDetailsFunction(sessionExist);
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info?.inputMessage.trim() || !sessionDetails?._id) return;

    let updateState = {
      inputMessasge: info?.inputMessage?.trim() || "",
    };

    setInfo((prev) => ({
      ...prev,
      isLoading: true,
      inputMessage: "",
    }));

    let newMessage: Message = {
      _id: uuidV4(),
      role: "human",
      content: info?.inputMessage?.trim(),
      timestamp: new Date().toISOString(),
    };

    setSessionDetails((prev) => {
      if (!prev) return prev; // or return null

      return {
        ...prev,
        messages: [...prev.messages, newMessage],
      };
    });

    const response = await sendChatMessageApi(sessionDetails?._id, {
      inputMessage: info?.inputMessage?.trim(),
    });

    if (response[0]) {
      const details = response[1]?.data;
      setSessionDetails(details);
      updateState.inputMessasge = "";
    }

    setInfo((prev) => ({
      ...prev,
      isLoading: false,
      ...updateState,
    }));
  };

  const openChatModelFunction = () => {
    setInfo((prev) => ({
      ...prev,
      isOpen: true,
      sessionLoading: sessionDetails ? false : true,
    }));
    postPassingMessageFunction({
      width: "430px",
      height: "620px",
      borderRadius: 0,
    });
    if (!sessionDetails) {
      createNewSessionFunction();
    }
  };

  const closeChatModelFunction = () => {
    setInfo((prev) => ({ ...prev, isOpen: false }));
    postPassingMessageFunction({
      width: "56px",
      height: "56px",
      borderRadius: "50px",
    });
  };

  const createNewSessionFunction = async () => {
    const response = await createNewSessionApi();
    if (response[0]) {
      const details = response[1]?.data;
      setSessionDetails({
        ...details,
      });
      setChatSession(details?._id);
    }

    setInfo((prev) => ({
      ...prev,
      sessionLoading: false,
    }));
  };

  const getSessionDetailsFunction = async (sessionId: string) => {
    const response = await sessionDetailsApi(sessionId);
    if (response[0]) {
      const details = response[1]?.data;
      setSessionDetails(details);
    }
  };

  return (
    <>
      {/* Chat Popup */}
      {info?.isOpen && (
        <div className="fixed bottom-24 right-6 w-96  rounded-lg  flex flex-col z-50 h-[500px] border border-slate-200 transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="font-semibold">Chat Assistant</h3>
                <p className="text-xs text-slate-200">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeChatModelFunction}
              className="text-white hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollToBottom className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {" "}
            {sessionDetails?.messages?.map((message) => (
              <div
                key={message?._id}
                className={`flex my-2 ${message.role === "human" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    message?.role === "human"
                      ? "bg-slate-900 text-white rounded-br-none"
                      : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                  }`}
                >
                  {message?.content}
                </div>
              </div>
            ))}
            {info?.isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </ScrollToBottom>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white px-4 py-3 rounded-b-lg">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={info?.inputMessage}
                disabled={info?.isLoading}
                onChange={(e) =>
                  setInfo((prev) => ({ ...prev, inputMessage: e.target.value }))
                }
                className="flex-1 border-slate-300 focus:border-slate-400"
              />
              <Button
                type="submit"
                disabled={info?.isLoading || !info?.inputMessage.trim()}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={info?.isOpen ? closeChatModelFunction : openChatModelFunction}
        className="fixed bottom-0 right-0 w-14 h-14 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-full  hover:scale-110 transition-all duration-200 flex items-center justify-center z-40 border-4 border-white cursor-pointer "
      >
        {info?.isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
};

export default ChatBot;

// 69a40c49abcf03f0242b4a38
