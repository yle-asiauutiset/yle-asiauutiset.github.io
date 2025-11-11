import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import * as cheerio from "cheerio";
import { Article, Frontpage, getDataSource } from "db";
import { fileURLToPath } from "url";
import {
  extractImprovedTitle,
  getTitleImprovementTemplate,
} from "./title-improvement-template";
import z from "zod";
import { logLLMObjectResponse, logLLMTextResponse } from "./utils";
// Example usage
async function fetchArticles() {
  const dataSource = await getDataSource();

  // // Create a new user
  const articleRepository = dataSource.getRepository(Article);
  const frontpageRepository = dataSource.getRepository(Frontpage);

  const mostPopularArticles = await fetch(
    "https://yle.fi/rss/uutiset/luetuimmat"
  )
    .then((r) => r.text())
    .then((xmlString) => {
      const doc = cheerio.load(xmlString, { xmlMode: true });

      // Process the parsed XML data
      const articles = doc("item")
        .map((i, el) => {
          const title = doc(el).find("title").text();
          const description = doc(el).find("description").text();
          const link = doc(el).find("guid").text();
          const publishedAt = new Date(doc(el).find("pubDate").text());

          return { title, description, link, publishedAt };
        })
        .get();

      return articles;
    });

  const articles = await Promise.all(
    mostPopularArticles.map(async (articleData) => {
      const exists = await articleRepository.findOneBy({
        url: articleData.link,
      });

      if (!exists) {
        const newArticle = articleRepository.create({
          title: articleData.title,
          url: articleData.link,
          description: articleData.description,
          publishedAt: articleData.publishedAt,
        });

        console.log("Saved new article:", newArticle.title);
        return await articleRepository.save(newArticle);
      } else {
        return exists;
      }
    })
  );

  const frontpage = frontpageRepository.create({
    articles,
  });

  await frontpageRepository.save(frontpage);

  console.log("Created new frontpage with articles:", articles.length);
}

async function processArticles() {
  const dataSource = await getDataSource();

  const frontpageRepository = dataSource.getRepository(Frontpage);
  const articleRepository = dataSource.getRepository(Article);

  const articlesToProcess = await articleRepository.find({
    where: {
      didProcessTitle: false,
    },
  });

  const processPromises = articlesToProcess.slice(0, 3).map(async (article) => {
    const articleBody = await fetch(article.url)
      .then((res) => res.text())
      .then((html) => {
        const doc = cheerio.load(html);

        let body = "";
        const content = doc("section.yle__article__content");
        const paragraphs = content.find("p");
        paragraphs.each((i, el) => {
          body += doc(el).text() + "\n";
        });

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

    const { text: analysis } = await generateText({
      model: openai("gpt-5-mini"),
      prompt: titleImprovementPrompt,
    }).then(logLLMTextResponse);

    const extractImprovedTitlePrompt = extractImprovedTitle({ analysis });
    const { object } = await generateObject({
      model: openai("gpt-5-nano"),
      schema: z.object({
        improvedTitle: z.string().optional(),
      }),
      prompt: extractImprovedTitlePrompt,
    }).then(logLLMObjectResponse);

    console.log("Extracted object:", object, "\n\n===\n\n");

    article.correctedTitle = object.improvedTitle || undefined;
    article.didProcessTitle = true;
    await articleRepository.save(article);

    console.log(
      `Processed article: "${article.title}" -> "${article.correctedTitle}"`
    );
  });

  await Promise.all(processPromises);
}

// Run if this file is executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  (async () => {
    await fetchArticles().catch(console.error);
    await processArticles().catch(console.error);
  })();
}
