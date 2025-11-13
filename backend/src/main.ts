import "dotenv/config";
import { getDataSource } from "shared";
import { fileURLToPath } from "url";
import { fetchArticles } from "./tasks/fetch-articles";
import { processArticles } from "./tasks/process-articles";

// Run if this file is executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  (async () => {
    await fetchArticles().catch(console.error);
    await processArticles().catch(console.error);
    await getDataSource().then((ds) => ds.close());
  })();
}
