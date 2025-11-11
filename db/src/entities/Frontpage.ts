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
export class Frontpage {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToMany(() => Article, (article) => article.frontpages, { cascade: true })
  @JoinTable()
  articles!: Article[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
