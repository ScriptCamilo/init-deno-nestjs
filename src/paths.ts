import { resolve } from "node:path";

export function resolveDestination(value: string, cwd = Deno.cwd()): string {
  if (value.trim().length === 0) {
    throw new Error("the project name or path cannot be empty.");
  }

  try {
    return resolve(cwd, value);
  } catch {
    throw new Error(`invalid destination path: ${value}`);
  }
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await Deno.lstat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false;
    throw error;
  }
}
