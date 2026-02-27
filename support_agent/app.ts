import express, { Application, Request, Response, NextFunction } from "express";
// configs
import corsConfig from "./src/config/cors.config";
import helmetConfig from "./src/config/helmet.config";
import ratelimitConfig from "./src/config/ratelimit.config";
import errorHandling from "./src/utils/errorHandling.util";
import compressionConfig from "./src/config/compression.config";
// routes
import IndexRoutes from "./src/routes/index.route";

const app: Application = express();

// configs using middlewares
app.use(ratelimitConfig);
app.use(compressionConfig);
app.use(express.json());
app.use(helmetConfig);
app.use(corsConfig);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// routes
app.use(IndexRoutes);

// error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorHandling.handlingAppError(err, res);
});

export default app;
