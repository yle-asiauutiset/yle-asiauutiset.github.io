import "reflect-metadata";
import { DataSource } from "typeorm";
import { Article } from "./entities/Article";
import { Collection } from "./entities/Collection";
import { ArticleInCollection } from "./entities";

const _dataSource = new DataSource({
  type: "better-sqlite3",
  database: "../data/database.sqlite",
  synchronize: true, // Auto-create tables (disable in production!)
  logging: true,
  entities: [Article, Collection, ArticleInCollection],
});

export const getDataSource = async () => {
  if (!_dataSource.isInitialized) {
    await _dataSource.initialize();
    console.info("Data Source has been initialized!");
  }

  return _dataSource;
};
