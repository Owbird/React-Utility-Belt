import runApp from "./app.js";
import { Options } from "./types/index.js";
import figlet from "figlet";
import { Command } from "commander";
import { logger } from "./utils/index.js";

logger.info(figlet.textSync("React Utility Belt"));

const program = new Command();

program
  .version("1.0.0")
  .description("A set of tools for a React codebase")
  .option("-m, --migrate [value]", "Migrate the codebase")
  .option("-p, --path <value>", "Path to codebase")
  .parse(process.argv);

const options = program.opts() as Options;

runApp(options);
