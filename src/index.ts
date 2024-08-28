import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import { generateMigrateCmd } from "./lib/index.js";

"React Utility Belt".split(" ").forEach((word) => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  const color = chalk.rgb(r, g, b);

  console.log(color.bold(figlet.textSync(word)));
});

const program = new Command("react-utility-belt");

program
  .version("0.0.1")
  .description("A set of utilities to easily handle react projects")
  .addCommand(generateMigrateCmd())
  .action(() => program.help())
  .parse(process.argv);
