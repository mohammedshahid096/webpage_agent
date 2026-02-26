import CheerioService from "./cheerio.js";
import { ChromaClient } from "chromadb";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config();

const WEB_COLLECTION_NAME = "web_scrapping";

class ChromaService {
  constructor() {
    this.vectorStore = null;
    this.chromaDbUrl = "http://localhost:8000";
    this.collectionName = WEB_COLLECTION_NAME;
    this.chromaClient = null;
  }

  async initialize(embeddings) {
    // Initialize Chroma client
    this.chromaClient = new ChromaClient({
      path: this.chromaDbUrl, // or use the newer format if supported
    });

    // Create or get collection with explicit embedding function
    const collection = await this.chromaClient.getOrCreateCollection({
      name: this.collectionName,
      // Explicitly set to null to avoid default embedding function
      embeddingFunction: null,
    });

    // Initialize LangChain Chroma wrapper
    this.vectorStore = new Chroma(embeddings, {
      collectionName: this.collectionName,
      url: this.chromaDbUrl,
      collection: collection, // Pass the existing collection
      client: this.chromaClient, // Pass the Chroma client
    });
  }

  async insertBatch(chunks, embeddings) {
    try {
      // Initialize if not already done
      if (!this.vectorStore) {
        await this.initialize(embeddings);
      }

      // Add documents
      await this.vectorStore.addDocuments(chunks);
      console.log(`✅ Inserted ${chunks.length} chunks into ChromaDB`);
    } catch (error) {
      console.error("❌ Error inserting batch:", error);
      throw error;
    }
  }

  async query(queryText, embeddings, nResults = 5) {
    try {
      if (!this.vectorStore) {
        await this.initialize(embeddings);
      }

      const results = await this.vectorStore.similaritySearch(
        queryText,
        nResults,
      );
      return results;
    } catch (error) {
      console.error("❌ Error querying:", error);
      throw error;
    }
  }
}

export default ChromaService;

// Your usage code
async function main() {
  try {
    const cheerioService = new CheerioService({
      url: "http://aethelflow.com/",
    });

    const docs = await cheerioService.scrapteWebsite();
    const chunckData = await cheerioService.generateChunks(docs);
    console.log(`📄 Generated ${chunckData.length} chunks`);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-001",
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const chromaService = new ChromaService();
    await chromaService.insertBatch(chunckData, embeddings);

    // Example query
    const queryResults = await chromaService.query(
      "What is this website about?",
      embeddings,
      3,
    );
    console.log("🔍 Query results:", queryResults);
  } catch (error) {
    console.error("❌ Error in main:", error);
  }
}

main();
