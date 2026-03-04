// Define allowed environment modes
type EnvMode = "development" | "production";

// Define the shape of your API configuration
interface ServerConfig {
  API_SERVER: string;
}

// Development configuration
const development: ServerConfig = {
  API_SERVER: "http://localhost:8001/api/v1",
};

// Production configuration
const production: ServerConfig = {
  API_SERVER: process.env.VITE_API_SERVER as string,
};

// Map environments to configs
const configUrls: Record<EnvMode, ServerConfig> = {
  development,
  production,
};

// Get current environment mode (default to development)
const currentMode =
  (process.env.VITE_DEVELOPMENT_MODE as EnvMode) || "development";

const API_URLS: ServerConfig = configUrls[currentMode];

export default API_URLS;
