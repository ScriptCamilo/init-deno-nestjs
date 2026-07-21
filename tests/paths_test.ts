import { resolve } from "node:path";
import { pathExists, resolveDestination } from "../src/paths.ts";
import { assert, assertEquals } from "./test_helpers.ts";

Deno.test("resolveDestination resolves and normalizes relative paths", () => {
  assertEquals(
    resolveDestination("./projects/../my-api", "/workspace"),
    resolve("/workspace/my-api"),
  );
});

Deno.test("resolveDestination rejects an empty value", () => {
  let thrown = false;
  try {
    resolveDestination("   ", "/workspace");
  } catch {
    thrown = true;
  }
  assert(thrown);
});

Deno.test("pathExists distinguishes existing and missing paths", async () => {
  const directory = await Deno.makeTempDir();
  try {
    assert(await pathExists(directory));
    assert(!(await pathExists(resolve(directory, "missing"))));
  } finally {
    await Deno.remove(directory, { recursive: true });
  }
});
