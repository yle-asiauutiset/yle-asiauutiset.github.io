import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Article } from "./Article.js";
import { Collection } from "./Collection.js";

@Entity({ tableName: "article_in_collection" })
export class ArticleInCollection {
  // @PrimaryKey({ type: "string" })
  // articleUrl!: string;

  // @PrimaryKey({ type: "number" })
  // collectionId!: number;

  @ManyToOne(() => Article, { primary: true })
  article!: Article;

  @ManyToOne(() => Collection, { primary: true })
  collection!: Collection;

  @Property({ type: "number" })
  order!: number;
}
