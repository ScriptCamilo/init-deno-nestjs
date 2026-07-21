import { join } from "node:path";
import { createProject } from "../src/create_project.ts";
import { runCommand } from "../src/commands.ts";
import { pathExists } from "../src/paths.ts";
import { assert, assertEquals } from "./test_helpers.ts";

Deno.test("createProject clones, discards history, and initializes an empty repository", async () => {
  const temporaryRoot = await Deno.makeTempDir();
  const template = join(temporaryRoot, "template");
  const destination = join(temporaryRoot, "created-project");

  try {
    await Deno.mkdir(template);
    await Deno.writeTextFile(join(template, "README.md"), "template\n");
    await runCommand("git", ["init"], { cwd: template, stdout: "null" });
    await runCommand("git", ["add", "README.md"], {
      cwd: template,
      stdout: "null",
    });
    await new Deno.Command("git", {
      args: [
        "-c",
        "user.name=Test",
        "-c",
        "user.email=test@example.com",
        "commit",
        "-m",
        "template commit",
      ],
      cwd: template,
      stdout: "null",
      stderr: "null",
    }).output();

    await createProject({ destination, repository: template });

    assert(await pathExists(join(destination, "README.md")));
    const inside = await new Deno.Command("git", {
      args: ["rev-parse", "--is-inside-work-tree"],
      cwd: destination,
      stdout: "piped",
    }).output();
    assert(inside.success);
    assertEquals(new TextDecoder().decode(inside.stdout).trim(), "true");

    const branch = await new Deno.Command("git", {
      args: ["symbolic-ref", "--short", "HEAD"],
      cwd: destination,
      stdout: "piped",
    }).output();
    assert(branch.success);
    assertEquals(new TextDecoder().decode(branch.stdout).trim(), "main");

    const log = await new Deno.Command("git", {
      args: ["log", "-1"],
      cwd: destination,
      stdout: "null",
      stderr: "null",
    }).output();
    assert(!log.success, "the generated repository must not contain commits");
  } finally {
    await Deno.remove(temporaryRoot, { recursive: true });
  }
});

Deno.test("createProject never overwrites an existing destination", async () => {
  const destination = await Deno.makeTempDir();
  try {
    let ranGit = false;
    let thrown = false;
    try {
      await createProject(
        { destination, repository: "unused" },
        {
          run: () => {
            ranGit = true;
            return Promise.resolve();
          },
          exists: pathExists,
          remove: Deno.remove,
        },
      );
    } catch (error) {
      thrown = String(error).includes("destination already exists");
    }
    assert(thrown);
    assert(!ranGit);
    assert(await pathExists(destination));
  } finally {
    await Deno.remove(destination, { recursive: true });
  }
});

Deno.test("createProject cleans a destination left by a failed clone", async () => {
  const root = await Deno.makeTempDir();
  const destination = join(root, "partial");
  try {
    let thrown = false;
    try {
      await createProject(
        { destination, repository: "unused" },
        {
          run: async () => {
            await Deno.mkdir(destination);
            throw new Error("clone failed");
          },
          exists: pathExists,
          remove: Deno.remove,
        },
      );
    } catch {
      thrown = true;
    }
    assert(thrown);
    assert(!(await pathExists(destination)));
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});
