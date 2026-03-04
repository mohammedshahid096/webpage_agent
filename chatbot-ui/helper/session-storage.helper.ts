const CHAT_SESSION_KEY = "chat_session" as const;

// Get Chat Session
export const getChatSession = (): string | null => {
  if (typeof window === "undefined") return null;

  return sessionStorage.getItem(CHAT_SESSION_KEY);
};

// Set Chat Session
export const setChatSession = (session: string): boolean => {
  if (typeof window === "undefined") return false;

  sessionStorage.setItem(CHAT_SESSION_KEY, session);
  return true;
};

// Remove Chat Session
export const removeChatSession = (): boolean => {
  if (typeof window === "undefined") return false;

  sessionStorage.removeItem(CHAT_SESSION_KEY);
  return true;
};

// Clear Session Storage (optional – clears everything in sessionStorage)
export const clearSessionStorage = (): boolean => {
  if (typeof window === "undefined") return false;

  sessionStorage.clear();
  return true;
};
