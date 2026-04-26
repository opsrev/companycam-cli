import type { CompanyCamConfig } from "./config.js";

export interface ApiClient {
  get(path: string, params?: Record<string, string>): Promise<unknown>;
}

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  const response = await fetch(url, init);

  if (response.status === 429 && retries > 0) {
    const retryAfter = response.headers.get("Retry-After");
    const retryAfterSec = retryAfter ? parseInt(retryAfter, 10) : NaN;
    const delay = Number.isFinite(retryAfterSec)
      ? retryAfterSec * 1000
      : INITIAL_DELAY_MS * Math.pow(2, MAX_RETRIES - retries);
    await sleep(delay);
    return fetchWithRetry(url, init, retries - 1);
  }

  return response;
}

export function createApiClient(config: CompanyCamConfig): ApiClient {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    Accept: "application/json",
  };

  async function doGet(
    path: string,
    params?: Record<string, string>
  ): Promise<unknown> {
    let url = `${config.baseUrl}${path}`;
    if (params && Object.keys(params).length > 0) {
      url += `?${new URLSearchParams(params).toString()}`;
    }
    const response = await fetchWithRetry(url, { headers });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `API error (${response.status} ${response.statusText}): ${text}`
      );
    }

    return response.json();
  }

  return {
    get: doGet,
  };
}
