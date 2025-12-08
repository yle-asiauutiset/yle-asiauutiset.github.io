import { anthropic } from "@ai-sdk/anthropic";
import { generateObject, generateText } from "ai";
import * as cheerio from "cheerio";
import "dotenv/config";
import {
  Article,
  ArticleInCollection,
  Collection,
  Frontpage,
  getDataSource,
} from "shared";
import { fileURLToPath } from "url";
import z from "zod";
import {
  extractImprovedTitle,
  getTitleImprovementTemplate,
} from "./title-improvement-template";
import { logLLMObjectResponse, logLLMTextResponse } from "./utils";
import { CronJob } from "cron";

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

    const { text: analysis } = await generateText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      prompt: titleImprovementPrompt,
    }).then(logLLMTextResponse);

    const extractImprovedTitlePrompt = extractImprovedTitle({ analysis });
    console.log("Generating improved title");
    const { object } = await generateObject({
      model: anthropic("claude-haiku-4-5-20251001"),
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

async function publishFrontpage() {
  const dataSource = await getDataSource();
  const em = dataSource.em.fork();

  const date = new Date().toISOString().split("T")[0];

  const collection = await em
    .find(
      Collection,
      {},
      { populate: ["articles"], orderBy: { createdAt: "DESC" }, limit: 1 }
    )
    .then((cols) => cols[0]);

  if (!collection) {
    console.error("No collection found to publish.");
    return;
  }

  const frontpage: Frontpage = {
    articles: collection.articles.map((article) => ({
      ...article,
      publishedAt: new Date(article.publishedAt as any)?.toISOString(),
      createdAt: new Date(article.createdAt)?.toISOString(),
      updatedAt: new Date(article.updatedAt)?.toISOString(),
    })),
    generatedAt: new Date(collection.createdAt)?.toISOString(),
  };

  console.log(JSON.stringify(frontpage, null, 2));

  const files: Record<string, { content: string }> = {};

  files[`${date}.json`] = {
    content: JSON.stringify(frontpage, null, 2),
  };

  await fetch(`https://api.github.com/gists/${process.env.GITHUB_GIST_ID}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `token ${process.env.GITHUB_GIST_TOKEN}`,
    },
    body: JSON.stringify({
      files,
    }),
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to update gist: ${res.status} ${res.statusText}`);
    } else {
      console.log("Successfully updated gist with frontpage data.");
    }
  });

  console.log("Dispatching build hook to update frontend site...");

  await fetch(
    "https://api.github.com/repos/yle-asiauutiset/yle-asiauutiset.github.io/dispatches",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${process.env.GITHUB_ACTIONS_TOKEN}`,
      },
      body: JSON.stringify({
        event_type: "webhook",
      }),
    }
  ).then(async (res) => {
    if (!res.ok) {
      throw new Error(
        `Failed to dispatch build hook: ${res.status} ${res.statusText} ${await res.text()}`
      );
    } else {
      console.log("Successfully dispatched build hook.");
    }
  });
}

async function main() {
  await fetchArticles().catch(console.error);
  await processArticles().catch(console.error);
  await publishFrontpage().catch(console.error);
  await getDataSource().then((ds) => ds.close());
}

// Run if this file is executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  (async () => {
    await main();

    // Run once per day at 6.30 AM
    const job = new CronJob("30 6 * * *", async () => {
      console.log("Starting scheduled job: fetch, process, publish frontpage");
      await main();
    });

    job.start();
  })();
}
