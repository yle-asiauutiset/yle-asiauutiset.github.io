import "reflect-metadata";
import { fileURLToPath } from "url";
import { Article } from "./entities/Article";
import { Collection } from "./entities/Collection";
import { getDataSource } from "./data-source";

// Example usage
async function main() {
  const orm = await getDataSource();
  const em = orm.em.fork();

  // Create a new article
  const articleRepository = em.getRepository(Article);
  const collectionRepository = em.getRepository(Collection);

  // const newArticle = new Article();
  // newArticle.url = "http://example.com/article";
  // newArticle.title = "New Article";
  // newArticle.imageUrl = "http://example.com/image.jpg";

  // await em.persistAndFlush(newArticle);
  // console.log("Article saved:", newArticle);

  // const newCollection = new Collection();
  // await em.persistAndFlush(newCollection);
  // console.log("Collection saved:", newCollection);

  // // Find all articles
  // const articles = await articleRepository.findAll();
  // console.log("All articles:", articles);
}

// Run if this file is executed directly
// if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
//   main().catch(console.error);
// }
