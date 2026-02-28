import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Embeddings } from "@langchain/core/embeddings";
import { Document } from "@langchain/core/documents";
import config from "../config/index.config";

interface ChromaServiceOptions {
  embeddings?: Embeddings | null;
  collectionName?: string | null;
}

class ChromaService {
  private collectionName: string | null;
  private embeddings: Embeddings | null;
  private vectorStore: Chroma | null;

  constructor({
    embeddings = null,
    collectionName = null,
  }: ChromaServiceOptions = {}) {
    this.collectionName = collectionName;
    this.embeddings = embeddings;
    this.vectorStore = null;
  }

  async initialize(): Promise<Chroma | null> {
    if (!this.vectorStore && this.collectionName && this.embeddings) {
      this.vectorStore = new Chroma(this.embeddings, {
        collectionName: this.collectionName,
        host: config.CHROMA_HOST,
        ssl: config.CHROMA_SSL,
        port: config.CHROMA_PORT,
      } as any);

      await this.vectorStore.ensureCollection();
      console.log(
        `✅ Vector store initialized with collection: ${this.collectionName}`,
      );
    }
    return this.vectorStore;
  }

  private async ensureVectorStore(): Promise<Chroma> {
    if (!this.vectorStore) {
      await this.initialize();
    }
    if (!this.vectorStore) {
      throw new Error(
        "Vector store not initialized. Please provide embeddings and collection name.",
      );
    }
    return this.vectorStore;
  }

  async insertBatch(chunks: Document[]): Promise<void> {
    try {
      await this.ensureVectorStore();

      console.log("total_chunks received", chunks.length);

      const validChunks = chunks.filter(
        (chunk) => chunk.pageContent && chunk.pageContent.trim().length > 0,
      );

      if (validChunks.length === 0) {
        throw new Error("No valid text chunks found to embed.");
      }

      await this.vectorStore?.addDocuments(validChunks);
      console.log(`✅ Inserted ${validChunks.length} chunks into ChromaDB`);
    } catch (error) {
      console.error("error received -->", error);
    }
  }

  async insertBatchWithVectors(
    chunks: Document[],
    embeddings: Embeddings,
  ): Promise<void> {
    try {
      await this.ensureVectorStore();

      const validChunks = chunks.filter(
        (chunk) => chunk.pageContent && chunk.pageContent.trim().length > 0,
      );

      if (validChunks.length === 0) {
        throw new Error("No valid text chunks found to embed.");
      }

      console.log(`Embedding ${validChunks.length} chunks...`);

      const texts = validChunks.map((chunk) => chunk.pageContent);
      const vectors = await embeddings.embedDocuments(texts);

      console.log("Sample vector length:", vectors[0]?.length);

      await this.vectorStore?.addVectors(vectors, validChunks);
      console.log(`✅ Inserted ${validChunks.length} chunks into ChromaDB`);
    } catch (error) {
      console.error("error received -->", error);
      throw error;
    }
  }

  async insertBatchSafe(chunks: Document[]): Promise<void> {
    try {
      const vectorStore = await this.ensureVectorStore();

      if (!this.embeddings) {
        throw new Error("Embeddings not provided.");
      }

      const validChunks = chunks.filter(
        (chunk) => chunk.pageContent && chunk.pageContent.trim().length > 0,
      );

      console.log(`Embedding ${validChunks.length} chunks...`);

      const vectors: number[][] = [];
      const successfulChunks: Document[] = [];

      for (let i = 0; i < validChunks.length; i++) {
        try {
          const chunk = validChunks[i]; // TypeScript now knows this is defined
          console.log(`Processing chunk ${i + 1}/${validChunks.length}`);
          const vector = await this.embeddings.embedQuery(chunk!.pageContent);
          vectors.push(vector);
          successfulChunks.push(chunk!);
        } catch (error: any) {
          console.log(`Error on chunk ${i}:`, error?.message);
        }
      }

      console.log("Generated vectors count:", vectors.length);

      if (vectors.length > 0) {
        await vectorStore.addVectors(vectors, successfulChunks);
        console.log(
          `✅ Successfully inserted ${vectors.length} chunks into ChromaDB`,
        );

        const collection = await vectorStore.collection;
        const count = await collection?.count();
        console.log(`📊 Collection now has ${count} documents`);
      } else {
        console.log("❌ No vectors were generated");
      }
    } catch (error: any) {
      console.error("error received -->", error?.message);
    }
  }

  async query(queryText: string, nResults: number = 5): Promise<Document[]> {
    const vectorStore = await this.ensureVectorStore();
    const results = await vectorStore.similaritySearch(queryText, nResults);
    return results;
  }

  async getCollectionInfo(): Promise<number | null> {
    try {
      const vectorStore = await this.ensureVectorStore();
      const collection = await vectorStore.collection;
      const count = await collection?.count();
      console.log(`Collection "${this.collectionName}" has ${count} documents`);
      return count ?? 0;
    } catch (error) {
      console.error("Error getting collection info:", error);
      return null;
    }
  }

  async deleteCollection(): Promise<boolean> {
    try {
      await this.ensureVectorStore();
      //   await this.vectorStore?.deleteCollection();
      await (this.vectorStore as any)?.deleteCollection?.();
      console.log(
        `✅ Collection "${this.collectionName}" deleted successfully`,
      );
      this.vectorStore = null;
      return true;
    } catch (error) {
      console.error("❌ Error deleting collection:", error);
      return false;
    }
  }

  async emptyCollection(): Promise<boolean> {
    try {
      const vectorStore = await this.ensureVectorStore();
      const collection = await vectorStore.collection;
      const allDocs = (await collection?.get()) ?? null;

      if (allDocs?.ids && allDocs.ids.length > 0) {
        await collection?.delete({ ids: allDocs.ids });
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
