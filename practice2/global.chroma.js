import { ChromaClient } from "chromadb";

async function listAllChromaCollections(host = "localhost", port = 8000) {
  try {
    const client = new ChromaClient({
      host: host,
      port: port,
      ssl: false,
    });

    const collections = await client.listCollections();

    console.log("📚 ChromaDB Collections:");
    console.log("=========================");

    if (collections.length === 0) {
      console.log("No collections found");
      return [];
    }

    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });

    console.log(`\nTotal: ${collections.length} collection(s)`);

    return collections.map((c) => c.name);
  } catch (error) {
    console.error("❌ Failed to list collections:", error.message);
    return [];
  }
}

// Usage
await listAllChromaCollections();
