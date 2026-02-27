import { Router } from "express";
import {
  createNewChatSessionController,
  loadWebsiteController,
} from "../controllers/agentChat.controller";

const chatRoutes = Router();

chatRoutes.route("/new-session").post(createNewChatSessionController);

chatRoutes.route("/load-website").get(loadWebsiteController);

export default chatRoutes;
