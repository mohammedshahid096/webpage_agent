import { Router } from "express";
import { createNewChatSessionController } from "../controllers/agentChat.controller";

const chatRoutes = Router();

chatRoutes.route("/new-session").post(createNewChatSessionController);

export default chatRoutes;
