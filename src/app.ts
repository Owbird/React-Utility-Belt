import { handleMigration } from "./lib/index.js";
import { Options } from "./types/index.js";
import { logger } from "./utils/index.js";

export default function runApp(options: Options) {
  if (!options.path) {
    return logger.error("A path is required");
  }

  handleMigration(options.migrate, options.path);
}
