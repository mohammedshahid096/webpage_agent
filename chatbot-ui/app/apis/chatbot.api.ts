import Service from "@/app/services";

export const createNewSessionApi = async () => {
  const response = await Service.fetchPost("/agent/new-session", {});
  return response;
};
