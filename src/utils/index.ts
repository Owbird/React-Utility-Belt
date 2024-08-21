import chalk from "chalk";
import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

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

export class ProjectValidator {
  private static exists(path: string) {
    if (!existsSync(path)) {
      logger.error(`[!] Path "${path}" does not exist`);

      process.exit(1);
    }
  }

  private static isValidProject(path: string) {
    this.exists(path);

    const packageJsonPath = join(path, "package.json");

    this.exists(packageJsonPath);
  }

  public static isCRAProject(path: string) {
    this.isValidProject(path);

    const packageJsonPath = join(path, "package.json");

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

    const scripts = Object.values(packageJson.scripts);

    const craExists = scripts.some((script) =>
      (script as string).includes("react-scripts")
    );

    if (!craExists) {
      logger.error(`[!] Path "${path}" is not a CRA project`);

      process.exit(1)
    }
  }
}
