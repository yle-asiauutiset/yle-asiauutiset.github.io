import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Collection } from "./Collection";

@Entity()
export class Article {
  @PrimaryColumn({ type: "text", nullable: false })
  url!: string;

  @Column({ type: "text", nullable: false })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "text", nullable: true })
  body?: string;

  @Column({ type: "text", nullable: true })
  imageUrl?: string;

  @Column({ type: "datetime", nullable: true })
  publishedAt?: Date;

  @Column({ type: "text", nullable: true })
  correctedTitle?: string;

  @Column({ type: "boolean", default: false })
  didProcessTitle!: boolean;

  @ManyToMany(() => Collection, (collection) => collection.articles)
  @JoinTable({
    name: "article_in_collection",
  })
  collections!: Collection[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
