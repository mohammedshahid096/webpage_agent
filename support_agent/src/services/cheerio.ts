import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import * as cheerio from "cheerio";

interface CheerioServiceOptions {
  url: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

class CheerioService {
  private url: string;
  private chunkSize: number;
  private chunkOverlap: number;

  constructor({
    url,
    chunkSize = 500,
    chunkOverlap = 100,
  }: CheerioServiceOptions) {
    this.url = url;
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  async scrapeWebsite(): Promise<Document[]> {
    const loader = new CheerioWebBaseLoader(this.url);
    const docs = await loader.load();
    // return docs;

    const cleanedDocs = docs.map((doc) => {
      const cleaned = doc.pageContent
        .replace(/[\t]+/g, " ") // tabs
        .replace(/\s{2,}/g, " ") // multiple spaces
        .replace(/\n{3,}/g, "\n\n") // excessive newlines
        .replace(/[^\S\r\n]{2,}/g, " ") // inline whitespace
        .trim();

      return new Document({
        pageContent: cleaned,
        metadata: doc.metadata,
      });
    });

    return cleanedDocs;
  }

  async scrapeCleanWebsite(): Promise<Document[]> {
    const loader = new CheerioWebBaseLoader(this.url);
    const docs = await loader.load();

    const cleanedDocs: Document[] = docs.map((doc) => {
      const $ = cheerio.load(doc.pageContent);

      // Remove unwanted elements
      $(
        "script, style, noscript, svg, img, iframe, header, footer, nav, form",
      ).remove();

      // Remove inline styles
      $("[style]").removeAttr("style");
      $('[id^="__next"]').remove();
      $('[class*="mui-"]').remove();

      const text = $("body").text();

      const cleaned = text
        .replace(/\t+/g, " ")
        .replace(/\s{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[^\S\r\n]{2,}/g, " ")
        .trim();

      return new Document({
        pageContent: cleaned,
        metadata: doc.metadata,
      });
    });

    return cleanedDocs;
  }
  async generateChunks(docs: Document[]): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap,
    });

    const splitDocs = await splitter.splitDocuments(docs);
    return splitDocs;
  }
}

export default CheerioService;
