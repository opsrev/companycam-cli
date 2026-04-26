import { describe, it, expect, vi } from "vitest";
import { paginate } from "./api-helpers.js";
import type { ApiClient } from "./api-client.js";

function makeClient(pages: unknown[][]): { client: ApiClient; calls: any[] } {
  const calls: any[] = [];
  let i = 0;
  const client: ApiClient = {
    get: vi.fn(async (path: string, params?: Record<string, string>) => {
      calls.push({ path, params });
      const page = pages[i++] ?? [];
      return page;
    }),
  };
  return { client, calls };
}

describe("paginate", () => {
  it("stops on a short page", async () => {
    const { client, calls } = makeClient([
      Array.from({ length: 50 }, (_, i) => ({ id: i })),
      Array.from({ length: 10 }, (_, i) => ({ id: 50 + i })),
    ]);

    const result = await paginate(client, "/projects", {}, Infinity);

    expect(result).toHaveLength(60);
    expect(calls).toHaveLength(2);
    expect(calls[0].params).toMatchObject({ page: "1", per_page: "50" });
    expect(calls[1].params).toMatchObject({ page: "2", per_page: "50" });
  });

  it("respects a finite limit and stops early", async () => {
    const { client, calls } = makeClient([
      Array.from({ length: 50 }, (_, i) => ({ id: i })),
      Array.from({ length: 50 }, (_, i) => ({ id: 50 + i })),
    ]);

    const result = await paginate(client, "/projects", {}, 25);

    expect(result).toHaveLength(25);
    expect(calls).toHaveLength(1);
  });

  it("returns empty when first page is empty", async () => {
    const { client, calls } = makeClient([[]]);

    const result = await paginate(client, "/projects", {}, Infinity);

    expect(result).toEqual([]);
    expect(calls).toHaveLength(1);
  });

  it("merges caller params with pagination params", async () => {
    const { client, calls } = makeClient([[]]);

    await paginate(client, "/projects", { query: "house" }, Infinity);

    expect(calls[0].params).toEqual({
      query: "house",
      page: "1",
      per_page: "50",
    });
  });

  it("trims overshoot to limit", async () => {
    const { client } = makeClient([
      Array.from({ length: 50 }, (_, i) => ({ id: i })),
    ]);

    const result = await paginate(client, "/projects", {}, 30);

    expect(result).toHaveLength(30);
  });
});
