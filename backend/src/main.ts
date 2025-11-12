import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import * as cheerio from "cheerio";
import "dotenv/config";
import {
  Article,
  ArticleInCollection,
  Collection,
  getDataSource,
} from "shared";
import { fileURLToPath } from "url";
import z from "zod";
import { getTitleImprovementTemplate } from "./title-improvement-template";
import { logLLMObjectResponse } from "./utils";

async function fetchArticles() {
  const dataSource = await getDataSource();
  const em = dataSource.em.fork();

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
      const exists = await em.findOne(Article, {
        url: articleData.link,
      });

      if (!exists) {
        const newArticle = em.create(Article, {
          title: articleData.title,
          url: articleData.link,
          description: articleData.description,
          publishedAt: articleData.publishedAt,
        });

        console.log("Saved new article:", newArticle.title);
        await em.persistAndFlush(newArticle);
        return newArticle;
      } else {
        return exists;
      }
    })
  );

  const frontpage = em.create(Collection, {});

  await em.persistAndFlush(frontpage);

  const promises = articles.map(async (article, index) => {
    const articleInCollection = em.create(ArticleInCollection, {
      article: article,
      collection: frontpage,
      order: index + 1,
    });
    await em.persistAndFlush(articleInCollection);
  });

  await Promise.all(promises);

  console.log("Created new frontpage with articles:", articles.length);
}

async function processArticles() {
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
        const paragraphs = content.find("p");
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

    // const { text: analysis } = await generateText({
    //   model: openai("gpt-5-mini"),
    //   prompt: titleImprovementPrompt,
    // }).then(logLLMTextResponse);

    // const extractImprovedTitlePrompt = extractImprovedTitle({ analysis });
    console.log("Generating improved title");
    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: z.object({
        improvedTitle: z.string().optional(),
      }),
      prompt: titleImprovementPrompt,
      maxRetries: 1,
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

// Run if this file is executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  (async () => {
    await fetchArticles().catch(console.error);
    await processArticles().catch(console.error);
    await getDataSource().then((ds) => ds.close());
  })();
}
