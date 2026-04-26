import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Command } from "commander";
import { registerProjectsCommands } from "./projects.js";
import type { ApiClient } from "../api-client.js";

function buildProgram(client: ApiClient): Command {
  const program = new Command();
  program.exitOverride();
  registerProjectsCommands(program, () => client);
  return program;
}

describe("projects commands", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("list", () => {
    it("calls /projects with default limit 25", async () => {
      const client: ApiClient = {
        get: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      };
      const program = buildProgram(client);

      await program.parseAsync(["node", "test", "projects", "list"]);

      expect(client.get).toHaveBeenCalledWith(
        "/projects",
        expect.objectContaining({ page: "1", per_page: "50" })
      );
      expect(logSpy).toHaveBeenCalledWith(JSON.stringify([{ id: 1 }, { id: 2 }]));
    });

    it("passes --query through as 'query' param", async () => {
      const client: ApiClient = {
        get: vi.fn().mockResolvedValue([]),
      };
      const program = buildProgram(client);

      await program.parseAsync([
        "node",
        "test",
        "projects",
        "list",
        "--query",
        "Smith",
      ]);

      expect(client.get).toHaveBeenCalledWith(
        "/projects",
        expect.objectContaining({ query: "Smith" })
      );
    });

    it("passes --modified-since through as 'modified_since' param", async () => {
      const client: ApiClient = {
        get: vi.fn().mockResolvedValue([]),
      };
      const program = buildProgram(client);

      await program.parseAsync([
        "node",
        "test",
        "projects",
        "list",
        "--modified-since",
        "2026-01-01T00:00:00Z",
      ]);

      expect(client.get).toHaveBeenCalledWith(
        "/projects",
        expect.objectContaining({ modified_since: "2026-01-01T00:00:00Z" })
      );
    });

    it("respects --limit", async () => {
      const client: ApiClient = {
        get: vi.fn().mockResolvedValue(
          Array.from({ length: 50 }, (_, i) => ({ id: i }))
        ),
      };
      const program = buildProgram(client);

      await program.parseAsync([
        "node",
        "test",
        "projects",
        "list",
        "--limit",
        "10",
      ]);

      const printed = JSON.parse(logSpy.mock.calls[0][0] as string);
      expect(printed).toHaveLength(10);
    });

    it("does NOT expose --all flag", async () => {
      const client: ApiClient = { get: vi.fn() };
      const program = buildProgram(client);

      await expect(
        program.parseAsync([
          "node",
          "test",
          "projects",
          "list",
          "--all",
        ])
      ).rejects.toThrow();
    });
  });

  describe("get", () => {
    it("calls /projects/:id and prints result", async () => {
      const client: ApiClient = {
        get: vi.fn().mockResolvedValue({ id: 42, name: "Test" }),
      };
      const program = buildProgram(client);

      await program.parseAsync(["node", "test", "projects", "get", "42"]);

      expect(client.get).toHaveBeenCalledWith("/projects/42");
      expect(logSpy).toHaveBeenCalledWith(
        JSON.stringify({ id: 42, name: "Test" })
      );
    });
  });

  describe("photos", () => {
    it("calls /projects/:id/photos with default limit 25", async () => {
      const client: ApiClient = {
        get: vi.fn().mockResolvedValue([{ id: "p1" }]),
      };
      const program = buildProgram(client);

      await program.parseAsync(["node", "test", "projects", "photos", "42"]);

      expect(client.get).toHaveBeenCalledWith(
        "/projects/42/photos",
        expect.objectContaining({ page: "1", per_page: "50" })
      );
      expect(logSpy).toHaveBeenCalledWith(JSON.stringify([{ id: "p1" }]));
    });

    it("respects --limit", async () => {
      const client: ApiClient = {
        get: vi.fn().mockResolvedValue(
          Array.from({ length: 50 }, (_, i) => ({ id: `p${i}` }))
        ),
      };
      const program = buildProgram(client);

      await program.parseAsync([
        "node",
        "test",
        "projects",
        "photos",
        "42",
        "--limit",
        "5",
      ]);

      const printed = JSON.parse(logSpy.mock.calls[0][0] as string);
      expect(printed).toHaveLength(5);
    });

    it("--all fetches across pages", async () => {
      let calls = 0;
      const client: ApiClient = {
        get: vi.fn().mockImplementation(async () => {
          calls++;
          if (calls === 1)
            return Array.from({ length: 50 }, (_, i) => ({ id: `p${i}` }));
          return Array.from({ length: 10 }, (_, i) => ({ id: `p${50 + i}` }));
        }),
      };
      const program = buildProgram(client);

      await program.parseAsync([
        "node",
        "test",
        "projects",
        "photos",
        "42",
        "--all",
      ]);

      const printed = JSON.parse(logSpy.mock.calls[0][0] as string);
      expect(printed).toHaveLength(60);
    });
  });
});
