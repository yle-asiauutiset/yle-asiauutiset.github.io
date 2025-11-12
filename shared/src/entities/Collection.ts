import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ManyToMany, JoinTable } from "typeorm";
import { Article } from "./Article";

@Entity()
export class Collection {
  @PrimaryGeneratedColumn()
  id!: number;

  // @ManyToMany(() => Article)
  // @JoinTable({
  //   name: "article_in_collection",
  // })
  // articles!: Article[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
