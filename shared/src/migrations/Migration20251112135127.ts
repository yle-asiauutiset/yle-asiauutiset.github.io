import { Migration } from '@mikro-orm/migrations';

export class Migration20251112135127 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`article\` (\`url\` text not null, \`title\` text not null, \`description\` text null, \`body\` text null, \`image_url\` text null, \`published_at\` date null, \`corrected_title\` text null, \`did_process_title\` integer not null default false, \`created_at\` date not null, \`updated_at\` date not null, primary key (\`url\`));`);

    this.addSql(`create table \`collection\` (\`id\` integer not null primary key autoincrement, \`created_at\` date not null, \`updated_at\` date not null);`);

    this.addSql(`create table \`article_in_collection\` (\`article_url\` text not null, \`collection_id\` integer not null, \`order\` integer not null, constraint \`article_in_collection_article_url_foreign\` foreign key(\`article_url\`) references \`article\`(\`url\`) on update cascade, constraint \`article_in_collection_collection_id_foreign\` foreign key(\`collection_id\`) references \`collection\`(\`id\`) on update cascade, primary key (\`article_url\`, \`collection_id\`));`);
    this.addSql(`create index \`article_in_collection_article_url_index\` on \`article_in_collection\` (\`article_url\`);`);
    this.addSql(`create index \`article_in_collection_collection_id_index\` on \`article_in_collection\` (\`collection_id\`);`);
  }

}
