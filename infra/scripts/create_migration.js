import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir =
  import.meta.dirname || path.dirname(fileURLToPath(import.meta.url));

function getProjectRootDirectory() {
  return path.join(currentDir, "..", "..");
}

function getMigrationsDirectory() {
  return path.join(getProjectRootDirectory(), "infra", "migrations");
}

function getMigrationName() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Error: Provide a name for the migration.");
    console.error("Example: npm run migrations:create create sessions");
    process.exit(1);
  }

  return args.join(" ");
}

function ensureDirectoryExists(directoryPath) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(directoryPath)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

function getCommandName() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

function executeMigrationCommand(migrationName) {
  console.log("Creating migration...");

  const command = getCommandName();
  const commandArgs = [
    "node-pg-migrate",
    "create",
    "-m",
    "infra/migrations",
    migrationName,
  ];

  const result = spawnSync(command, commandArgs, {
    cwd: getProjectRootDirectory(),
    stdio: "inherit",
  });

  if (result.error || result.status !== 0) {
    console.error("Error executing node-pg-migrate.");
    process.exit(1);
  }
}

function getMigrationFiles(directory) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs
    .readdirSync(directory)
    .filter((filename) => /^\d+.*\.js$/.test(filename));
}

function findNewlyCreatedFile(filesBefore, filesAfter) {
  const newFiles = filesAfter.filter((file) => !filesBefore.includes(file));

  if (newFiles.length === 0) {
    return null;
  }

  return newFiles.sort().pop();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function renameFileToMjs(filename) {
  if (!filename) {
    console.log("Warning: No new migration file detected to rename.");
    return;
  }

  const migrationsDir = getMigrationsDirectory();
  const oldPath = path.join(migrationsDir, filename);
  const newPath = path.join(migrationsDir, filename.slice(0, -3) + ".mjs");
  const maxRetries = 5;
  const delayMs = 100;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.renameSync(oldPath, newPath);
      console.log(`Extension adjusted: ${path.basename(newPath)}`);
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(
          `Error: Could not rename file after ${maxRetries} attempts.`,
        );
        throw error;
      }
      await delay(delayMs);
    }
  }
}

async function main() {
  const migrationsDir = getMigrationsDirectory();
  const migrationName = getMigrationName();

  ensureDirectoryExists(migrationsDir);

  const filesBeforeExecution = getMigrationFiles(migrationsDir);

  executeMigrationCommand(migrationName);

  const filesAfterExecution = getMigrationFiles(migrationsDir);

  const newlyCreatedFile = findNewlyCreatedFile(
    filesBeforeExecution,
    filesAfterExecution,
  );

  await renameFileToMjs(newlyCreatedFile);
}

main().catch((error) => {
  console.error("Critical Unhandled Error:", error);
  process.exit(1);
});
