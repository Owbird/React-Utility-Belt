import chalk from "chalk";
import { spawn } from "child_process";

interface runCMDArgs {
  cwd: string;
  args: string[];
  cmd?: string;
}

export const logger = {
  info: (text: string) => console.log(chalk.cyanBright(text)),
  error: (text: string) => console.log(chalk.red(text))
};

export async function runCMD({ cmd = "pnpm", args, cwd }: runCMDArgs) {
  await new Promise<void>((resolve, reject) => {
    if (cmd === "pnpm") {
      cmd = "npx";

      args = ["--yes", "pnpm", ...args];
    }

    const child = spawn(cmd, args, {
      cwd
    });

    child.stdout.on("data", (chunk) => console.log(chalk.green(chunk)));
    child.stderr.on("data", (chunk) => console.log(chalk.red(chunk)));

    child.on("close", () => resolve());
  });
}
