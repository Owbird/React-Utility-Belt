import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import runApp from "./app.js";
import { Options } from "./types/index.js";

"React Utility Belt".split(" ").forEach((word) => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  const color = chalk.rgb(r, g, b);

  console.log(color.bold(figlet.textSync(word)));
});

const program = new Command();

program
  .version("1.0.0")
  .description("A set of utilities to easily handle react projects")
  .option("-m, --migrate [value]", "Migration type")
  .option("-p, --path <value>", "Path to codebase")
  .parse(process.argv);

const options = program.opts() as Options;

runApp(options);
