import {
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
  Collection as MikroCollection,
  Opt,
} from "@mikro-orm/core";
import { Article } from "./Article.js";
import { ArticleInCollection } from "./ArticleInCollection.js";

@Entity()
export class Collection {
  @PrimaryKey()
  id!: number;

  @ManyToMany(() => Article)
  @ManyToMany({ entity: () => Article, pivotEntity: () => ArticleInCollection })
  articles!: MikroCollection<Article>;

  @Property({ type: "date" })
  createdAt: Date & Opt = new Date();

  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}
