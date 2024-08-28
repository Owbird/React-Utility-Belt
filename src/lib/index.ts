import { select } from "@inquirer/prompts";
import { logger } from "../utils/index.js";
import { CRAToVite } from "./migrate.js";
import { Command } from "commander";

const supportedMigrations = ["cra-to-vite"] as const;

type SupportedMigration = (typeof supportedMigrations)[number];

export function generateMigrateCmd() {
  return new Command("migrate")
    .description("Migrate project")
    .requiredOption("-p, --path <VALUE>", "Path to codebase")
    .option("-t, --type <VALUE>", "Type of migration")
    .showHelpAfterError()
    .action((args) => {
      const options = args as MigrationOptions;

      handleMigration(options);
    });
}

export async function handleMigration(options: MigrationOptions) {
  const { type, path } = options;

  const hasMigrationType = typeof type === "string";

  let choice = type;

  if (!hasMigrationType) {
    choice = await select({
      message: "Select migration type",
      choices: supportedMigrations.map((type) => ({
        value: type
      }))
    });
  }

  const isSupportedMigration = supportedMigrations.includes(
    type?.toString().toLowerCase() as SupportedMigration
  );

  if (!isSupportedMigration && hasMigrationType) {
    logger.error(`"${type}" is not supported yet\n`);

    choice = await select({
      message: "Select migration type",
      choices: supportedMigrations.map((type) => ({
        value: type
      }))
    });
  }

  switch (choice as SupportedMigration) {
    case "cra-to-vite":
      CRAToVite(path);
      break;

    default:
      break;
  }
}
