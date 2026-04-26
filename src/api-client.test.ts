import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiClient } from "./api-client.js";

const config = { baseUrl: "https://api.companycam.com/v2", apiKey: "test-key" };

describe("createApiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends Bearer token on GET", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const client = createApiClient(config);
    const result = await client.get("/projects/1");

    expect(result).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.companycam.com/v2/projects/1",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          Accept: "application/json",
        }),
      })
    );
  });

  it("appends query params", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal("fetch", mockFetch);

    const client = createApiClient(config);
    await client.get("/projects", { page: "1", per_page: "50", query: "abc" });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("?");
    expect(url).toContain("page=1");
    expect(url).toContain("per_page=50");
    expect(url).toContain("query=abc");
  });

  it("throws on non-ok response with status and body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: () => Promise.resolve('{"error":"not found"}'),
    });
    vi.stubGlobal("fetch", mockFetch);

    const client = createApiClient(config);
    await expect(client.get("/projects/999")).rejects.toThrow(
      /API error \(404 Not Found\): \{"error":"not found"\}/
    );
  });

  it("retries once on 429 with Retry-After honored", async () => {
    const okResponse = { ok: true, json: () => Promise.resolve({ id: 1 }) };
    const rateLimited = {
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      headers: { get: (h: string) => (h === "Retry-After" ? "0" : null) },
      text: () => Promise.resolve("rate limited"),
    };
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(rateLimited)
      .mockResolvedValueOnce(okResponse);
    vi.stubGlobal("fetch", mockFetch);

    const client = createApiClient(config);
    const result = await client.get("/projects/1");

    expect(result).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("gives up after max retries on persistent 429", async () => {
    const rateLimited = {
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      headers: { get: () => "0" },
      text: () => Promise.resolve("rate limited"),
    };
    const mockFetch = vi.fn().mockResolvedValue(rateLimited);
    vi.stubGlobal("fetch", mockFetch);

    const client = createApiClient(config);
    await expect(client.get("/projects/1")).rejects.toThrow(/429/);
    expect(mockFetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
  });
});
