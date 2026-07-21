import { runCli } from "../main.ts";
import type { CliEnvironment } from "../main.ts";
import { assert, assertEquals } from "./test_helpers.ts";

function environment(messages: string[]): CliEnvironment {
  return {
    cwd: "/workspace",
    gitAvailable: () => Promise.resolve(true),
    create: () => Promise.resolve(),
    log: (message) => messages.push(message),
    error: (message) => messages.push(message),
  };
}

Deno.test("CLI requires a project argument and prints usage", async () => {
  const messages: string[] = [];
  assertEquals(await runCli([], environment(messages)), 1);
  assert(messages.join("\n").includes("Usage:"));
});

Deno.test("CLI reports unavailable Git", async () => {
  const messages: string[] = [];
  const env = environment(messages);
  env.gitAvailable = () => Promise.resolve(false);
  assertEquals(await runCli(["my-api"], env), 1);
  assert(messages.join("\n").includes("Git is required"));
});

Deno.test("CLI passes a normalized destination to project creation", async () => {
  const messages: string[] = [];
  const env = environment(messages);
  let destination = "";
  env.create = (options) => {
    destination = options.destination;
    return Promise.resolve();
  };
  assertEquals(await runCli(["./projects/../my-api"], env), 0);
  assertEquals(destination, "/workspace/my-api");
  assert(messages.join("\n").includes("deno task dev"));
});
