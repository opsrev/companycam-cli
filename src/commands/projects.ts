import type { Command } from "commander";
import type { ApiClient } from "../api-client.js";
import { paginate } from "../api-helpers.js";

const DEFAULT_LIMIT = 25;

export function registerProjectsCommands(
  parentCmd: Command,
  getClient: () => ApiClient
): void {
  const projects = parentCmd
    .command("projects")
    .description("Project operations");

  projects
    .command("list")
    .description("List/search projects (paginated)")
    .option("--query <text>", "Filter by name or address line 1")
    .option(
      "--modified-since <iso8601>",
      "Return projects modified at or after this ISO 8601 timestamp"
    )
    .option("--limit <n>", "Max total results (default: 25)")
    .action(async (opts) => {
      const limit = opts.limit ? parseInt(opts.limit, 10) : DEFAULT_LIMIT;
      const params: Record<string, string> = {};
      if (opts.query) params.query = opts.query;
      if (opts.modifiedSince) params.modified_since = opts.modifiedSince;

      const result = await paginate(getClient(), "/projects", params, limit);
      console.log(JSON.stringify(result));
    });

  projects
    .command("get")
    .argument("<projectId>", "Project ID")
    .description("Get a single project by ID")
    .action(async (projectId: string) => {
      const result = await getClient().get(`/projects/${projectId}`);
      console.log(JSON.stringify(result));
    });

  projects
    .command("photos")
    .argument("<projectId>", "Project ID")
    .description("List photos for a project (paginated)")
    .option("--limit <n>", "Max total results (default: 25)")
    .option("--all", "Fetch all photos for the project")
    .action(async (projectId: string, opts) => {
      const limit = opts.all
        ? Infinity
        : opts.limit
        ? parseInt(opts.limit, 10)
        : DEFAULT_LIMIT;

      const result = await paginate(
        getClient(),
        `/projects/${projectId}/photos`,
        {},
        limit
      );
      console.log(JSON.stringify(result));
    });
}
