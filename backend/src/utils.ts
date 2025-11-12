import { generateObject, generateText } from "ai";

export const logLLMTextResponse = (
  res: Awaited<ReturnType<typeof generateText>>
) => {
  console.log("=== LLM Response Log ===");
  console.log(`Response from LLM (${res.text.length})`, res.text);
  console.log("========================");
  console.log(`Response:`, JSON.stringify(res.response, null, 2));
  console.log("========================");
  console.log(`Response total tokens:`, res.usage.totalTokens);

  return res;
};

export const logLLMObjectResponse = <
  T extends Awaited<ReturnType<typeof generateObject>>,
>(
  res: T
): T => {
  console.log("=== LLM Response Log ===");
  console.log(`Response from LLM`, res.object);
  console.log("========================");
  console.log(`Response:`, JSON.stringify(res as any, null, 2));
  console.log("========================");
  console.log(`Response total tokens:`, res.usage.totalTokens);

  return res;
};
