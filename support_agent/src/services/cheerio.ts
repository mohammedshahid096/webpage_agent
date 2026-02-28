import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import * as cheerio from "cheerio";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

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

  async scrapeWebsite2(): Promise<Document[]> {
    const loader = new CheerioWebBaseLoader(this.url);
    const docs = await loader.load();

    const cleanedDocs = docs.map((doc) => {
      const dom = new JSDOM(doc.pageContent, { url: this.url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      //   const cleaned = (article?.textContent ?? doc.pageContent)
      //     .replace(/\s{2,}/g, " ")
      //     .replace(/\n{3,}/g, "\n\n")
      //     .trim();

      const cleaned = (article?.textContent ?? doc.pageContent)
        .replace(/function\s*\(.*?\)\s*\{[\s\S]*?\}/g, "") // remove function blocks
        .replace(/\(function\s*[\s\S]*?\}\)/g, "") // remove IIFEs
        .replace(/var\s+\w+\s*=.*?;/g, "") // remove var declarations
        .replace(/const\s+\w+\s*=.*?;/g, "") // remove const declarations
        .replace(/let\s+\w+\s*=.*?;/g, "") // remove let declarations
        .replace(/\/\/.*$/gm, "") // remove single line comments
        .replace(/\/\*[\s\S]*?\*\//g, "") // remove block comments
        .replace(/\.Mui\w+[\s\S]*?(\{[\s\S]*?\})/g, "") // remove MUI class definitions
        .replace(/makeStyles\s*\([\s\S]*?\)\s*;/g, "") // remove makeStyles
        .replace(/styled\s*\([\s\S]*?\)\s*`[\s\S]*?`/g, "") // remove styled components
        .replace(/sx\s*=\s*\{\{[\s\S]*?\}\}/g, "") // remove sx props
        .replace(/css-[a-zA-Z0-9-]+/g, "") // remove MUI generated class names
        .replace(/\bMui[A-Z]\w+/g, "") // remove MUI component names
        .replace(/\s{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      return new Document({
        pageContent: cleaned,
        metadata: {
          ...doc.metadata,
          title: article?.title ?? "",
          excerpt: article?.excerpt ?? "",
        },
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
