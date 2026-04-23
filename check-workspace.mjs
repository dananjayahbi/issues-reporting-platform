import { spawn } from "node:child_process";
import process from "node:process";

function writeLine(line = "") {
  process.stdout.write(`${line}\n`);
}

const tasks = [
  {
    name: "ESLint",
    command: "npx eslint . --ext .ts --ext .tsx --max-warnings 0",
  },
  {
    name: "TypeScript",
    command: "npm run typecheck",
  },
  {
    name: "Next build",
    command: "npm run build",
  },
];

function runTask(task) {
  return new Promise((resolve) => {
    const startedAt = Date.now();

    writeLine(`\n${"=".repeat(72)}`);
    writeLine(`Running ${task.name}`);
    writeLine(`${"=".repeat(72)}`);

    const child = spawn(task.command, {
      cwd: process.cwd(),
      shell: true,
      stdio: "inherit",
      env: process.env,
    });

    child.on("exit", (code) => {
      resolve({
        name: task.name,
        code: code ?? 1,
        durationMs: Date.now() - startedAt,
      });
    });
  });
}

const results = [];

for (const task of tasks) {
  const result = await runTask(task);
  results.push(result);
}

writeLine(`\n${"=".repeat(72)}`);
writeLine("Workspace check summary");
writeLine(`${"=".repeat(72)}`);

for (const result of results) {
  const status = result.code === 0 ? "PASS" : "FAIL";
  const seconds = (result.durationMs / 1000).toFixed(1);
  writeLine(`${status.padEnd(5)} ${result.name} (${seconds}s)`);
}

const failed = results.filter((result) => result.code !== 0);

if (failed.length > 0) {
  console.error(`\n${failed.length} check(s) failed.`);
  process.exit(1);
}

writeLine("\nAll workspace checks passed.");
