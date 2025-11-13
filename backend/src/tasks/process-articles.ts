import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import * as cheerio from "cheerio";
import "dotenv/config";
import { Article, getDataSource } from "shared";
import z from "zod";
import {
  extractImprovedTitle,
  getTitleImprovementTemplate,
} from "../title-improvement-template";
import { logLLMObjectResponse, logLLMTextResponse } from "../utils";

export async function processArticles() {
  const dataSource = await getDataSource();
  const em = dataSource.em.fork();

  const articlesToProcess = await em.find(Article, {
    didProcessTitle: false,
  });

  for (const article of articlesToProcess.slice(
    0,
    Number(process.env.MAX_PROCESSED_ARTICLES) || articlesToProcess.length
  )) {
    console.log("Processing article:", article.title, article.url);
    const articleBody = await fetch(article.url)
      .then((res) => res.text())
      .then((html) => {
        const doc = cheerio.load(html);

        console.log("Fetched article body for URL:", article.url);

        let body = "";
        const content = doc("section.yle__article__content, div.post-content");
        console.log("Article content length:", content.text().length);
        const paragraphs = content.find("p, h2");
        console.log("Article paragraphs found:", paragraphs.length);
        paragraphs.each((i, el) => {
          body += doc(el).text() + "\n";
        });

        console.log("Extracted article body length:", body.length);

        return body;
      })
      .catch((err) => {
        console.error("Error fetching article body:", err);
        return "";
      });

    if (!articleBody) {
      console.warn(
        `Can't process, article body is empty for URL: ${article.url}`
      );
      // article.didProcessTitle = true;
      // await articleRepository.save(article);
      return;
    }

    const titleImprovementPrompt = getTitleImprovementTemplate({
      title: article.title,
      body: articleBody,
    });

    console.log(
      "Generating analysis for title improvement",
      titleImprovementPrompt
    );

    const { text: analysis } = await generateText({
      model: openai("gpt-5"),
      prompt: titleImprovementPrompt,
    }).then(logLLMTextResponse);

    const extractImprovedTitlePrompt = extractImprovedTitle({ analysis });
    console.log("Generating improved title");
    const { object } = await generateObject({
      model: openai("gpt-5-nano"),
      schema: z.object({
        improvedTitle: z.string().optional(),
      }),
      prompt: extractImprovedTitlePrompt,
    })
      .then(logLLMObjectResponse)
      .catch((err) => {
        console.error("Error generating improved title:", err);
        return { object: undefined };
      });

    if (!object) {
      console.error("Failed to extract improved title.");
      return;
    }

    console.log("Extracted object:", object, "\n\n===\n\n");

    article.correctedTitle = object.improvedTitle || undefined;
    article.didProcessTitle = true;
    article.body = articleBody || undefined;
    await em.persistAndFlush(article);

    console.log(
      `Processed article: "${article.title}" -> "${article.correctedTitle}"`
    );

    if (
      process.env.RATE_LIMIT_REQUESTS_PER_MINUTE &&
      articlesToProcess.indexOf(article) < articlesToProcess.length - 1
    ) {
      const delay =
        (60 / Number(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE)) * 1000 + 2000;
      console.log(`Waiting for ${delay} ms to respect rate limits...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.log("Article processing completed.");
}
