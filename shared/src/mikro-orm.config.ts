import { BetterSqliteDriver, defineConfig } from "@mikro-orm/better-sqlite";
import { Migrator } from "@mikro-orm/migrations";
import { Article } from "./entities/Article.js";
import { ArticleInCollection } from "./entities/ArticleInCollection.js";
import { Collection } from "./entities/Collection.js";

const config = defineConfig({
  driver: BetterSqliteDriver,
  dbName: "../data/database.sqlite",
  entities: [Article, Collection, ArticleInCollection],
  //   entitiesTs: ["./src/entities/**/*.ts"],
  extensions: [Migrator],
  debug: true,
});

export default config;
