# init-deno-nestjs

Initialize a NestJS project configured to run with Deno.

## Usage

Requirements: [Deno](https://deno.com/) 2, Git, and an internet connection.

```sh
deno run -A jsr:@scriptcamilo/init-deno-nestjs my-api
```

To pin the CLI version:

```sh
deno run -A jsr:@scriptcamilo/init-deno-nestjs@0.1.0 my-api
```

Then:

```sh
cd my-api
deno task dev
```

The `-A` flag grants all permissions. The CLI can instead be run with explicit
permissions (Git itself needs network and environment access in addition to the
permissions granted to the Deno process):

```sh
deno run --allow-run=git --allow-read --allow-write --allow-net \
  --allow-env jsr:@scriptcamilo/init-deno-nestjs my-api
```

## What it does

- Clones the latest template with `git clone --depth 1`.
- Removes the template's Git history.
- Initializes a new, empty Git repository on the `main` branch.

## What it does not do

- It does not install dependencies or create a commit.
- It does not rename package internals or edit template files.
- It does not configure databases, authentication, or infrastructure.

Existing destination directories are never overwritten. If creation fails, the
CLI attempts to remove only the incomplete directory created by that run.

## Development

```sh
deno task fmt
deno task lint
deno task check
deno task test
deno task publish:dry
```

## License

MIT
