import { select } from "@inquirer/prompts";
import { Options } from "../types/index.js";
import { logger } from "../utils/index.js";
import { CRAToVite } from "./migrate.js";

const supportedMigrations = ["cra-to-vite"] as const;

type SupportedMigration = (typeof supportedMigrations)[number];

export async function handleMigration(
  option: Options["migrate"],
  path: Options["path"]
) {
  const hasMigrationType = typeof option === "string";

  let choice = option;

  if (!hasMigrationType) {
    choice = await select({
      message: "Select migration type",
      choices: supportedMigrations.map((type) => ({
        value: type
      }))
    });
  }

  const isSupportedMigration = supportedMigrations.includes(
    option?.toString().toLowerCase() as SupportedMigration
  );

  if (!isSupportedMigration && hasMigrationType) {
    logger.error(`"${option}" is not supported yet\n`);

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
