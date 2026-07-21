import { join } from "node:path";
import { runCommand } from "./commands.ts";
import { pathExists } from "./paths.ts";

export interface CreateProjectOptions {
  destination: string;
  repository: string;
}

export interface CreateProjectDependencies {
  run: typeof runCommand;
  exists: typeof pathExists;
  remove: typeof Deno.remove;
}

const defaultDependencies: CreateProjectDependencies = {
  run: runCommand,
  exists: pathExists,
  remove: Deno.remove,
};

export async function createProject(
  options: CreateProjectOptions,
  dependencies: CreateProjectDependencies = defaultDependencies,
): Promise<void> {
  const { destination, repository } = options;

  if (await dependencies.exists(destination)) {
    throw new Error(`destination already exists: ${destination}`);
  }

  let cloneStarted = false;
  try {
    cloneStarted = true;
    await dependencies.run("git", [
      "clone",
      "--depth",
      "1",
      repository,
      destination,
    ]);

    await dependencies.remove(join(destination, ".git"), { recursive: true });
    await dependencies.run("git", ["init"], { cwd: destination });
  } catch (error) {
    if (cloneStarted && await dependencies.exists(destination)) {
      try {
        await dependencies.remove(destination, { recursive: true });
      } catch {
        // Keep the original error: it is the most useful failure to report.
      }
    }
    throw error;
  }
}
