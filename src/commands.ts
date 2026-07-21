export interface RunCommandOptions {
  cwd?: string;
  stdin?: "inherit" | "piped" | "null";
  stdout?: "inherit" | "piped" | "null";
  stderr?: "inherit" | "piped" | "null";
}

export async function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions = {},
): Promise<void> {
  const child = new Deno.Command(command, {
    args,
    cwd: options.cwd,
    stdin: options.stdin ?? "inherit",
    stdout: options.stdout ?? "inherit",
    stderr: options.stderr ?? "inherit",
  });

  const status = await child.spawn().status;
  if (!status.success) {
    throw new CommandError(command, args, status.code);
  }
}

export class CommandError extends Error {
  constructor(
    readonly command: string,
    readonly args: string[],
    readonly code: number,
  ) {
    super(`Command failed (${code}): ${command} ${args.join(" ")}`);
    this.name = "CommandError";
  }
}

export async function isGitAvailable(): Promise<boolean> {
  try {
    await runCommand("git", ["--version"], {
      stdin: "null",
      stdout: "null",
      stderr: "null",
    });
    return true;
  } catch {
    return false;
  }
}
