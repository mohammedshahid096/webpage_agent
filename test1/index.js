import dotenv from "dotenv";
import { Ollama } from "@langchain/ollama";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

const model = new Ollama({
  model: "deepseek-r1:1.5b", // Default value
  temperature: 0.7,
  maxRetries: 2,
  // other params...
});

const model3 = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  verbose: true,
  // maxOutputTokens: 100,
});
async function callWithInvokeMethod() {
  console.log("hello wating");
  const response = await model3.invoke(
    " i am shahid, can you tell me what is my name?, and am from hyderabad, what u think about hyderabad",
  );
  console.log(response?.content);
}

callWithInvokeMethod();
