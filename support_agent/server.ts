import app from "./app";
import config from "./src/config/index.config";

function startServer(): void {
  app.listen(config.PORT, () => {
    console.log("Server Mode : ", config.DEVELOPMENT_MODE);
    console.log(`Server is running on  : http://localhost:${config.PORT}`);
  });
}

startServer();
