import { Router } from "express";
import {
  agentChatController,
  createNewChatSessionController,
  loadWebsiteController,
} from "../controllers/agentChat.controller";

const chatRoutes = Router();

chatRoutes.route("/new-session").post(createNewChatSessionController);

chatRoutes.route("/load-website").get(loadWebsiteController);

chatRoutes.route("/:sessionId/chat-agent").post(agentChatController);

export default chatRoutes;
