import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      COMPANYCAM_API_KEY: "test-key",
    },
  },
});
