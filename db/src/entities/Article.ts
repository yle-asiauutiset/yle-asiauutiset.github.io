import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Frontpage } from "./Frontpage";

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

  @ManyToMany(() => Frontpage, (frontpage) => frontpage.articles)
  frontpages!: Frontpage[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
