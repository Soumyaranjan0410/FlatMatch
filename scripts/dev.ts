import { spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function ensureEnv() {
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "file:./dev.db";
  if (!process.env.SESSION_SECRET) process.env.SESSION_SECRET = "flatmatch-local-dev-secret";
  const envFile = path.join(root, ".env");
  if (!existsSync(envFile)) {
    writeFileSync(
      envFile,
      'DATABASE_URL="file:./dev.db"\nSESSION_SECRET="flatmatch-local-dev-secret"\n',
      "utf8",
    );
  }
}

function runNode(script: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(script)} ${args.join(" ")} exited ${code ?? signal}`));
    });
  });
}

async function main() {
  ensureEnv();

  const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");
  const tsxCli = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");
  const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");

  await runNode(prismaCli, ["generate"]);
  await runNode(prismaCli, ["db", "push", "--skip-generate"]);
  await runNode(tsxCli, ["prisma/seed.ts"]);

  const next = spawn(process.execPath, [nextCli, "dev", "--hostname", "0.0.0.0", "--port", "3847"], {
    cwd: root,
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  });

  next.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });

  function stop() {
    if (!next.killed) next.kill();
  }

  process.on("SIGINT", () => {
    stop();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    stop();
    process.exit(0);
  });

  next.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
