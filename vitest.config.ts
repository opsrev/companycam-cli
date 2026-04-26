import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    env: {
      COMPANYCAM_API_KEY: "test-key",
    },
  },
});
