import { Entity, Opt, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Article {
  @PrimaryKey({ type: "string" })
  url!: string;

  @Property({ type: "string" })
  title!: string;

  @Property({ type: "string", nullable: true })
  description?: string;

  @Property({ type: "string", nullable: true })
  body?: string;

  @Property({ type: "string", nullable: true })
  imageUrl?: string;

  @Property({ type: "date", nullable: true })
  publishedAt?: Date;

  @Property({ type: "string", nullable: true })
  correctedTitle?: string;

  @Property({ type: "boolean", default: false })
  didProcessTitle: boolean & Opt = false;

  // @ManyToMany(() => Collection, (collection) => collection.articles)
  // collections!: MikroCollection<Collection>;

  @Property({ type: "date" })
  createdAt: Date & Opt = new Date();

  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}
