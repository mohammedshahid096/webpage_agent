import CheerioService from "./cheerio.js";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

dotenv.config();

const WEB_COLLECTION_NAME = "web_scrapping";

class ChromaService {
  constructor({ embeddings = null, collectionName = null } = {}) {
    this.collectionName = collectionName;
    this.embeddings = embeddings;
    this.vectorStore = null;
  }
  async initialize() {
    if (!this.vectorStore && this.collectionName && this.embeddings) {
      this.vectorStore = new Chroma(this.embeddings, {
        collectionName: this.collectionName,
        host: "localhost",
        ssl: false,
        port: 8000,
      });

      // Wait for the collection to be ready
      await this.vectorStore.ensureCollection();
      this.isInitialized = true;
      console.log(
        `✅ Vector store initialized with collection: ${this.collectionName}`,
      );
    }
    return this.vectorStore;
  }

  async insertBatch(chunks, embeddings) {
    try {
      // Initialize if not already done
      if (!this.vectorStore) {
        await this.initialize();
      }

      if (!this.vectorStore) {
        throw new Error(
          "Vector store not initialized. Please provide embeddings and collection name.",
        );
      }
      console.log("total_chunks received", chunks.length);

      // ✅ Fix 1: Filter out empty/whitespace-only chunks
      const validChunks = chunks.filter(
        (chunk) =>
          chunk.pageContent &&
          chunk.pageContent.trim().length > 0 &&
          chunk.pageContent.trim() !== "",
      );

      if (validChunks.length === 0) {
        throw new Error("No valid text chunks found to embed.");
      }

      // Add documents
      await this.vectorStore.addDocuments(validChunks);
      console.log(`✅ Inserted ${validChunks.length} chunks into ChromaDB`);
    } catch (error) {
      console.log("error recievied -->", error);
    }
  }

  async insertBatch2(chunks, embeddings) {
    try {
      if (!this.vectorStore) {
        await this.initialize();
      }

      if (!this.vectorStore) {
        throw new Error(
          "Vector store not initialized. Please provide embeddings and collection name.",
        );
      }
      const validChunks = chunks.filter(
        (chunk) => chunk.pageContent && chunk.pageContent.trim().length > 0,
      );

      if (validChunks.length === 0) {
        throw new Error("No valid text chunks found to embed.");
      }

      console.log(`Embedding ${validChunks.length} chunks...`);

      // ✅ Manually embed the texts first
      const texts = validChunks.map((chunk) => chunk.pageContent);
      const vectors = await embeddings.embedDocuments(texts);

      console.log("Sample vector length:", vectors[0]?.length); // should be 3072 or 768

      // ✅ Then add vectors directly
      await this.vectorStore.addVectors(vectors, validChunks);

      console.log(`✅ Inserted ${validChunks.length} chunks into ChromaDB`);
    } catch (error) {
      console.error("error received -->", error);
      throw error;
    }
  }

  async insertBatch3(chunks) {
    try {
      if (!this.vectorStore) {
        await this.initialize();
      }

      if (!this.vectorStore) {
        throw new Error(
          "Vector store not initialized. Please provide embeddings and collection name.",
        );
      }

      const validChunks = chunks.filter(
        (chunk) => chunk.pageContent && chunk.pageContent.trim().length > 0,
      );

      console.log(`Embedding ${validChunks.length} chunks...`);

      // ✅ Embed one by one using embedQuery (which we know works)
      const vectors = [];
      for (let i = 0; i < 30; i++) {
        // if (i % 50 === 0) console.log(`Progress: ${i}/${validChunks.length}`);
        try {
          console.log("count", i, validChunks?.length);
          const vector = await this.embeddings.embedQuery(
            validChunks[i].pageContent,
          );
          console.log(validChunks[i]);
          vectors.push(vector);
        } catch (error) {
          console.log(error?.message);
        }
      }

      console.log("Sample vector length:", vectors?.length);

      // await this.vectorStore.addVectors(vectors, validChunks);
      console.log(`✅ Inserted ${validChunks.length} chunks into ChromaDB`);
    } catch (error) {
      console.error("error received -->", error?.message);
      // throw error;
    }
  }

  async insertBatch4(chunks) {
    try {
      if (!this.vectorStore) {
        await this.initialize();
      }

      if (!this.vectorStore) {
        throw new Error(
          "Vector store not initialized. Please provide embeddings and collection name.",
        );
      }
      const validChunks = chunks.filter(
        (chunk) => chunk.pageContent && chunk.pageContent.trim().length > 0,
      );

      console.log(`Embedding ${validChunks.length} chunks...`);

      // Generate embeddings for ALL chunks, not just first 30
      const vectors = [];
      for (let i = 0; i < 30; i++) {
        try {
          console.log(`Processing chunk ${i + 1}/${validChunks.length}`);
          const vector = await this.embeddings.embedQuery(
            validChunks[i].pageContent,
          );
          vectors.push(vector);
        } catch (error) {
          console.log(`Error on chunk ${i}:`, error?.message);
        }
      }

      console.log("Generated vectors count:", vectors.length);

      // ✅ IMPORTANT: Actually save to ChromaDB!
      if (vectors.length > 0) {
        // Use only the chunks that were successfully embedded
        const successfulChunks = validChunks.slice(0, vectors.length);

        // THIS IS THE KEY LINE - uncomment and use it
        await this.vectorStore.addVectors(vectors, successfulChunks);

        console.log(
          `✅ Successfully inserted ${vectors.length} chunks into ChromaDB`,
        );

        // Verify the insertion
        const collection = await this.vectorStore.collection;
        const count = await collection.count();
        console.log(`📊 Collection now has ${count} documents`);
      } else {
        console.log("❌ No vectors were generated");
      }
    } catch (error) {
      console.error("error received -->", error?.message);
    }
  }

  async query(queryText, nResults = 5) {
    if (!this.vectorStore) {
      await this.initialize();
    }

    if (!this.vectorStore) {
      throw new Error(
        "Vector store not initialized. Please provide embeddings and collection name.",
      );
    }
    const results = await this.vectorStore.similaritySearch(
      queryText,
      nResults,
    );
    return results;
  }

  async getCollectionInfo() {
    try {
      if (!this.vectorStore) {
        await this.initialize();
      }

      if (!this.vectorStore) {
        throw new Error(
          "Vector store not initialized. Please provide embeddings and collection name.",
        );
      }
      // Try to get collection info
      const collection = await this.vectorStore.collection;
      const count = await collection.count();
      console.log(`Collection "${this.collectionName}" has ${count} documents`);
      return count;
    } catch (error) {
      console.error("Error getting collection info:", error);
      return null;
    }
  }

  async deleteCollection() {
    try {
      if (!this.vectorStore) {
        await this.initialize();
      }

      // Delete the collection
      await this.vectorStore.deleteCollection();
      console.log(
        `✅ Collection "${this.collectionName}" deleted successfully`,
      );

      // Reset the vector store
      this.vectorStore = null;

      return true;
    } catch (error) {
      console.error("❌ Error deleting collection:", error);
      return false;
    }
  }

  async emptyCollection() {
    try {
      if (!this.vectorStore) {
        await this.initialize();
      }

      // Get the collection
      const collection = await this.vectorStore.collection;

      // Get all document IDs
      const allDocs = await collection.get();

      if (allDocs.ids && allDocs.ids.length > 0) {
        // Delete all documents by their IDs
        await collection.delete({
          ids: allDocs.ids,
        });
        console.log(
          `✅ Removed ${allDocs.ids.length} documents from collection "${this.collectionName}"`,
        );
      } else {
        console.log(`📂 Collection "${this.collectionName}" is already empty`);
      }

      return true;
    } catch (error) {
      console.error("❌ Error emptying collection:", error);
      return false;
    }
  }
}

export default ChromaService;

const cheerioService = new CheerioService({
  url: "http://aethelflow.com/",
  // url: "https://en.wikipedia.org/wiki/Lorem_ipsum",
});

const docs = await cheerioService.scrapteWebsite();
const chunckData = await cheerioService.generateChunks(docs);
console.log(`📄 Generated ${chunckData.length} chunks`);

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001", // 768 dimensions
  apiVersion: "v1", // use v1 not v1beta
});

// Test 1: Direct embedding test
// try {
//   const testEmbedding = await embeddings.embedQuery("hello world");
//   console.log("✅ Embedding works, length:", testEmbedding.length);
//   console.log("First few values:", testEmbedding.slice(0, 5));
// } catch (err) {
//   console.error("❌ Embedding failed:", err.message);
// }

// // Test 2: Check your chunks
// console.log("Sample chunks:");
// chunckData.slice(0, 5).forEach((chunk, i) => {
//   console.log(`Chunk ${i}:`, {
//     contentLength: chunk.pageContent?.length,
//     content: chunk.pageContent?.slice(0, 100),
//     type: typeof chunk.pageContent,
//   });
// });

const chromaService = new ChromaService({
  embeddings,
  collectionName: WEB_COLLECTION_NAME,
});
await chromaService.initialize();
// await chromaService.insertBatch4(chunckData, embeddings);

// await new Promise((resolve) => setTimeout(resolve, 2000));

// Example query
// await chromaService.getCollectionInfo(); // Check if data was actually inserted

// await chromaService.emptyCollection();
// const userQuestion = "what is aethel flow website is about, can you explain";
const userQuestion = "what services aethel flow provides";
const queryResults = await chromaService.query(userQuestion);
console.log("🔍 Query results:", queryResults);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  // verbose: true,
  // maxOutputTokens: 100,
});

// 1. Get relevant chunks from ChromaDB
const context = queryResults.map((doc) => doc.pageContent).join("\n\n");

// 2. Build prompt with context
const messages = [
  new SystemMessage(`You are a helpful assistant. Use the following context from the website to answer the user's question. If the answer is not in the context, say so.

Context:
${context}`),
  new HumanMessage(userQuestion),
];

// 3. Ask the LLM
const response = await model.invoke(messages);
console.log(response.content);
