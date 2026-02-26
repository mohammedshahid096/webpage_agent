import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

class CheerioService {
  url = null;
  constructor({ url } = {}) {
    this.url = url;
  }

  async scrapteWebsite() {
    const loader = new CheerioWebBaseLoader(this.url);
    const docs = await loader.load();
    return docs;
  }

  async generateChunks(docs) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 20,
    });

    const splitDocs = await splitter.splitDocuments(docs);
    return splitDocs;
  }
}

export default CheerioService;
// const cheerioService = new CheerioService({
//   url: "http://aethelflow.com/",
// });

// const docs = await cheerioService.scrapteWebsite();
// const chunckData = await cheerioService.generateChunks(docs);
// console.log(chunckData);
