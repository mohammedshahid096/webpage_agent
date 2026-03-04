"use client";

import ChatBot from "@/components/custom/chat-bot";
import type { CSSProperties } from "react";

export default function Home() {
  const postPassingMessageFunction = (properties: CSSProperties): void => {
    const payload: {
      type: "resize";
      properties: CSSProperties;
    } = {
      type: "resize",
      properties,
    };

    window.parent.postMessage(payload, "*");
  };

  return <ChatBot postPassingMessageFunction={postPassingMessageFunction} />;
}
