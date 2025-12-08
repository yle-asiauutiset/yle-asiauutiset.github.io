type DateString = string;

type Article = {
  url: string;
  title: string;
  description?: string;
  body?: string;
  imageUrl?: string;
  publishedAt?: DateString;
  correctedTitle?: string;
  didProcessTitle?: boolean;
  createdAt?: DateString;
  updatedAt?: DateString;
};

export type Feed = {
  articles: Array<Article>;
  generatedAt?: DateString;
};
