import { spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

if (!existsSync(".env")) {
  writeFileSync(
    ".env",
    'DATABASE_URL="file:./dev.db"\nSESSION_SECRET="flatmatch-local-dev-secret"\n',
  );
}

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

await run("npx", ["prisma", "generate"]);
await run("npx", ["prisma", "db", "push", "--skip-generate"]);
await run("npx", ["tsx", "prisma/seed.ts"]);

const next = spawn("npx", ["next", "dev", "--hostname", "0.0.0.0", "--port", "3847"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

next.on("exit", (code) => process.exit(code ?? 0));
