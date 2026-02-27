import { Router } from "express";

const chatRoutes = Router();

chatRoutes.route("/new-chat").post();

export default chatRoutes;
