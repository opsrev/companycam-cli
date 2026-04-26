import type { ApiClient } from "./api-client.js";

const PAGE_SIZE = 50;

export async function paginate(
  client: ApiClient,
  path: string,
  params: Record<string, string>,
  limit: number
): Promise<unknown[]> {
  const results: unknown[] = [];
  let page = 1;

  while (true) {
    const pageParams = {
      ...params,
      page: String(page),
      per_page: String(PAGE_SIZE),
    };

    const data = (await client.get(path, pageParams)) as unknown[];
    results.push(...data);

    if (limit !== Infinity && results.length >= limit) {
      return results.slice(0, limit);
    }

    if (data.length < PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return results;
}
