# YLE Asiauutiset

A web application that fetches YLE's (Finnish Broadcasting Company) most popular news articles and uses AI to improve clickbait headlines, making them more informative and accurate.

## Overview

YLE Asiauutiset is an automated news feed generator that:
- Fetches the latest news from YLE's RSS feed
- Uses AI (Anthropic Claude) to analyze articles and improve clickbait titles
- Displays articles with corrected titles while showing the original title for comparison
- Updates automatically twice daily (around 7:10 and 16:10)

**Note:** This is not an official YLE website.

## Tech Stack

**Frontend** is staticly rendered SvelteKit and Tailwind CSS project. The frontend content is baked at build time due to rate limits, previous days are fetched on demand.

**Backend** consists of a periodically running node script that fetches news articles, processes them with AI, and stores them in a SQLite database to cache results. It then uses Github Gists :) as a makeshift CMS to serve the data to the frontend.

**Infrastructure** is handled with Github Actions, Pages & GHCR. Docker image of the backend is automatically built and pushed to ghcr.io on every push. The backend will trigger a rebuild of the frontend using a webhook after processing new articles.

## Project Structure

```
yle-etusivu/
├── backend/          # News fetching & AI processing service
│   └── src/
│       ├── main.ts                    # Cron jobs, RSS fetching, AI title improvement
│       ├── title-improvement-template.ts
│       └── utils.ts
├── frontend/         # SvelteKit web application
│   └── src/
│       ├── lib/
│       │   ├── Feed.svelte           # Main feed component
│       │   ├── api.ts
│       │   └── utils.ts
│       └── routes/
│           ├── +page.svelte          # Homepage
│           ├── [date]/               # Historical views
│           └── faq/                  # FAQ page
├── shared/           # Shared code (entities, types, database)
│   └── src/
│       ├── entities/                 # MikroORM entities
│       │   ├── Article.ts
│       │   ├── Collection.ts
│       │   └── ArticleInCollection.ts
│       ├── types/
│       │   └── feed.ts
│       └── mikro-orm.config.ts
├── data/             # SQLite database storage
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Getting Started

### Environment Variables

Create a `.env` file in the project root:

```env
# Required for AI title improvement
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional
ARTICLE_COUNT=15  # Number of articles to fetch (default: 15)
```

See [`.env.example`](./backend/.env.example), [`package.json`](./package.json)

## AI Usage

Github Copilot has been used to assist in writing parts of the codebase, and most of this README.
