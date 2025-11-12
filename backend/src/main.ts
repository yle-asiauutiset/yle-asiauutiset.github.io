import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import * as cheerio from "cheerio";
import { Article, ArticleInCollection, Collection, getDataSource } from "db";
import { fileURLToPath } from "url";
import {
  extractImprovedTitle,
  getTitleImprovementTemplate,
} from "./title-improvement-template";
import z from "zod";
import { logLLMObjectResponse, logLLMTextResponse } from "./utils";

async function fetchArticles() {
  const dataSource = await getDataSource();

  // // Create a new user
  const articleRepository = dataSource.getRepository(Article);
  const articlesInCollectionRepository =
    dataSource.getRepository(ArticleInCollection);
  const collectionRepository = dataSource.getRepository(Collection);

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

  const frontpage = collectionRepository.create({});

  await collectionRepository.save(frontpage);

  const promises = articles.map(async (article, index) => {
    const articleInCollection = articlesInCollectionRepository.create({
      articleUrl: article.url,
      collectionId: frontpage.id,
      order: index + 1,
    });
    await articlesInCollectionRepository.save(articleInCollection);
  });

  await Promise.all(promises);

  console.log("Created new frontpage with articles:", articles.length);
}

async function processArticles() {
  const dataSource = await getDataSource();

  const articleRepository = dataSource.getRepository(Article);

  const articlesToProcess = await articleRepository.find({
    where: {
      didProcessTitle: false,
    },
  });

  const processPromises = articlesToProcess.map(async (article) => {
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
    const { object } = await generateObject({
      model: openai("gpt-5"),
      schema: z.object({
        improvedTitle: z.string().optional(),
      }),
      prompt: titleImprovementPrompt,
    }).then(logLLMObjectResponse);

    console.log("Extracted object:", object, "\n\n===\n\n");

    article.correctedTitle = object.improvedTitle || undefined;
    article.didProcessTitle = true;
    article.body = articleBody || undefined;
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
