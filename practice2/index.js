import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { TaskType } from "@google/generative-ai";
import "dotenv/config";

async function run() {
  // 1. Load data from a URL
  const loader = new CheerioWebBaseLoader(
    "https://js.langchain.com/docs/introduction/",
  );
  const docs = await loader.load();

  // 2. Split the text into manageable chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await splitter.splitDocuments(docs);

  // 3. Initialize Gemini Embeddings
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: "embedding-001", // Optimized for vector search
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });

  // 4. Store in ChromaDB
  // Note: Ensure your Chroma server is running (e.g., via Docker)
  const vectorStore = await Chroma.fromDocuments(splits, embeddings, {
    collectionName: "langchain-docs",
    // url: "http://localhost:8000",
    host: "localhost",
    ssl: false,
    port: 8000,
  });

  // 5. Test a similarity search
  const results = await vectorStore.similaritySearch("What is LangChain?", 2);

  console.log("Search Results:");
  console.log(results.map((r) => r.pageContent));
}

run().catch(console.error);
