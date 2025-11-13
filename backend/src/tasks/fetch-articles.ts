import * as cheerio from "cheerio";
import "dotenv/config";
import {
  Article,
  ArticleInCollection,
  Collection,
  getDataSource,
} from "shared";

export async function fetchArticles() {
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
