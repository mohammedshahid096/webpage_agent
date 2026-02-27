import { Router } from "express";
import chatRoutes from "./agent.route";

const apiV1Routes = Router();

// chat routes
apiV1Routes.use("/agent", chatRoutes);

export default apiV1Routes;
