#!/usr/bin/env -S deno run -A

import { relative } from "node:path";
import { CommandError, isGitAvailable } from "./src/commands.ts";
import { createProject } from "./src/create_project.ts";
import { resolveDestination } from "./src/paths.ts";

export const TEMPLATE_REPOSITORY =
  "https://github.com/scriptcamilo/deno-nestjs-template.git";

export interface CliEnvironment {
  cwd: string;
  gitAvailable: () => Promise<boolean>;
  create: typeof createProject;
  log: (message: string) => void;
  error: (message: string) => void;
}

const defaultEnvironment: CliEnvironment = {
  cwd: Deno.cwd(),
  gitAvailable: isGitAvailable,
  create: createProject,
  log: console.log,
  error: console.error,
};

export async function runCli(
  args: string[],
  environment: CliEnvironment = defaultEnvironment,
): Promise<number> {
  const projectArgument = args[0];
  if (!projectArgument) {
    environment.error("Error: the project name is required.\n");
    environment.error(usage());
    return 1;
  }

  let destination: string;
  try {
    destination = resolveDestination(projectArgument, environment.cwd);
  } catch (error) {
    environment.error(`Error: ${errorMessage(error)}`);
    return 1;
  }

  if (!(await environment.gitAvailable())) {
    environment.error(
      "Error: Git is required to create a project.\nInstall Git and try again.",
    );
    return 1;
  }

  environment.log(`Creating a Deno NestJS project in ${projectArgument}\n`);

  try {
    await environment.create({
      destination,
      repository: TEMPLATE_REPOSITORY,
    });
  } catch (error) {
    const message = error instanceof CommandError &&
        error.command === "git" && error.args[0] === "clone"
      ? "failed to clone the project template.\nCheck your internet connection and try again."
      : errorMessage(error);
    environment.error(`Error: ${message}`);
    return 1;
  }

  environment.log("✔ Cloned template");
  environment.log("✔ Removed template Git history");
  environment.log("✔ Initialized new Git repository");
  environment.log("\nProject created successfully.\n");

  const displayPath = relative(environment.cwd, destination) || ".";
  environment.log(`Next steps:\n\n  cd ${displayPath}\n  deno task dev`);
  return 0;
}

export function usage(): string {
  return "Usage:\n" +
    "  deno run -A jsr:@scriptcamilo/init-deno-nestjs <project-name>\n\n" +
    "Example:\n" +
    "  deno run -A jsr:@scriptcamilo/init-deno-nestjs my-api";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

if (import.meta.main) {
  Deno.exit(await runCli(Deno.args));
}
