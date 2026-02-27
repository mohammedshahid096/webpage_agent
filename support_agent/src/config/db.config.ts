import mongoose from "mongoose";
import config from "./index.config";

// Function for database connection
const MongoDataBaseConnection = async (): Promise<void> => {
  try {
    const dbUrl: string = config.DB_URL;

    await mongoose.connect(dbUrl as string);

    console.log(`database is connected`);
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.CastError) {
      console.error("CastError:", error.value, error.path);
    } else if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 8000
    ) {
      console.error("MongoServerError (Authentication): Check credentials.");
    } else if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      console.error(
        "MongoServerError (Duplicate Key): A document with that value already exists.",
      );
    } else if (
      error instanceof mongoose.mongo.MongoNetworkError ||
      (error instanceof Error && error.message.includes("timed out"))
    ) {
      console.error(
        "MongoNetworkError or Timeout: Network connectivity issue.",
      );
    } else if (
      error instanceof mongoose.Error.MongooseServerSelectionError ||
      (error instanceof Error &&
        error.message.includes("Server selection timed out"))
    ) {
      console.error(
        "MongooseServerSelectionError: Could not connect to the MongoDB server.",
      );
    } else {
      console.error("Other MongoDB connection error:", error);
    }
  }
};

export default MongoDataBaseConnection;
