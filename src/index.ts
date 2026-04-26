#!/usr/bin/env node
import { Command } from "commander";
import { createApiClient } from "./api-client.js";
import { getConfig } from "./config.js";
import { registerProjectsCommands } from "./commands/projects.js";

const program = new Command();

program
  .name("companycam")
  .description("CompanyCam CLI for AI agents")
  .version("0.1.0")
  .exitOverride()
  .configureOutput({
    writeOut: (str) => process.stdout.write(str),
    writeErr: (str) => {
      const trimmed = str.trim();
      if (trimmed === "(outputHelp)") {
        return;
      } else if (trimmed.startsWith("Usage:") || trimmed.startsWith("error:")) {
        process.stderr.write(str);
      } else {
        process.stderr.write(JSON.stringify({ error: trimmed }) + "\n");
      }
    },
  })
  .option("--api-key <key>", "CompanyCam API key (env: COMPANYCAM_API_KEY)");

function getClient() {
  const config = getConfig({ apiKey: program.opts().apiKey });
  return createApiClient(config);
}

registerProjectsCommands(program, getClient);

program.parseAsync().catch((err) => {
  if (err && typeof err === "object" && "code" in err && (err.code === "commander.help" || err.code === "commander.helpDisplayed")) {
    process.exit(0);
  }
  if (err && typeof err === "object" && "code" in err && typeof err.code === "string" && err.code.startsWith("commander.")) {
    process.exit(1);
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error(JSON.stringify({ error: message }));
  process.exit(1);
});
