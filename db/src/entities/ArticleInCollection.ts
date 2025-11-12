import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { Article } from "./Article";
import { Collection } from "./Collection";

@Entity("article_in_collection")
export class ArticleInCollection {
  @PrimaryColumn({ type: "text", nullable: false })
  articleUrl!: string;

  @PrimaryColumn({ type: "int", nullable: false })
  collectionId!: number;

  @ManyToOne(() => Article)
  @JoinTable()
  article!: Article;

  @ManyToOne(() => Collection)
  @JoinTable()
  collection!: Collection;

  @Column({ type: "int", nullable: false })
  order!: number;
}
