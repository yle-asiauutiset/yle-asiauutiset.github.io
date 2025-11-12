import "reflect-metadata";
import {
  BetterSqliteDriver,
  defineConfig,
  MikroORM,
} from "@mikro-orm/better-sqlite";
import config from "./mikro-orm.config";

let _orm: Awaited<ReturnType<typeof MikroORM.init>> | null = null;

export const getDataSource = async () => {
  if (!_orm) {
    _orm = await MikroORM.init(config);
    console.info("Data Source has been initialized!");
  }

  return _orm;
};
