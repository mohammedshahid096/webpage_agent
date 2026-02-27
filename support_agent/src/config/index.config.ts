import dotenv from "dotenv";

type Environment = "development" | "production";

interface Config {
  PORT: number | string;
  DEVELOPMENT_MODE: Environment;
  CORS_ALLOW_ORIGINS: string[];
  ACCESS_TOKEN_KEY: string;
  ACCESS_TOKEN_KEY_TIME: string;
  DB_URL: string;
}

dotenv.config();

const config: Config = {
  PORT: process.env.PORT || 8001,
  DEVELOPMENT_MODE:
    (process.env.DEVELOPMENT_MODE as Environment) || "development",
  CORS_ALLOW_ORIGINS: JSON.parse(process.env.ALLOW_ORIGINS_ACCESS || "[]"),
  ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY || "something",
  ACCESS_TOKEN_KEY_TIME: process.env.ACCESS_TOKEN_KEY_TIME || "1D",
  DB_URL: process.env.DB_URL || "mongodb://127.0.0.1:27017/support_agent",
};

export default config;
