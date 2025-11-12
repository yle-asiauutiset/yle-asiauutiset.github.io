import "reflect-metadata";
import { DataSource } from "typeorm";
import { fileURLToPath } from "url";
import { Article } from "./entities/Article";
import { Collection } from "./entities/Collection";
import { getDataSource } from "./data-source";

// Example usage
async function main() {
  const dataSource = await getDataSource();

  // Create a new user
  const articleRepository = dataSource.getRepository(Article);
  const frontpageRepository = dataSource.getRepository(Collection);

  // const newArticle = articleRepository.create({
  //   title: "New Article",
  //   imageUrl: "http://example.com/image.jpg",
  //   url: "http://example.com/article",
  // });

  // await articleRepository.save(newArticle);
  // console.log("Article saved:", newArticle);

  // const newFrontpage = frontpageRepository.create({
  //   articles: [newArticle],
  // });

  // await frontpageRepository.save(newFrontpage);
  // console.log("Frontpage saved:", newFrontpage);

  // // Find all users
  // const users = await articleRepository.find();
  // console.log("All articles:", users);
}

// Run if this file is executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(console.error);
}
