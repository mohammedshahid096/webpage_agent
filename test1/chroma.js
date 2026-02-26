import CheerioService from "./cheerio.js";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config();

const WEB_COLLECTION_NAME = "web_scrapping";

class ChromaService {
  constructor() {
    this.vectorStore = null;
    this.chromaDbUrl = "http://localhost:8000";
  }
  async initialize(embeddings) {
    this.vectorStore = new Chroma(embeddings, {
      collectionName: WEB_COLLECTION_NAME,
      // url: this.chromaDbUrl,
      host: "localhost",
      port: 8000,
    });
  }

  async insertBatch(chunks, embeddings) {
    // Initialize if not already done
    if (!this.vectorStore) {
      await this.initialize(embeddings);
    }

    // Add documents
    await this.vectorStore.addDocuments(chunks);
    console.log(`✅ Inserted ${chunks.length} chunks into ChromaDB`);
  }

  async query(queryText, nResults = 5) {
    const results = await this.vectorStore.similaritySearch(
      queryText,
      nResults,
    );
    return results;
  }
}

export default ChromaService;

const cheerioService = new CheerioService({
  url: "http://aethelflow.com/",
});

const docs = await cheerioService.scrapteWebsite();
const chunckData = await cheerioService.generateChunks(docs);
console.log(`📄 Generated ${chunckData.length} chunks`);

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
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
