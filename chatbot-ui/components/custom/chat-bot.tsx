"use client";

import { useState, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface InitialChatBotProps {
  postPassingMessageFunction: (properties: CSSProperties) => void;
}
const ChatBot: React.FC<InitialChatBotProps> = ({
  postPassingMessageFunction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "This is a demo response. Connect to an AI API to enable real responses!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 500);
  };

  const openChatModelFunction = () => {
    setIsOpen(true);
    postPassingMessageFunction({
      width: "430px",
      height: "620px",
      borderRadius: 0,
    });
  };

  const closeChatModelFunction = () => {
    setIsOpen(false);
    postPassingMessageFunction({
      width: "56px",
      height: "56px",
      borderRadius: "50px",
    });
  };

  return (
    <>
      {/* Chat Popup */}
      {isOpen && (
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
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    message.sender === "user"
                      ? "bg-slate-900 text-white rounded-br-none"
                      : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
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
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white px-4 py-3 rounded-b-lg">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 border-slate-300 focus:border-slate-400"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
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
        onClick={isOpen ? closeChatModelFunction : openChatModelFunction}
        className="fixed bottom-0 right-0 w-14 h-14 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-full  hover:scale-110 transition-all duration-200 flex items-center justify-center z-40 border-4 border-white cursor-pointer "
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
};

export default ChatBot;
