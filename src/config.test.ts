import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getConfig } from "./config.js";

describe("getConfig", () => {
  const originalEnv = process.env.COMPANYCAM_API_KEY;

  beforeEach(() => {
    delete process.env.COMPANYCAM_API_KEY;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.COMPANYCAM_API_KEY = originalEnv;
    }
  });

  it("uses --api-key flag when provided", () => {
    process.env.COMPANYCAM_API_KEY = "from-env";
    const config = getConfig({ apiKey: "from-flag" });
    expect(config.apiKey).toBe("from-flag");
  });

  it("falls back to COMPANYCAM_API_KEY env var", () => {
    process.env.COMPANYCAM_API_KEY = "from-env";
    const config = getConfig({});
    expect(config.apiKey).toBe("from-env");
  });

  it("throws when no key is provided", () => {
    expect(() => getConfig({})).toThrow(/COMPANYCAM_API_KEY/);
  });

  it("returns the production base URL", () => {
    const config = getConfig({ apiKey: "k" });
    expect(config.baseUrl).toBe("https://api.companycam.com/v2");
  });
});
