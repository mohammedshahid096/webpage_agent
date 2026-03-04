import Service from "@/app/services";

export const createNewSessionApi = async () => {
  const response = await Service.fetchPost("/agent/new-session", {});
  return response;
};

export const sessionDetailsApi = async (sessionId: string) => {
  const response = await Service.fetchGet(
    `/agent/${sessionId}/session-details`,
  );
  return response;
};

export const sendChatMessageApi = async (
  sessionId: string,
  json: { inputMessage: string },
) => {
  const response = await Service.fetchPost(
    `/agent/${sessionId}/chat-agent`,
    json,
  );
  return response;
};
