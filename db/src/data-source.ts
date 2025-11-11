import "reflect-metadata";
import { DataSource } from "typeorm";
import { Article } from "./entities/Article";
import { Frontpage } from "./entities/Frontpage";

const _dataSource = new DataSource({
  type: "better-sqlite3",
  database: "../data/database.sqlite",
  synchronize: true, // Auto-create tables (disable in production!)
  logging: true,
  entities: [Article, Frontpage],
});

export const getDataSource = async () => {
  if (!_dataSource.isInitialized) {
    await _dataSource.initialize();
    console.info("Data Source has been initialized!");
  }

  return _dataSource;
};
